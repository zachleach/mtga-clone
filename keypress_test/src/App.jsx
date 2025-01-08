import React, { useState, useEffect } from 'react';

const App = () => {
	const [lastKey, setLastKey] = useState('');

 	useEffect(() => {
 	  /* Handle keypress events */
 	  const handleKeyPress = (event) => {
 	    setLastKey(event.key);
 	  };

 	  window.addEventListener('keydown', handleKeyPress);

 	  /* Cleanup listener on unmount */
 	  return () => {
 	    window.removeEventListener('keydown', handleKeyPress);
 	  };
 	}, []);

 	return <div style={{padding: '20px'}}>Last key pressed: {lastKey}</div>;
};

export default App;
