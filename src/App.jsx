import React, { useState, useEffect } from 'react';
import CardHand from './CardHand';
import Library from './Library';
import './App.css';

const container_style = {
  height: '100vh', 
  display: 'flex', 
  flexDirection: 'column',
  position: 'relative'
};

const zone = {
  flex: '1',
  backgroundColor: '#f0f0f0'
};

const App = () => {
  const [showLibrary, setShowLibrary] = useState(false);

  const toggleLibrary = () => {
    setShowLibrary(prevState => !prevState);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === 'l') {
        toggleLibrary();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div style={container_style}>
      <Library isOpen={showLibrary} onClose={toggleLibrary} />
      <div style={zone}>
        Top Region
      </div>
      <div style={zone}>
        Top Region
      </div>
      <CardHand />
    </div>
  );
};

export default App;

