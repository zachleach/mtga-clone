import './App.css'
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

const container_style = {
  height: '100%', 
  display: 'flex', 
  flexDirection: 'column',
  position: 'relative'
}

const top_style = {
  flex: '4',
  backgroundColor: '#f0f0f0'
}

const bot_style = {
  flex: '1',
  display: 'flex',
  position: 'relative',
  padding: '8px',
  backgroundColor: '#e0e0e0',
  justifyContent: 'center',
  alignItems: 'flex-end',
}

const card_width = 200;

const card_style = (index, total_cards, isDragging, isDragOver) => {
  const position = index - (total_cards - 1) / 2;
  const m = 4;
  const rotation = position * m;
  const lower_by = 0.8 * card_width;
  const vertical_offset = Math.pow(position, 2) * m + lower_by;
  
  return {
    width: `${card_width}px`,
    height: `${card_width / 0.714}px`,
    backgroundColor: 'white',
    border: '1px solid black',
    borderRadius: '8px',
    transform: `rotate(${rotation}deg) translateY(${vertical_offset}px)`,
    transformOrigin: 'bottom center',
    position: 'absolute',
    left: `calc(50% - ${card_width / 2}px + ${position * 120}px)`,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    outline: isDragOver ? '2px solid blue' : 'none',
  };
};

const card_image_style = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit'
}

const preview_style = {
  position: 'fixed',
  bottom: '20px',
  width: '300px',
  height: '420px',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  borderRadius: '12px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  pointerEvents: 'none'
}

import card_image from './img_test.png'

const App = () => {
  const [cards, setCards] = useState([0, 1, 2, 3, 4, 4, 4, 4]);
  const [previewPos, setPreviewPos] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const debouncedSetPreview = useCallback((e, cardIndex) => {
    if (!e) {
      setPreviewPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPreviewPos(rect.left + rect.width / 2);
  }, []);

  const handleDragStart = (e, index) => {
    setDraggedCard(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedCard === null) return;

    const newCards = [...cards];
    const [draggedItem] = newCards.splice(draggedCard, 1);
    newCards.splice(dropIndex, 0, draggedItem);
    
    setCards(newCards);
    setDraggedCard(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverIndex(null);
  };

  return (
    <div style={container_style}>
      <div style={top_style}>
        Top Region
      </div>
      <div style={bot_style}>
        <img
          src={card_image}
          alt="preview"
          style={{
            ...preview_style,
            left: previewPos || 0,
            opacity: previewPos ? 1 : 0,
            pointerEvents: 'none'
          }}
        />
        {cards.map((_, index) => (
          <div
            key={index}
            style={card_style(index, cards.length, index === draggedCard, index === dragOverIndex)}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onMouseMove={(e) => debouncedSetPreview(e, index)}
            onMouseLeave={() => debouncedSetPreview(null)}
          >
            <img src={card_image} alt="card" style={card_image_style} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App

