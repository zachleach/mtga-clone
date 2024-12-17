import { useState } from 'react'
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
const CardStack = ({ card_arr, card_row_props, app_props }) => {
  const card_height = 140;
  const overlap = 0.15;
  const visible_height = card_height * overlap;
  
  const stack_container_styling = {
    position: 'relative',
    height: `${((card_arr.length - 1) * visible_height) + card_height}px`,
    width: '100px',
  };


  const get_position_styling = (index) => ({
    position: 'absolute',
    height: `${card_height}px`,
    width: '100%',
    top: `${index * card_height * overlap}px`,
    zIndex: index,
  })



	/* actually call the dnd handlers defined in parent components */
  const get_dnd_props = (index) => ({
		draggable: true,
    onDragStart: (e) => app_props.card_stack.onDragStart(e, card_row_props.row_id, card_row_props.stack_id, index),
    onDragOver: (e) => { 
			e.preventDefault()
			e.stopPropagation()
		},
    onDrop: (e) => app_props.card_stack.onDrop(e, card_row_props.row_id, card_row_props.stack_id, index),

  })



  return (
    <div style={stack_container_styling}>
      {card_arr.map((card, index) => (
				/* draggable container */
        <div key={index} style={get_position_styling(index)} {...get_dnd_props(index)}>
          <Card 
            {...card}
          />
        </div>
      ))}
    </div>
  )
}



/**
 * renders an array of card arrays (stacks of cards)
 *
 */
const CardRow = ({ card_row_obj, app_props }) => {

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
			row_id: row_id,
			stack_id
		}
	}



	const row_dnd_props = {
		onDragOver: (e) => e.preventDefault(),
		onDrop: (e) => app_props.card_row.onDrop(e, row_id),
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
					/* prop drilling to cardstack */
          card_arr={stack.cards}
					card_row_props={card_stack_props(stack.id)}
					app_props={app_props}
        />
      ))}
    </div>
  );
}






const App = () => {
	/* row id is for searching the objects */
  const [rows, setRows] = useState([
    {
      id: '0',
      stacks: [
				{ id: '0',  cards: [ { color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' } ] },
				{ id: '1',  cards: [ { color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' } ] },
			]
    },
    {
      id: '1',
      stacks: [
				{ id: '0',  cards: [ { color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' } ] },
				{ id: '1',  cards: [ { color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' } ] },
			]
    }
  ]);

	const getUniqueStackId = (row) => {
    const existingIds = row.stacks.map(stack => parseInt(stack.id));
    let newId = 0;
    while (existingIds.includes(newId)) {
      newId++;
    }
    return String(newId);
  };




	const dnd_handlers = {

		/* CARD STACK */
		card_stack: {
			/* dragging from a card_stack */
			onDragStart: (e, row_id, stack_id, cardIndex) => {
				e.dataTransfer.setData('sourceRowId', row_id);
				e.dataTransfer.setData('sourceStackId', stack_id);
				e.dataTransfer.setData('cardIndex', cardIndex.toString());
			},

			/* dropping onto a card_stack */
			onDrop: (e, targetRowId, targetStackId, targetIndex) => {
				e.preventDefault();
				e.stopPropagation()

				const sourceRowId = e.dataTransfer.getData('sourceRowId');
				const sourceStackId = e.dataTransfer.getData('sourceStackId');
				const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'));

				setRows(prev => {
					const newRows = [...prev];
					const sourceRow = newRows.find(row => row.id === sourceRowId);
					const targetRow = newRows.find(row => row.id === targetRowId);
					const sourceStack = sourceRow.stacks.find(stack => stack.id === sourceStackId);
					const targetStack = targetRow.stacks.find(stack => stack.id === targetStackId);

					if (sourceRowId !== targetRowId || sourceStackId !== targetStackId) {
						targetIndex++;
					}

					const [movedCard] = sourceStack.cards.splice(cardIndex, 1);
					targetStack.cards.splice(targetIndex, 0, movedCard);
					
					newRows.forEach(row => {
						row.stacks = row.stacks.filter(stack => stack.cards.length > 0);
					});

					return newRows;
				})
			},
		},


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
				app_props={dnd_handlers}
			/>
      <CardRow 
				key={rows[1].id}
				card_row_obj={rows[1]}
				app_props={dnd_handlers}
			/>
    </div>
  );
};

export default App
