import { createContext, useContext, useState } from 'react'

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
  ]);


	const get_unique_stack_id = (row) => {
    const existing_ids = row.stacks.map(stack => parseInt(stack.id))
    let newId = 0
    while (existing_ids.includes(newId)) {
      newId++
    }

    return String(newId)
  };


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

			console.log(src_row_id, src_stack_id, src_card_index, dst_row_id, dst_stack_id, dst_card_index)

			/* get the row and stack objects from their ids */
			const source_row = copy.find(row => row.id === src_row_id)
			const target_row = copy.find(row => row.id === dst_row_id)
			const source_stack = source_row.stacks.find(stack => stack.id === src_stack_id)
			const target_stack = target_row.stacks.find(stack => stack.id === dst_stack_id)

			/* if you move from across cardstacks the size is off by one (in contrast to moving cards within the same stack) */
			let insertion_index = dst_card_index
			if (source_row.id !== target_row.id || source_stack.id !== target_stack.id) {
				insertion_index++
			}

			/* remove card */
			const [moved_card] = source_stack.cards.splice(src_card_index, 1);

			/* then insert */
			target_stack.cards.splice(insertion_index, 0, moved_card);
			
			/* delete cardstack if it no longer has any cards */
			copy.forEach(row => {
				row.stacks = row.stacks.filter(stack => stack.cards.length > 0);
			});

			return copy;
		})
	}



	/* this is what the context exports */
	const value = {
    rows,
		listeners,
  };

  return (
		<ListenersContext.Provider value={value}>
			{children}
		</ListenersContext.Provider>
	)



}

