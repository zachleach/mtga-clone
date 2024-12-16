import { useState } from 'react'
import './App.css'

const CardStack = ({ rowId, card_arr, onDragStart, onDrop }) => {
  const cardHeight = 140;
  const overlap = 0.15;
  const visibleHeight = cardHeight * overlap;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{
      position: 'relative',
      height: `${cardHeight + (card_arr.length - 1) * visibleHeight}px`,
      width: '100px',
    }}>
      {card_arr.map((card, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => onDragStart(e, rowId, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => onDrop(e, rowId, index)}
          style={{
            position: 'absolute',
            top: `${index * visibleHeight}px`,
            zIndex: index + 1,
            width: '100%',
            height: `${cardHeight}px`,
            cursor: 'move',
          }}
        >
          <Card {...card} />
        </div>
      ))}
    </div>
  );
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



const CardRow = ({ rowId, cards, onDragStart, onDrop }) => {
  return (
    <div style={{ 
      height: '20%',
      width: '100%',
      background: 'grey',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <CardStack 
        rowId={rowId}
        card_arr={cards}
        onDragStart={onDragStart}
        onDrop={onDrop}
      />
    </div>
  )
}




const App = () => {
  const [rows, setRows] = useState([
    {
      id: 'row1',
      cards: [
        { color: 'red' },
        { color: 'blue' },
        { color: 'green' },
        { color: 'yellow' },
      ]
    },
    {
      id: 'row2',
      cards: [
        { color: 'red' },
        { color: 'blue' },
        { color: 'green' },
        { color: 'yellow' },
      ]
    }
  ]);

  const handleDragStart = (e, sourceRowId, cardIndex) => {
    e.dataTransfer.setData('sourceRowId', sourceRowId);
    e.dataTransfer.setData('cardIndex', cardIndex.toString());
  };

  const handleDrop = (e, targetRowId, targetIndex) => {
    e.preventDefault();
    const sourceRowId = e.dataTransfer.getData('sourceRowId');
    const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'));

    setRows(prev => {
      const newRows = [...prev];
      const sourceRowIndex = newRows.findIndex(row => row.id === sourceRowId);
      const targetRowIndex = newRows.findIndex(row => row.id === targetRowId);

			if (sourceRowIndex !== targetRowIndex) {
				targetIndex++
			}
      const [movedCard] = newRows[sourceRowIndex].cards.splice(cardIndex, 1);
      newRows[targetRowIndex].cards.splice(targetIndex, 0, movedCard);
      return newRows;
    });
  };

  return (
    <div style={{  
      display: 'flex',  
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }}>
      {rows.map(row => (
        <CardRow 
          key={row.id}
          rowId={row.id}
          cards={row.cards}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};

export default App
