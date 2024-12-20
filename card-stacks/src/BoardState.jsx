/* BoardState.jsx */
import { createContext, useContext, useState, useRef } from 'react'

const BoardStateContext = createContext(null)

export const useBoardState = () => {
  const context = useContext(BoardStateContext)
  if (!context) {
    throw new Error('useBoardState must be used within a BoardStateProvider')
  }
  return context
}

/* valid row positions for type checking */
const ROW_POSITIONS = ['top', 'left', 'right']

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

  const get_row_setter = (row) => {
    if (!ROW_POSITIONS.includes(row)) {
      throw new Error(`Invalid row position: ${row}`)
    }
    
    switch(row) {
      case 'top': return set_top_row
      case 'left': return set_left_row
      case 'right': return set_right_row
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
    }
  }

  const get_unique_stack_id = (row_state) => {
    const used_ids = new Set(row_state.stacks.map(s => s.id))
    let new_id = 0
    while (used_ids.has(String(new_id))) new_id++
    return String(new_id)
  }













	/* REFS */

  const stack_refs = useRef({})

	/**
	 * Maintains a registry of DOM references to card stacks for position calculations.
	 * Uses compound keys in format 'row-stackId' to uniquely identify each stack.
	 * Passing null as ref removes the reference, enabling cleanup on unmount.
	 *
	 * @param {string} row - Row identifier ('top', 'left', 'right')
	 * @param {string} stack_id - Unique identifier for the stack within its row
	 * @param {React.RefObject|null} ref - React ref object or null for cleanup
	 *
	 * @throws {Error} If row parameter is not a valid row position
	 *
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
	 * Returns null if reference is not found or invalid.
	 *
	 * @param {string} row - Row identifier ('top', 'left', 'right') 
	 * @param {string} stack_id - Unique identifier for the stack within its row
	 *
	 * @returns {Object|null} Object containing left, right, width and center coordinates,
	 *                        or null if reference not found
	 *
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
          row,
          stack_id,
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
        move_card(source, {
          row: target_row,
          stack_id: target_stack_id,
          card_index: target_index
        })
      },

      cardrow: (e, target_row) => {
        e.preventDefault()
        const source = JSON.parse(e.dataTransfer.getData('source'))
        move_card(source, {
          row: target_row,
          stack_id: null,
          drop_x: e.clientX
        })
      }
    },

		/* DRAG OVER */
    drag_over: {
      cardstack: (e) => {
        e.preventDefault()
        e.stopPropagation()
      },

      cardrow: (e) => {
        e.preventDefault()
      }
    }
  }





	/**
	 * Moves a card between stacks, handling both same-row and cross-row transfers.
	 * For same-row moves, updates source row state to remove card and add to target position.
	 * For cross-row moves, uses two-phase update: first removes from source row while capturing
	 * moved card in closure, then updates target row after small delay to prevent race conditions.
	 * Automatically creates new stacks when dropping between existing stacks based on mouse position.
	 * Cleans up empty stacks after moves complete.
	 *
	 * @param {Object} source - Contains row, stack_id, and card_index of dragged card
	 * @param {Object} target - Contains row, stack_id (or null), and either card_index or drop_x
	 *
	 */
  const move_card = (source, target) => {
    const source_row = get_row_state(source.row)
    const source_setter = get_row_setter(source.row)
    const target_setter = get_row_setter(target.row)
    
    /* store the moved card so it's available for both state updates */
    let moved_card = null

    /* remove card from source */
    source_setter(curr_state => {
      const updated_state = { ...curr_state }
      const source_stack = updated_state.stacks.find(s => s.id === source.stack_id)
      const [card] = source_stack.cards.splice(source.card_index, 1)
      moved_card = card  /* store the card for later use */

      /* same row handling */
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

      /* cleanup empty stacks */
      updated_state.stacks = updated_state.stacks.filter(s => s.cards.length > 0)
      return updated_state
    })

    /* handle different row updates */
    if (source.row !== target.row) {
      /* ensure we have the card before updating target */
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
	 * Creates a new stack and inserts it into the row's stack array at the appropriate position.
	 * If row is empty, simply adds new stack. Otherwise, calculates insertion position by finding
	 * nearest existing stack to drop_x coordinate and inserting either before or after based on
	 * whether drop occurred left or right of stack's center. Uses DOM measurements via stack_refs
	 * to determine actual screen positions for calculations.
	 *
	 * @param {Object} row_state - Current state of the row being updated
	 * @param {Object} card - Card object to place in new stack
	 * @param {number} drop_x - X coordinate where drop occurred
	 * @param {string} row - Row identifier ('top', 'left', 'right') for ref lookup
	 *
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
    handlers,
    register_stack_ref
  }

  return (
    <BoardStateContext.Provider value={value}>
      {children}
    </BoardStateContext.Provider>
  )
}
