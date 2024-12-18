import { createContext, useContext, useState } from 'react'
import './App.css'



const Card = ({ color }) => {

  const card_style = {
    width: '100%',
    height: '100%',
    backgroundColor: color || 'white',
    border: '1px solid black',
    borderRadius: '12px',
  }

  return (
    <div style={card_style}/>
  )
}



/**
 * layout component that also handles drag/drop of cards to/from it 
 *
 */
const CardStack = ({ card_arr, row_id, stack_id }) => {

	const { dnd_handlers, listeners } = useDnd()

  const card_height = 140;
  const overlap = 0.15;
  const visible_height = card_height * overlap;
  

  const stack_container_styling = {
    position: 'relative',
    height: `${((card_arr.length - 1) * visible_height) + card_height}px`,
    width: `${card_height * 0.714}px`,
		margin: `${card_height * 0.1}px`,
  };


  const get_position_styling = (index) => ({
    position: 'absolute',
    height: `${card_height}px`,
    width: '100%',
    top: `${index * card_height * overlap}px`,
    zIndex: index,
  })


	const on_drag_start = (e, index) => {
		e.dataTransfer.setData('sourceRowId', row_id)
		e.dataTransfer.setData('sourceStackId', stack_id)
		e.dataTransfer.setData('cardIndex', index.toString())
	}


	const on_drop = (e, index) => {
		e.preventDefault()
		e.stopPropagation()

		const source = {
			row_id: e.dataTransfer.getData('sourceRowId'),
			stack_id: e.dataTransfer.getData('sourceStackId'),
			card_index: e.dataTransfer.getData('cardIndex')
		}

		const target = {
			row_id: row_id,
			stack_id: stack_id,
			card_index: index
		}

		listeners.drop.cardstack_cardstack(source, target)
	}


	const on_drag_over = (e, index) => {
		e.preventDefault()
		e.stopPropagation()
	}


	const html5_dnd_attributes = (index) => ({
		draggable: true,
		onDragStart: (e) => on_drag_start(e, index),
		onDrop: (e) => on_drop(e, index),
		onDragOver: (e) => on_drag_over(e, index)
	})


  return (
    <div style={stack_container_styling}>
      {card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)} {...html5_dnd_attributes(index)} >
          <Card {...card} />
        </div>
      ))}
    </div>
  )
}



/**
 * renders an array of card arrays (stacks of cards)
 *
 */
const CardRow = ({ card_row_obj }) => {

	const { dnd } = useDnd();

	const row_id = card_row_obj.id

	const container_style = {
		height: '20%', 
		width: '100%', 
		background: 'grey',
		border: '1px solid black',
		boxSizing: 'border-box',

		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	}



	const card_stack_props = (stack_id) => {
		return {
			row_id,
			stack_id
		}
	}

	const row_dnd_props = {
		onDragOver: (e) => e.preventDefault(),
		onDrop: (e) => dnd.card_row.onDrop(e, row_id),
	}


	/**
	 * rendering each cardstack and passing it row/stack information for drag and drop events
	 */
	return (
		/* handle dropping onto the row */
    <div style={container_style} {...row_dnd_props}>

			{/* render CardStack component for each stack in card_row_obj.stacks  */}
      {card_row_obj.stacks.map(stack => (
        <CardStack
          key={stack.id}
          card_arr={stack.cards}
					row_id={row_id}
					stack_id={stack.id}
        />
      ))}
    </div>
  );
}






const DndContext = createContext(null)

const useDnd = () => {
  const context = useContext(DndContext);
  if (!context) {
    throw new Error('useDnd must be used within a DndProvider');
  }
  return context;
};


const DndProvider = ({ children }) => {

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

	const getUniqueStackId = (row) => {
    const existingIds = row.stacks.map(stack => parseInt(stack.id))
    let newId = 0
    while (existingIds.includes(newId)) {
      newId++
    }

    return String(newId)
  };


	/**
	 * receive events and call handler functions
	 *
	 */
	const listeners = {
		drop: {
			/* `src` and `dst` are defined in cardstack */
			cardstack_cardstack: (src, dst) => {
				move_card(src.row_id, src.stack_id, src.card_index, dst.row_id, dst.stack_id, dst.card_index)
			},

		},

		drag: {

		},
	}


	const move_card = (src_row_id, src_stack_id, src_card_index, dst_row_id, dst_stack_id, dst_card_index) => {
		setRows(curr_state => {
			const copy = [...curr_state]

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



	const dnd = {




		/* CARD ROW */
		card_row:  {
			/* remove the card from the cardstack it came from 
			 * add card to row's stacks array
			 */
			onDrop: (e, targetRowId) => {
				e.preventDefault();
				const sourceRowId = e.dataTransfer.getData('sourceRowId');
				const sourceStackId = e.dataTransfer.getData('sourceStackId');
				const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'));

				setRows(prev => {
					const newRows = [...prev];
					const sourceRow = newRows.find(row => row.id === sourceRowId);
					const targetRow = newRows.find(row => row.id === targetRowId);
					const sourceStack = sourceRow.stacks.find(stack => stack.id === sourceStackId);

					const [movedCard] = sourceStack.cards.splice(cardIndex, 1);


					const newStackId = getUniqueStackId(targetRow)
					targetRow.stacks.push({
							id: newStackId,
							cards: [movedCard]
					});

					newRows.forEach(row => {
						row.stacks = row.stacks.filter(stack => stack.cards.length > 0);
					});
					console.log(rows)

					return newRows;
				})
			}
		}
	}


	/* this is what the context exports */
	const value = {
    rows,
		dnd,
		listeners,
  };

  return (
		<DndContext.Provider value={value}>
			{children}
		</DndContext.Provider>
	)



}



const Board = () => {
	const { rows } = useDnd()

	const container_style = {
		display: 'flex',  
		height: '100vh',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
	}

	return (
		<div style={container_style}>
			<CardRow 
				key={rows[0].id}
				card_row_obj={rows[0]}
			/>
			<CardRow 
				key={rows[1].id}
				card_row_obj={rows[1]}
			/>
		</div>
	)

}



const App = () => {
	return (
		<DndProvider>
			<Board/>
		</DndProvider>
  );
};





export default App
