import './App.css'
import React, { useState, useRef } from 'react';

const App = () => {
  const [log, setLog] = useState([]);
  const dragStartPos = useRef(null);

  const logEvent = (name, e) => {
    const time = performance.now();
    let position = `(${e.clientX}, ${e.clientY})`;
    setLog(prev => [...prev, `${name} at ${time.toFixed(2)} pos: ${position}`]);
  };

  return (
    <div
      draggable="true"
      style={{ width: 300, height: 300, background: '#ddd', padding: 20 }}
      onClick={(e) => logEvent('click', e)}
      onMouseDown={(e) => {
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        logEvent('mousedown', e);
      }}
      onMouseUp={(e) => logEvent('mouseup', e)}
      onDragStart={(e) => logEvent('dragstart', e)}
      onDragEnd={(e) => logEvent('dragend', e)}
    >
      <div style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
        {log.map((entry, i) => <div key={i}>{entry}</div>)}
      </div>
    </div>
  );
};

export default App
