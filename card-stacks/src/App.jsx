import React from 'react';


/**
 * returns a container of cards stacked on top of each other
 *
 */
const CardStack = ({ card_arr }) => {
  const cardHeight = 140;
	const overlap = 0.15;
  const visibleHeight = cardHeight * overlap; 

  return (
		/* container */
    <div style={{
      position: 'relative',
      height: `${cardHeight + (card_arr.length - 1) * visibleHeight}px`,
      width: '100px',
    }}>
			{/* card stack with index 0 at the bottom */}
      {card_arr.map((card, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: `${index * visibleHeight}px`,
            zIndex: index + 1,
            width: '100%',
            height: `${cardHeight}px`,
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





const App = () => {
  const cardData = [
    { color: 'red' },
    { color: 'blue' },
    { color: 'green' },
    { color: 'yellow' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <CardStack card_arr={cardData} />
    </div>
  );
};

export default App
