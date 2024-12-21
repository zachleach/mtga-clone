/* BoardContext.jsx */
import { createContext, useContext, useState, useRef } from 'react'
import { initialize_handlers } from './DragDropHandlers'
import { create_initial_stack } from './CardOperations'

const BoardStateContext = createContext(null)

/* valid row positions for type checking */
const ROW_POSITIONS = ['top', 'left', 'right']

/**
 * Custom hook providing access to board state context.
 * Throws if used outside of BoardStateProvider.
 */
export const useBoardState = () => {
  const context = useContext(BoardStateContext)
  if (!context) {
    throw new Error('useBoardState must be used within a BoardStateProvider')
  }
  return context
}

/**
 * Maintains registry of DOM references to card stacks for position calculations.
 * Uses compound keys in format 'row-stackId' to uniquely identify each stack.
 */
const useStackRefs = () => {
  const stack_refs = useRef({})

  const register_stack_ref = (row, stack_id, ref) => {
    if (!ROW_POSITIONS.includes(row)) {
      throw new Error(`Invalid row position: ${row}`)
    }
    
    const key = `${row}-${stack_id}`
    if (ref === null) {
      delete stack_refs.current[key]
    } else {
      stack_refs.current[key] = ref
    }
  }

  const get_stack_position = (row, stack_id) => {
    const key = `${row}-${stack_id}`
    const ref = stack_refs.current[key]
    if (!ref?.current) return null
    
    const rect = ref.current.getBoundingClientRect()
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      center: rect.left + (rect.width / 2)
    }
  }

  return { register_stack_ref, get_stack_position }
}

/**
 * Context provider managing state for card rows, hand, and drag/drop interactions.
 */
export const BoardStateProvider = ({ children }) => {
  /* Initialize row states */
  const [top_row, set_top_row] = useState({
    stacks: [create_initial_stack()]
  })
  
  const [left_row, set_left_row] = useState({
    stacks: [create_initial_stack()]
  })
  
  const [right_row, set_right_row] = useState({
    stacks: [create_initial_stack()]
  })

  const [hand, set_hand] = useState({
    cards: [
      { color: 'purple' },
      { color: 'orange' },
      { color: 'pink' }
    ]
  })

  /* Stack reference management */
  const { register_stack_ref, get_stack_position } = useStackRefs()

  /* Row state management utilities */
  const get_row_setter = (row) => {
    if (!ROW_POSITIONS.includes(row)) {
      throw new Error(`Invalid row position: ${row}`)
    }
    
    switch(row) {
      case 'top': return set_top_row
      case 'left': return set_left_row
      case 'right': return set_right_row
      default: return null
    }
  }

  const get_row_state = (row) => {
    if (!ROW_POSITIONS.includes(row)) {
      throw new Error(`Invalid row position: ${row}`)
    }

    switch(row) {
      case 'top': return top_row
      case 'left': return left_row
      case 'right': return right_row
      default: return null
    }
  }

  /* Initialize drag/drop handlers */
  const handlers = initialize_handlers({
    get_row_state,
    get_row_setter,
    get_stack_position,
    set_hand
  })

  /* Prepare context value */
  const value = {
    rows: [
      { id: 'top', ...top_row },
      { id: 'left', ...left_row }, 
      { id: 'right', ...right_row }
    ],
    hand,
    handlers,
    register_stack_ref
  }

  return (
    <BoardStateContext.Provider value={value}>
      {children}
    </BoardStateContext.Provider>
  )
}
/* CardOperations.jsx */
/**
 * Creates initial stack state with default cards.
 */
export const create_initial_stack = () => ({
  id: '0',
  cards: [
    { color: 'red' }, 
    { color: 'blue' }, 
    { color: 'green' }, 
    { color: 'yellow' }
  ]
})

/**
 * Generates unique stack identifier for a row.
 */
const get_unique_stack_id = (row_state) => {
  const used_ids = new Set(row_state.stacks.map(s => s.id))
  let new_id = 0
  while (used_ids.has(String(new_id))) new_id++
  return String(new_id)
}

/**
 * Creates a new stack and inserts it into the row's stack array.
 */
export const create_new_stack = (row_state, card, drop_x, row, get_stack_position) => {
  if (row_state.stacks.length === 0) {
    row_state.stacks.push({
      id: get_unique_stack_id(row_state),
      cards: [card]
    })
    return
  }

  const stack_positions = row_state.stacks
    .map(stack => ({
      stack,
      position: get_stack_position(row, stack.id)
    }))
    .filter(item => item.position !== null)

  const nearest = stack_positions.reduce((a, b) => 
    Math.abs(a.position.center - drop_x) < Math.abs(b.position.center - drop_x) ? a : b
  )

  const new_stack = {
    id: get_unique_stack_id(row_state),
    cards: [card]
  }

  const nearest_index = row_state.stacks.findIndex(s => s.id === nearest.stack.id)
  const insert_index = drop_x > nearest.position.center ? nearest_index + 1 : nearest_index
  row_state.stacks.splice(insert_index, 0, new_stack)
}

/**
 * Moves a card between stacks, handling both same-row and cross-row transfers.
 */
export const move_card = (source, target, get_row_state, get_row_setter, get_stack_position) => {
  const source_row = get_row_state(source.row)
  const source_setter = get_row_setter(source.row)
  const target_setter = get_row_setter(target.row)
  
  let moved_card = null

  source_setter(curr_state => {
    const updated_state = { ...curr_state }
    const source_stack = updated_state.stacks.find(s => s.id === source.stack_id)
    const [card] = source_stack.cards.splice(source.card_index, 1)
    moved_card = card

    if (source.row === target.row) {
      if (target.stack_id) {
        const target_stack = updated_state.stacks.find(s => s.id === target.stack_id)
        const insert_index = source.stack_id !== target.stack_id 
          ? target.card_index + 1 
          : target.card_index
        target_stack.cards.splice(insert_index, 0, card)
      } else {
        create_new_stack(updated_state, card, target.drop_x, target.row, get_stack_position)
      }
    }

    updated_state.stacks = updated_state.stacks.filter(s => s.cards.length > 0)
    return updated_state
  })

  if (source.row !== target.row) {
    setTimeout(() => {
      target_setter(curr_state => {
        const updated_state = { ...curr_state }
        if (target.stack_id) {
          const target_stack = updated_state.stacks.find(s => s.id === target.stack_id)
          target_stack.cards.splice(target.card_index + 1, 0, moved_card)
        } else {
          create_new_stack(updated_state, moved_card, target.drop_x, target.row, get_stack_position)
        }
        return updated_state
      })
    }, 0)
  }
}

/**
 * Moves a card from the hand to either a stack or a new stack in a row.
 */
export const move_card_from_hand = (source, target, set_hand, get_row_setter, get_stack_position) => {
  let moved_card = null

  set_hand(curr_state => {
    const updated_state = { ...curr_state }
    const [card] = updated_state.cards.splice(source.card_index, 1)
    moved_card = card
    return updated_state
  })

  setTimeout(() => {
    if (target.type === 'stack') {
      const target_setter = get_row_setter(target.row)
      target_setter(curr_state => {
        const updated_state = { ...curr_state }
        const target_stack = updated_state.stacks.find(s => s.id === target.stack_id)
        target_stack.cards.splice(target.card_index + 1, 0, moved_card)
        return updated_state
      })
    } else if (target.type === 'row') {
      const target_setter = get_row_setter(target.row)
      target_setter(curr_state => {
        const updated_state = { ...curr_state }
        create_new_stack(updated_state, moved_card, target.drop_x, target.row, get_stack_position)
        return updated_state
      })
    }
  }, 0)
}

/**
 * Moves a card from a stack to the hand.
 */
export const move_card_to_hand = (source, target_index, get_row_setter, set_hand) => {
  const source_setter = get_row_setter(source.row)
  let moved_card = null

  source_setter(curr_state => {
    const updated_state = { ...curr_state }
    const source_stack = updated_state.stacks.find(s => s.id === source.stack_id)
    const [card] = source_stack.cards.splice(source.card_index, 1)
    moved_card = card

    updated_state.stacks = updated_state.stacks.filter(s => s.cards.length > 0)
    return updated_state
  })

  setTimeout(() => {
    set_hand(curr_state => {
      const updated_state = { ...curr_state }
      updated_state.cards.splice(target_index, 0, moved_card)
      return updated_state
    })
  }, 0)
}

/**
 * Reorders cards within the hand.
 */
export const move_card_within_hand = (source_index, target_index, set_hand) => {
  set_hand(curr_state => {
    const updated_state = { ...curr_state }
    const [card] = updated_state.cards.splice(source_index, 1)
    updated_state.cards.splice(target_index, 0, card)
    return updated_state
  })
}
/* DragDropHandlers.jsx */
import { 
  move_card,
  move_card_from_hand,
  move_card_to_hand,
  move_card_within_hand
} from './CardOperations'

/**
 * Calculates the appropriate insertion index for a card dropped into the hand container.
 */
const calculate_hand_insert_position = (total_cards, drop_x) => {
  if (total_cards === 0) return 0

  const card_height = 200
  const card_width = card_height * 0.714
  const hand_density = 120

  /* calculate center position of hand container */
  const container_center = window.innerWidth / 2

  /* Calculate relative position from center */
  const relative_x = drop_x - container_center

  /* convert position to card index */
  const calculated_index = Math.round(relative_x / hand_density + (total_cards - 1) / 2)

  /* clamp index to valid range */
  return Math.max(0, Math.min(calculated_index, total_cards))
}

/**
 * Initializes and returns the drag/drop event handler system.
 */
export const initialize_handlers = ({
  get_row_state,
  get_row_setter,
  get_stack_position,
  set_hand
}) => ({
  /* DRAG START */
  drag_start: {
    cardstack: (e, row, stack_id, card_index) => {
      e.dataTransfer.setData('source', JSON.stringify({
        type: 'stack',
        row,
        stack_id,
        card_index
      }))
    },
    hand: (e, card_index) => {
      e.dataTransfer.setData('source', JSON.stringify({
        type: 'hand',
        card_index
      }))
    }
  },

  /* DROP EVENTS */
  drop: {
    cardstack: (e, target_row, target_stack_id, target_index) => {
      e.preventDefault()
      e.stopPropagation()

      const source = JSON.parse(e.dataTransfer.getData('source'))
      if (source.type === 'stack') {
        move_card(source, {
          row: target_row,
          stack_id: target_stack_id,
          card_index: target_index
        }, get_row_state, get_row_setter, get_stack_position)
      } else if (source.type === 'hand') {
        move_card_from_hand({
          card_index: source.card_index
        }, {
          type: 'stack',
          row: target_row,
          stack_id: target_stack_id,
          card_index: target_index
        }, set_hand, get_row_setter, get_stack_position)
      }
    },

    cardrow: (e, target_row) => {
      e.preventDefault()
      const source = JSON.parse(e.dataTransfer.getData('source'))
      if (source.type === 'stack') {
        move_card(source, {
          row: target_row,
          stack_id: null,
          drop_x: e.clientX
        }, get_row_state, get_row_setter, get_stack_position)
      } else if (source.type === 'hand') {
        move_card_from_hand({
          card_index: source.card_index
        }, {
          type: 'row',
          row: target_row,
          drop_x: e.clientX
        }, set_hand, get_row_setter, get_stack_position)
      }
    },

    hand: (e, target_index) => {
      e.preventDefault()
      e.stopPropagation()

      const source = JSON.parse(e.dataTransfer.getData('source'))
      if (source.type === 'hand') {
        move_card_within_hand(source.card_index, target_index, set_hand)
      } else if (source.type === 'stack') {
        move_card_to_hand(source, target_index, get_row_setter, set_hand)
      }
    },

    hand_container: (e, total_cards, drop_x) => {
      e.preventDefault()
      e.stopPropagation()

      const source = JSON.parse(e.dataTransfer.getData('source'))
      const insert_index = calculate_hand_insert_position(total_cards, drop_x)

      if (source.type === 'hand') {
        move_card_within_hand(source.card_index, insert_index, set_hand)
      } else if (source.type === 'stack') {
        move_card_to_hand(source, insert_index, get_row_setter, set_hand)
      }
    },
  },

  /* DRAG OVER */
  drag_over: {
    cardstack: (e) => {
      e.preventDefault()
      e.stopPropagation()
    },

    cardrow: (e) => {
      e.preventDefault()
    },

    hand: (e) => {
      e.preventDefault()
      e.stopPropagation()
    },

    hand_container: (e) => {
      e.preventDefault()
      e.stopPropagation()
    }
  }
})
