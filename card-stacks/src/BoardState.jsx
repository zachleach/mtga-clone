/* BoardState.jsx */
import { createContext, useContext, useState, useRef } from 'react'

const BoardStateContext = createContext(null)

/**
 * Custom hook providing access to board state context.
 * Throws if used outside of BoardStateProvider.
 * 
 * @returns {Object} Context containing board state and handlers
 * @throws {Error} When used outside of BoardStateProvider
 */
export const useBoardState = () => {
  const context = useContext(BoardStateContext)
  if (!context) {
    throw new Error('useBoardState must be used within a BoardStateProvider')
  }
  return context
}

/* valid row positions for type checking */
const ROW_POSITIONS = ['top', 'left', 'right']

/**
 * Context provider managing state for card rows, hand, and drag/drop interactions.
 * Maintains stack references and handles all card movement operations.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap with context
 */
export const BoardStateProvider = ({ children }) => {

  /* STATE */
  
  const create_initial_stack = () => ({
    id: '0',
    cards: [
      { color: 'red' }, 
      { color: 'blue' }, 
      { color: 'green' }, 
      { color: 'yellow' }
    ]
  })

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

  /**
   * Retrieves state setter function for specified row.
   * 
   * @param {string} row - Row identifier ('top', 'left', 'right')
   * @returns {Function} State setter function for the specified row
   * @throws {Error} If row parameter is not a valid row position
   */
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

  /**
   * Retrieves current state for specified row.
   * 
   * @param {string} row - Row identifier ('top', 'left', 'right')
   * @returns {Object} Current state of the specified row
   * @throws {Error} If row parameter is not a valid row position
   */
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

  /**
   * Generates unique stack identifier for a row.
   * 
   * @param {Object} row_state - Current state of the row
   * @returns {string} Unique stack identifier
   */
  const get_unique_stack_id = (row_state) => {
    const used_ids = new Set(row_state.stacks.map(s => s.id))
    let new_id = 0
    while (used_ids.has(String(new_id))) new_id++
    return String(new_id)
  }

  /* REFS */

  const stack_refs = useRef({})

  /**
   * Maintains registry of DOM references to card stacks for position calculations.
   * Uses compound keys in format 'row-stackId' to uniquely identify each stack.
   * Passing null as ref removes the reference, enabling cleanup on unmount.
   *
   * @param {string} row - Row identifier ('top', 'left', 'right')
   * @param {string} stack_id - Unique identifier for the stack within its row
   * @param {React.RefObject|null} ref - React ref object or null for cleanup
   * @throws {Error} If row parameter is not a valid row position
   */
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

  /**
   * Retrieves geometric positioning data for a stack using its stored DOM reference.
   * Used for calculating drop positions when creating new stacks between existing ones.
   * 
   * @param {string} row - Row identifier ('top', 'left', 'right')
   * @param {string} stack_id - Unique identifier for the stack within its row
   * @returns {Object|null} Object containing left, right, width and center coordinates,
   *                        or null if reference not found
   */
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

  /* EVENT HANDLING */

  const handlers = {
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
          })
        } else if (source.type === 'hand') {
          move_card_from_hand({
            card_index: source.card_index
          }, {
            type: 'stack',
            row: target_row,
            stack_id: target_stack_id,
            card_index: target_index
          })
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
          })
        } else if (source.type === 'hand') {
          move_card_from_hand({
            card_index: source.card_index
          }, {
            type: 'row',
            row: target_row,
            drop_x: e.clientX
          })
        }
      },

      hand: (e, target_index) => {
        e.preventDefault()
        e.stopPropagation()
        
        const source = JSON.parse(e.dataTransfer.getData('source'))
        if (source.type === 'hand') {
          move_card_within_hand(source.card_index, target_index)
        } else if (source.type === 'stack') {
          move_card_to_hand(source, target_index)
        }
      },

			hand_container: (e, total_cards, drop_x) => {
        e.preventDefault()
        e.stopPropagation()

        const source = JSON.parse(e.dataTransfer.getData('source'))
        const insert_index = calculate_hand_insert_position(total_cards, drop_x)
        
        if (source.type === 'hand') {
          move_card_within_hand(source.card_index, insert_index)
        } else if (source.type === 'stack') {
          move_card_to_hand(source, insert_index)
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
  }


	/**
   * Calculates the appropriate insertion index for a card dropped into the hand container.
   * Takes into account the fan layout and horizontal position of the drop.
   * 
   * @param {number} total_cards - Current number of cards in hand
   * @param {number} drop_x - X coordinate where drop occurred
   * @returns {number} Index where new card should be inserted
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
   * Moves a card between stacks, handling both same-row and cross-row transfers.
   * Automatically creates new stacks when dropping between existing stacks.
   * Cleans up empty stacks after moves complete.
   * 
   * @param {Object} source - Contains row, stack_id, and card_index of dragged card
   * @param {Object} target - Contains row, stack_id (or null), and either card_index or drop_x
   */
  const move_card = (source, target) => {
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
          create_new_stack(updated_state, card, target.drop_x, target.row)
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
            create_new_stack(updated_state, moved_card, target.drop_x, target.row)
          }
          return updated_state
        })
      }, 0)
    }
  }

  /**
   * Moves a card from the hand to either a stack or a new stack in a row.
   * 
   * @param {Object} source - Contains card_index of dragged card from hand
   * @param {Object} target - Contains type ('stack'|'row'), row, and positioning info
   */
  const move_card_from_hand = (source, target) => {
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
          create_new_stack(updated_state, moved_card, target.drop_x, target.row)
          return updated_state
        })
      }
    }, 0)
  }

  /**
   * Moves a card from a stack to the hand.
   * 
   * @param {Object} source - Contains row, stack_id, and card_index of dragged card
   * @param {number} target_index - Index in hand where card should be inserted
   */
  const move_card_to_hand = (source, target_index) => {
    const source_row = get_row_state(source.row)
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
        updated_state.cards.splice(target_index + 1, 0, moved_card)
        return updated_state
      })
    }, 0)
  }

  /**
   * Reorders cards within the hand.
   * 
   * @param {number} source_index - Starting index of card being moved
   * @param {number} target_index - Destination index for card
   */
  const move_card_within_hand = (source_index, target_index) => {
    set_hand(curr_state => {
      const updated_state = { ...curr_state }
      const [card] = updated_state.cards.splice(source_index, 1)
      updated_state.cards.splice(target_index, 0, card)
      return updated_state
    })
  }

  /**
   * Creates a new stack and inserts it into the row's stack array.
   * Calculates insertion position based on drop coordinates.
   * 
   * @param {Object} row_state - Current state of the row being updated
   * @param {Object} card - Card object to place in new stack
   * @param {number} drop_x - X coordinate where drop occurred
   * @param {string} row - Row identifier for ref lookup
   */
  const create_new_stack = (row_state, card, drop_x, row) => {
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

  /* CONTEXT/PROVIDER BOILERPLATE */

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
