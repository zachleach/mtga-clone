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
