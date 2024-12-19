import { createContext, useContext, useState, useRef } from 'react'

const ListenersContext = createContext(null)

export const useListeners = () => {
  const context = useContext(ListenersContext);
  if (!context) {
    throw new Error('useListeners must be used within a ListenersProvider');
  }
  return context;
};


export const ListenersProvider = ({ children }) => {

	/* TODO: just rename this to state */
  const [rows, setRows] = useState([
    {
      id: '0',
      stacks: [
				{ id: '0',  cards: [ { color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' } ] },
			]
    },
    {
      id: '1',
      stacks: [
				{ id: '0',  cards: [ { color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' } ] },
			]
    }
  ])

	const stack_refs = useRef({})
	const register_stack_ref = (row_id, stack_id, ref) => {
		const key = `${row_id}-${stack_id}`
		if (ref === null) {
			delete stack_refs.current[key]
		}
		else {
			stack_refs.current[key] = ref
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


	const get_unique_stack_id = (row) => {
    const existing_ids = row.stacks.map(stack => parseInt(stack.id))
    let newId = 0
    while (existing_ids.includes(newId)) {
      newId++
    }

    return String(newId)
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

			/* assumes dropped object is a card */
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

				const src_row_id = e.dataTransfer.getData('src_row_id');
				const src_stack_id = e.dataTransfer.getData('src_stack_id');
				const src_card_index = parseInt(e.dataTransfer.getData('src_card_index'));

				/* TODO */
				move_card(src_row_id, src_stack_id, src_card_index, dst_row_id, null, e.clientX)
			},

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


	/**
	 * moves a card from one cardstack to another
	 *
	 */
	const move_card = (src_row_id, src_stack_id, src_card_index, dst_row_id, dst_stack_id, dst_card_index) => {
		setRows(curr_state => {
			const copy = [...curr_state]

			/* get source row and stack */
			const source_row = copy.find(row => row.id === src_row_id)
			const source_stack = source_row.stacks.find(stack => stack.id === src_stack_id)
			const target_row = copy.find(row => row.id === dst_row_id)

			/* remove card from source */
			const [moved_card] = source_stack.cards.splice(src_card_index, 1)

			/* if dropping onto a stack */
			if (dst_stack_id !== null) {
				const target_stack = target_row.stacks.find(stack => stack.id === dst_stack_id)
				const insertion_index = source_row.id !== target_row.id || source_stack.id !== target_stack.id 
					? dst_card_index + 1 
					: dst_card_index
				target_stack.cards.splice(insertion_index, 0, moved_card)
			}

			/* if dropping onto a row */
			else {
				const drop_x = dst_card_index /* dst_card_index contains clientx in this case */
				
				/* if row has no stacks, create first stack */
				if (target_row.stacks.length === 0) {
					target_row.stacks.push({
						id: get_unique_stack_id(target_row),
						cards: [moved_card]
					})
				}

				/* otherwise find nearest stack and insert relative to it */
				else {
					/* get positions of all stacks */
					const stack_positions = target_row.stacks.map(stack => ({
						stack,
						position: get_stack_position(dst_row_id, stack.id)
					})).filter(item => item.position !== null)

					/* find nearest stack by comparing centers */
					const nearest = stack_positions.reduce((nearest, current) => {
						const current_distance = Math.abs(current.position.center - drop_x)
						const nearest_distance = Math.abs(nearest.position.center - drop_x)
						return current_distance < nearest_distance ? current : nearest
					})

					/* create new stack */
					const new_stack = {
						id: get_unique_stack_id(target_row),
						cards: [moved_card]
					}

					/* insert left or right of nearest stack */
					const nearest_index = target_row.stacks.findIndex(s => s.id === nearest.stack.id)
					const insert_index = drop_x > nearest.position.center 
						? nearest_index + 1  /* insert right */
						: nearest_index     /* insert left */
					
					target_row.stacks.splice(insert_index, 0, new_stack)
				}
			}

			/* clean up empty stacks */
			copy.forEach(row => {
				row.stacks = row.stacks.filter(stack => stack.cards.length > 0)
			})

			return copy
		})
	}






	/* this is what the context exports */
	const value = {
    rows,
		listeners,
		register_stack_ref
  }

  return (
		<ListenersContext.Provider value={value}>
			{children}
		</ListenersContext.Provider>
	)



}

