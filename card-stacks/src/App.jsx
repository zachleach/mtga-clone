import { useState } from 'react'
import './App.css'


/**
 * card stack should just render an array
 * card row should manage card stacks
 * (and board manages card rows? we'll see.)
 *
 * no, you need drag and drop on the cardstack level, how else can you change the cards
 *
 */
const CardStack = ({ card_arr }) => {
  const [cards, setCards] = useState(card_arr || []);
  const cardHeight = 140;
  const overlap = 0.15;
  const visibleHeight = cardHeight * overlap;

	/**
	 * this should probably go into state for css related stuff
	 *
	 */
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('cardIndex', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('cardIndex'));
    
    if (draggedIndex === targetIndex) return;

    setCards(prev => {
      const copy = [...prev];
      const draggedCard = copy[draggedIndex];
			/* remove dragged card */
			copy.splice(draggedIndex, 1);
			/* then insert it at target index */
      copy.splice(targetIndex, 0, draggedCard);

      return copy;
    });
  };

  return (
    <div style={{
      position: 'relative',
      height: `${cardHeight + (cards.length - 1) * visibleHeight}px`,
      width: '100px',
    }}>
      {cards.map((card, index) => (
        <div
          key={index}
					
					/* drag and drop */
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}

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



const CardRow = () => {
  const cardData = [
    { color: 'red' },
    { color: 'blue' },
    { color: 'green' },
    { color: 'yellow' },
  ];

	return (
		<div style={{ 
			height: '20%',
			width: '100%',
			background: 'grey',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}}>

      <CardStack card_arr={cardData} />

		</div>
	)

}





const App = () => {

  return (
    <div style={{  
			display: 'flex',  
			height: '100vh',
			alignItems: 'center',
			justifyContent: 'center',
				flexDirection: 'column',
		}}>
			<CardRow/>
			<CardRow/>
    </div>
  );
};

export default App
