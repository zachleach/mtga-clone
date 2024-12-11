import React, { useState, useEffect } from 'react';

const card_width = 250;
const gap = 10;
const card_images = import.meta.glob('./assets/deck/*.png', { eager: true });

const overlay_style = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  zIndex: 1000,
  overflowY: 'auto',
  padding: '20px'
};

const getGridStyle = (containerWidth) => {
  const minColumns = Math.max(3, Math.floor((containerWidth + gap) / (card_width + gap)));
  const totalCardWidth = minColumns * card_width;
  const totalGapWidth = (minColumns - 1) * gap;
  const totalWidth = totalCardWidth + totalGapWidth;

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${minColumns}, ${card_width}px)`,
    gap: `${gap}px`,
    width: `${totalWidth}px`,
    margin: '0 auto',
    padding: '20px'
  };
};

const getCardStyle = (isHovered) => ({
  width: `${card_width}px`,
  aspectRatio: '0.714',
  backgroundColor: 'white',
  borderRadius: '12px',
  overflow: 'hidden',
  outline: isHovered ? '4px solid red' : 'none',
});

const card_image_style = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const Library = ({ isOpen, onClose }) => {
  const cardImageArray = Object.values(card_images).map(module => module.default);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth - 40);

  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth - 40);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={overlay_style}>
      <div style={getGridStyle(containerWidth)}>
        {cardImageArray.map((imageSrc, index) => (
          <div 
            key={index} 
            style={getCardStyle(index === hoveredCardIndex)}
            onMouseEnter={() => setHoveredCardIndex(index)}
            onMouseLeave={() => setHoveredCardIndex(null)}
          >
            <img
              src={imageSrc}
              alt={`Card ${index + 1}`}
              style={card_image_style}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;

