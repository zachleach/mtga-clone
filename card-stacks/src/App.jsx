import { useState } from 'react'
import './App.css'



/**
 * index 0 is at the bottom of the stack
 * as the index increases, the cards shift downward slightly
 * cards higher in the stack have a higher z-index
 *
 * the drag and drop logic
 * cards can be moved across rows, so 
 * 
 */
const CardStack = ({ rowId, stackId, card_arr, onDragStart, onDrop }) => {
  const card_height = 140;
  const overlap = 0.15;
  const visible_height = card_height * overlap;

  const handle_drag_over = (e) => {
    e.preventDefault();
  };

  const container_style = {
    position: 'relative',
		/* card_stack height = overlapping regions + top card on stack */
    height: `${((card_arr.length - 1) * visible_height) + card_height}px`,
    width: '100px',
  };

	/* compute the position of the top of the card in the stack relative to the container */
  const card_style = (index) => {
		const top_loc = card_height * overlap;
		return {
			position: 'absolute',
			height: `${card_height}px`,
			width: '100%',
			top: `${index * top_loc}px`,
			zIndex: index,
		}
	}

	return (
    <div style={container_style}>
      {card_arr.map((card, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => onDragStart(e, rowId, stackId, index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, rowId, stackId, index)}
          style={card_style(index)}
        >
          <Card {...card} />
        </div>
      ))}
    </div>
	)

};




const Card = ({ color }) => (
  <div style={{
    width: '100%',
    height: '100%',
    aspectRatio: '0.714',
    backgroundColor: color || 'white',
    border: '1px solid black',
    borderRadius: '12px',
  }} />
);



/**
 * this needs to be refactored to be able to contain 0 to N cardstacks
 * 
 *
 *
 */
const CardRow = ({ rowId, stacks, onDragStart, onDrop }) => {

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

	return (
    <div style={container_style}>
      {stacks.map(stack => (
        <CardStack
          key={stack.id}
          rowId={rowId}
          stackId={stack.id}
          card_arr={stack.cards}
          onDragStart={onDragStart}
          onDrop={onDrop}
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




	/**
	 * this is being passed down all the way to card stack
	 */
	const handleDragStart = (e, rowId, stackId, cardIndex) => {
		e.dataTransfer.setData('sourceRowId', rowId);
		e.dataTransfer.setData('sourceStackId', stackId);
		e.dataTransfer.setData('cardIndex', cardIndex.toString());
	};



	/**
	 * so is this
	 *
	 */
	const handleDrop = (e, targetRowId, targetStackId, targetIndex) => {
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
		});
	};



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
				onDragStart={handleDragStart}
				onDrop={handleDrop}
			/>

      <CardRow 
				key={rows[1].id}
				rowId={rows[1].id}
				stacks={rows[1].stacks}  
				onDragStart={handleDragStart}
				onDrop={handleDrop}
			/>

    </div>
  );
};

export default App
