import { useState } from 'react'
import './App.css'



/**
 * layout component that also handles drag/drop of cards to/from it 
 *
 */
const CardStack = ({ rowId, stackId, card_arr, dnd }) => {
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

  const get_dnd_props = (index) => ({
		draggable: true,
    onDragStart: (e) => dnd.onDragStart(e, rowId, stackId, index),
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => dnd.onDrop(e, rowId, stackId, index)
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
 * renders an array of card arrays (stacks of cards)
 *
 */
const CardRow = ({ rowId, stacks, dnd }) => {

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



	/**
	 * rendering each cardstack and passing it row/stack information for drag and drop events
	 */
	return (
    <div style={container_style}>
			{/* for each stack in stacks: render CardStack component */}
      {stacks.map(stack => (
        <CardStack
          key={stack.id}
					/* prop drilling to cardstack */
          rowId={rowId}
          stackId={stack.id}
          card_arr={stack.cards}
					dnd={dnd}
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





	const dnd_listeners = {

		/* dragging from a card_stack */
		onDragStart: (e, rowId, stackId, cardIndex) => {
			e.dataTransfer.setData('sourceRowId', rowId);
			e.dataTransfer.setData('sourceStackId', stackId);
			e.dataTransfer.setData('cardIndex', cardIndex.toString());
		},

		/* dropping onto a card_stack */
		onDrop: (e, targetRowId, targetStackId, targetIndex) => {
			e.preventDefault();
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
				
				return newRows;
			})
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
				rowId={rows[0].id}
				stacks={rows[0].stacks}  
				dnd={dnd_listeners}
			/>

      <CardRow 
				key={rows[1].id}
				rowId={rows[1].id}
				stacks={rows[1].stacks}  
				dnd={dnd_listeners}
			/>

    </div>
  );
};

export default App
