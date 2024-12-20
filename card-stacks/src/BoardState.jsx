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

const ROW_POSITIONS = ['top', 'left', 'right']

export const BoardStateProvider = ({ children }) => {
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

  const get_unique_stack_id = (row_state) => {
    const used_ids = new Set(row_state.stacks.map(s => s.id))
    let new_id = 0
    while (used_ids.has(String(new_id))) new_id++
    return String(new_id)
  }

  const handlers = {
    drag_start: {
      cardstack: (e, row, stack_id, card_index) => {
        e.dataTransfer.setData('source', JSON.stringify({
          row,
          stack_id,
          card_index
        }))
      }
    },

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
