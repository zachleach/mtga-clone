import { useState, createContext, useContext } from 'react';
import './App.css';



const CardGameContext = createContext(null);
const useCardGame = () => {
  const context = useContext(CardGameContext);
  if (!context) {
    throw new Error('useCardGame must be used within a CardGameProvider');
  }
  return context;
};

const CardGameProvider = ({ children }) => {
  const [rows, setRows] = useState([
    {
      id: '0',
      stacks: [
        { id: '0', cards: [{ color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' }] },
        { id: '1', cards: [{ color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' }] },
      ]
    },
    {
      id: '1',
      stacks: [
        { id: '0', cards: [{ color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' }] },
        { id: '1', cards: [{ color: 'red' }, { color: 'blue' }, { color: 'green' }, { color: 'yellow' }] },
      ]
    }
  ]);

  const handleDragStart = (e, rowId, stackId, cardIndex) => {
    e.dataTransfer.setData('sourceRowId', rowId);
    e.dataTransfer.setData('sourceStackId', stackId);
    e.dataTransfer.setData('cardIndex', cardIndex.toString());
  };

  const handleDrop = (e, targetRowId, targetStackId, targetIndex) => {
    e.preventDefault();

    const sourceRowId = e.dataTransfer.getData('sourceRowId');
    const sourceStackId = e.dataTransfer.getData('sourceStackId');
    const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'));

    setRows(prev => {
      const newRows = [...prev];
      
      const sourceRow = newRows.find(row => row.id === sourceRowId);
      const sourceStack = sourceRow.stacks.find(stack => stack.id === sourceStackId);

      const targetRow = newRows.find(row => row.id === targetRowId);
      const targetStack = targetRow.stacks.find(stack => stack.id === targetStackId);

      if (sourceRowId !== targetRowId || sourceStackId !== targetStackId) {
        targetIndex++;
      }

      const [movedCard] = sourceStack.cards.splice(cardIndex, 1);
      targetStack.cards.splice(targetIndex, 0, movedCard);
      
      return newRows;
    });
  };

  return (
    <CardGameContext.Provider value={{ rows, handleDragStart, handleDrop }}>
      {children}
    </CardGameContext.Provider>
  );
};



/**
 * renders an array of cards as a stack of cards
 * handles drag and drop
 *
 */
const CardStack = ({ rowId, stackId, card_arr }) => {
  const { handleDragStart, handleDrop } = useCardGame();
  const card_height = 140;
  const overlap = 0.15;
  const visible_height = card_height * overlap;

  const container_style = {
    position: 'relative',
    height: `${((card_arr.length - 1) * visible_height) + card_height}px`,
    width: '100px',
  };

  const card_style = (index) => ({
    position: 'absolute',
    height: `${card_height}px`,
    width: '100%',
    top: `${index * (card_height * overlap)}px`,
    zIndex: index,
  });

  return (
		{/* container */}
    <div style={container_style}>
			{/* draggable card */}
      {card_arr.map((card, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => handleDragStart(e, rowId, stackId, index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, rowId, stackId, index)}
          style={card_style(index)}
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



/**
 * 
 */
const CardRow = ({ rowId }) => {
  const { rows } = useCardGame();
  const stack_arr = rows.find(r => r.id === rowId);

  const container_style = {
    height: '20%',
    width: '100%',
    background: 'grey',
    border: '1px solid black',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={container_style}>
      {stack_arr.stacks.map(stack => (
        <CardStack
          key={stack.id}
          rowId={rowId}
          stackId={stack.id}
          card_arr={stack.cards}
        />
      ))}
    </div>
  );
};





const App = () => {
  const container_style = {
    display: 'flex',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  };

  return (
    <CardGameProvider>
      <div style={container_style}>
        <CardRow rowId="0" />
        <CardRow rowId="1" />
      </div>
    </CardGameProvider>
  );
};

export default App;
