import { createContext, useContext, useState, useRef } from 'react'

const ListenersContext = createContext(null)

export const useListeners = () => {
  const context = useContext(ListenersContext)
  if (!context) {
    throw new Error('useListeners must be used within a ListenersProvider')
  }
  return context
}

export const ListenersProvider = ({ children }) => {
  /* 
   * State now includes regular rows and a hand row
   * Hand row is marked with type: 'hand' and only allows one stack
   */
  const [rows, setRows] = useState([
    {
      id: '0',
      type: 'row',
      stacks: [
        { id: '0', cards: [ { color: 'red' }, { color: 'blue' }, { color: 'green' } ] },
      ]
    },
    {
      id: '1',
      type: 'row',
      stacks: [
        { id: '0', cards: [ { color: 'yellow' }, { color: 'purple' } ] },
      ]
    },
    {
      id: '2',
      type: 'hand',
      stacks: [
        { id: '0', cards: [ { color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' } ] },
      ]
    }
  ])



	const stack_refs = useRef({})
	const fan_card_refs = useRef({})

	const register_stack_ref = (row_id, stack_id, ref) => {
		const key = `${row_id}-${stack_id}`
		if (ref === null) {
			delete stack_refs.current[key]
		} else {
			stack_refs.current[key] = ref
		}
	}

	const register_fan_card_ref = (row_id, stack_id, card_index, ref) => {
		const key = `${row_id}-${stack_id}-${card_index}`
		if (ref === null) {
			delete fan_card_refs.current[key]
		} else {
			fan_card_refs.current[key] = ref
		}
	}




  const get_stack_position = (row_id, stack_id) => {
    const key = `${row_id}-${stack_id}`
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


	const get_fan_position = (row_id, stack_id, card_index) => {
		const key = `${row_id}-${stack_id}-${card_index}`
		const ref = fan_card_refs.current[key]
		if (!ref?.current) return null

		const rect = ref.current.getBoundingClientRect()
		const element = ref.current
		const style = window.getComputedStyle(element)
		const transform = style.transform
		
		/* extract rotation angle from transform matrix */
		const matrix = new DOMMatrix(transform)
		const rotation = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI)
		
		/* calculate center point considering rotation */
		const center_x = rect.left + (rect.width / 2)
		const center_y = rect.top + (rect.height / 2)
		
		return {
			left: rect.left,
			right: rect.right,
			width: rect.width,
			height: rect.height,
			center_x,
			center_y,
			rotation,
			element    /* return element for potential transform comparisons */
		}
	}










  const get_unique_stack_id = (row) => {
    const existing_ids = row.stacks.map(stack => parseInt(stack.id))
    let new_id = 0
    while (existing_ids.includes(new_id)) {
      new_id++
    }
    return String(new_id)
  }




	const listeners = {
    drag_start: {
      cardstack: (e, src_row_id, src_stack_id, src_index) => {
        e.dataTransfer.setData('src_row_id', src_row_id)
        e.dataTransfer.setData('src_stack_id', src_stack_id)
        e.dataTransfer.setData('src_card_index', src_index.toString())
      },
    },

    drop: {
      cardstack: (e, dst_row_id, dst_stack_id, dst_card_index) => {
        e.preventDefault()
        e.stopPropagation()

        const src_row_id = e.dataTransfer.getData('src_row_id')
        const src_stack_id = e.dataTransfer.getData('src_stack_id')
        const src_card_index = parseInt(e.dataTransfer.getData('src_card_index'))

        move_card(src_row_id, src_stack_id, src_card_index, dst_row_id, dst_stack_id, dst_card_index)
      },

      cardrow: (e, dst_row_id) => {
        e.preventDefault()

        const src_row_id = e.dataTransfer.getData('src_row_id')
        const src_stack_id = e.dataTransfer.getData('src_stack_id')
        const src_card_index = parseInt(e.dataTransfer.getData('src_card_index'))

        move_card(src_row_id, src_stack_id, src_card_index, dst_row_id, null, e.clientX)
      },


			cardhand: (e, dst_row_id, dst_stack_id) => {
        e.preventDefault()
        e.stopPropagation()

        const src_row_id = e.dataTransfer.getData('src_row_id')
        const src_stack_id = e.dataTransfer.getData('src_stack_id')
        const src_card_index = parseInt(e.dataTransfer.getData('src_card_index'))

        /* Pass coordinates as an object instead of trying to overload dst_card_index */
        const drop_position = { x: e.clientX, y: e.clientY }
        move_card(src_row_id, src_stack_id, src_card_index, dst_row_id, dst_stack_id, drop_position)
      }
    },



    drag_over: {
      cardstack: (e) => {
        e.preventDefault()
        e.stopPropagation()
      },

      cardrow: (e) => {
        e.preventDefault()
      },

      cardhand: (e) => {
        e.preventDefault()
        e.stopPropagation()
      }
    }
  }



  /* helper function for calculating hand insertion index */
  const get_hand_insertion_index = (drop_x, drop_y, row_id, stack_id) => { const card_positions = rows
      .find(row => row.id === row_id)
      .stacks[0]
      .cards
      .map((_, index) => ({
        index,
        position: get_fan_position(row_id, stack_id, index)
      }))
      .filter(item => item.position !== null)

    if (card_positions.length === 0) return 0

    /* find nearest card based on distance to center point */
    const nearest = card_positions.reduce((nearest, current) => {
      const current_dx = current.position.center_x - drop_x
      const current_dy = current.position.center_y - drop_y
      const current_distance = Math.sqrt(current_dx * current_dx + current_dy * current_dy)

      const nearest_dx = nearest.position.center_x - drop_x
      const nearest_dy = nearest.position.center_y - drop_y
      const nearest_distance = Math.sqrt(nearest_dx * nearest_dx + nearest_dy * nearest_dy)

      return current_distance < nearest_distance ? current : nearest
    })

    /* determine if drop point is before or after nearest card based on relative angle */
    const drop_angle = Math.atan2(drop_y - nearest.position.center_y, drop_x - nearest.position.center_x)
    const card_rotation = nearest.position.rotation * (Math.PI / 180)
    
    return drop_angle > card_rotation ? nearest.index + 1 : nearest.index
  }






  /*
   * Enhanced move_card function that handles both regular rows and hand rows
   * Hand rows maintain a single stack and don't allow stack creation
   */
  const move_card = (src_row_id, src_stack_id, src_card_index, dst_row_id, dst_stack_id, dst_card_index) => {
    setRows(curr_state => {
      const copy = [...curr_state]

      /* Get source and target rows */
      const source_row = copy.find(row => row.id === src_row_id)
      const source_stack = source_row.stacks.find(stack => stack.id === src_stack_id)
      const target_row = copy.find(row => row.id === dst_row_id)

      /* Remove card from source */
      const [moved_card] = source_stack.cards.splice(src_card_index, 1)

      /* Handle hand rows differently - always use first stack */

			if (target_row.type === 'hand') {
				const target_stack = target_row.stacks[0]
				const insertion_index = typeof dst_card_index === 'object'
					? get_hand_insertion_index(dst_card_index.x, dst_card_index.y, dst_row_id, target_stack.id)
					: dst_card_index
				target_stack.cards.splice(insertion_index, 0, moved_card)
			}

      /* Handle regular rows */
      else if (dst_stack_id !== null) {
        const target_stack = target_row.stacks.find(stack => stack.id === dst_stack_id)
        const insertion_index = source_row.id !== target_row.id || source_stack.id !== target_stack.id 
          ? dst_card_index + 1 
          : dst_card_index
        target_stack.cards.splice(insertion_index, 0, moved_card)
      }
      /* Handle dropping on row (creating new stack) - not allowed for hands */
      else if (target_row.type !== 'hand') {
        const drop_x = dst_card_index /* dst_card_index contains clientX in this case */

        /* Create first stack if row is empty */
        if (target_row.stacks.length === 0) {
          target_row.stacks.push({
            id: get_unique_stack_id(target_row),
            cards: [moved_card]
          })
        }
        /* Otherwise find nearest stack and insert relative to it */
        else {
          const stack_positions = target_row.stacks.map(stack => ({
            stack,
            position: get_stack_position(dst_row_id, stack.id)
          })).filter(item => item.position !== null)

          const nearest = stack_positions.reduce((nearest, current) => {
            const current_distance = Math.abs(current.position.center - drop_x)
            const nearest_distance = Math.abs(nearest.position.center - drop_x)
            return current_distance < nearest_distance ? current : nearest
          })

          const new_stack = {
            id: get_unique_stack_id(target_row),
            cards: [moved_card]
          }

          const nearest_index = target_row.stacks.findIndex(s => s.id === nearest.stack.id)
          const insert_index = drop_x > nearest.position.center 
            ? nearest_index + 1  /* insert right */
            : nearest_index     /* insert left */
          
          target_row.stacks.splice(insert_index, 0, new_stack)
        }
      }

      /* Clean up empty stacks in non-hand rows */
      copy.forEach(row => {
        if (row.type !== 'hand') {
          row.stacks = row.stacks.filter(stack => stack.cards.length > 0)
        }
      })

      return copy
    })
  }

  const value = {
    rows,
    listeners,
    register_stack_ref,
		register_fan_card_ref
  }

  return (
    <ListenersContext.Provider value={value}>
      {children}
    </ListenersContext.Provider>
  )
}
