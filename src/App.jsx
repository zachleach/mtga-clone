import React from 'react';
import CardHand from './CardHand';
import './App.css';

const container_style = {
  height: '100vh', 
  display: 'flex', 
  flexDirection: 'column',
  position: 'relative'
}

const zone = {
  flex: '1',
  backgroundColor: '#f0f0f0'
}

const App = () => {
  return (
    <div style={container_style}>

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

