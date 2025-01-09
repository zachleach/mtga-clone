import './App.css'
import React from 'react';

const App = () => {
  const containerStyle = {
    position: 'relative',
    height: '300px',
    border: '1px solid black',
    margin: '20px'
  };

  const parentStyle = {
    position: 'relative', /* creates stacking context */
    background: 'lightblue',
    padding: '20px',
    zIndex: '1'
  };

  const childStyle = {
    position: 'relative',
    background: 'pink',
    padding: '10px',
    zIndex: '999' /* only compared within parent context */
  };

  const siblingStyle = {
    position: 'absolute',
    top: '50px',
    left: '50px',
    background: 'lightgreen',
    padding: '10px',
    zIndex: '2' /* competes with parent's z-index */
  };

  return (
		/* stacking context */
    <div style={containerStyle}>

      <div style={parentStyle}>
        Parent (z-index: 1)

        <div style={childStyle}>
          Child (z-index: 999)
        </div>

      </div>

      <div style={siblingStyle}>
        Sibling (z-index: 2)
      </div>

    </div>
  );
};

export default App;
