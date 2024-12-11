import React, { useState, useCallback } from 'react';
import './App.css';



/**
 * layout container holding all the cards 
 *
 */
const bot_style = {
  flex: '0.25',
  display: 'flex',
  position: 'relative',
  padding: '8px',
  backgroundColor: '#e0e0e0',
  justifyContent: 'center',
  alignItems: 'flex-end',
};


/**
 * card in hand styling
 *
 * 2024.12.11
 * still need to handle card density when hand becomes very large
 */
const card_width = 180;
const card_style = (index, total_cards, isDragging, isDragOver, isHovered) => {
	/* position is relative to center */
  const position = index - (total_cards - 1) / 2;

	/* rotation depends on position relative to center */
  const rotation_multiplier = 4;
  const rotation = rotation_multiplier * position;

	/* TODO: more cards in hand increases overlap between cards */
	const hand_density = 120;
	const hand_density_multiplier = 1;

	/* create card arc by having cards on the outside vertically lower than cards in the middle */
	/* decrease all cards by some constant amount so only the top half of card is showing */
  const lower_by = 0.8 * card_width;
  const vertical_offset = (Math.pow(position, 2) * rotation_multiplier) + lower_by;


  return {
    width: `${card_width}px`,
    height: `${card_width / 0.714}px`,
    cursor: 'grab',

		/* in case card image doesn't render */
    backgroundColor: 'white',

		/* small black curved outline */
    border: '1px solid black',
    borderRadius: '8px',

		/* slightly rotate about the bottom center */
    transform: `rotate(${rotation}deg) translateY(${vertical_offset}px)`,
    transformOrigin: 'bottom center',

		/* horizontal card positioning */
    left: `calc(50% - ${card_width / 2}px + ${position * (hand_density / hand_density_multiplier)}px)`,
    position: 'absolute',

		/* become transparent when dragging */ 
    opacity: isDragging ? 0.5 : 1,

		/* set card outline based on if being dragged or hovering over */
		outline: isDragOver ? '4px solid blue' : isHovered ? '4px solid red' : 'none',
  };
};


/**
 * card images fill the card box div styling above
 *
 */
const card_image_style = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit'
};

const card_hand_images = import.meta.glob('./assets/hand/*.png', { eager: true });













/**
 * card preview styling
 *
 */
const card_preview_multiplier = 2.2;
const preview_style = {
	/* preview is at the bottom, 20px above the window */
  position: 'fixed',
  bottom: '20px',

	/* sizing of the preview */
  width: `${card_preview_multiplier * card_width}px`,
  height: `${(card_preview_multiplier * card_width) / 0.714}px`,

	/* use center of the card being hovered for left calculation */
  transform: 'translateX(-50%)',

	/* position this in front of other elements */
  zIndex: 1000,

	/* add subtle shadow effect */
  borderRadius: '16px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',

	/* don't intercept mouse events so cards below it in the hand can still be interacted with */
  pointerEvents: 'none',

	/* horizontal position calcualted/set by other functions */
	left: '0'
};



const CardHand = () => {
  const card_hand_image_array = Object.values(card_hand_images).map(module => module.default);


  const [cards, setCards] = useState(Array.from({ length: card_hand_image_array.length }, (_, i) => i));
  const [previewPos, setPreviewPos] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);

	/* hovering card is a certain color */
	const [hoveredCardIndex, setHoveredCardIndex] = useState(null);



	/**
	 * set card preview state depending on where cursor is hovering 
	 *
	 */
  const debouncedSetPreview = useCallback((e, cardIndex) => {
		/* don't preview if dragging */
    if (!e || isDragging) {
      setPreviewPos(null);
      setPreviewCard(null);
			setHoveredCardIndex(null);
      return;
    }
		/* set preview position to the center of the card being hovered */ 
    const rect = e.currentTarget.getBoundingClientRect();
    setPreviewPos(rect.left + rect.width / 2);
    setPreviewCard(cards[cardIndex]);
		setHoveredCardIndex(cardIndex);
  }, [isDragging, cards]);


	/* drag and drop */
  const handleDragStart = (e, index) => {
    setDraggedCard(index);
    setIsDragging(true);
    setPreviewPos(null);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedCard === null) return;

    const newCards = [...cards];
    const [draggedItem] = newCards.splice(draggedCard, 1);
    newCards.splice(index, 0, draggedItem);
    
    setCards(newCards);
    setDraggedCard(null);
    setDragOverIndex(null);
		setHoveredCardIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

	return (
    <div style={bot_style}>
			
			{/* card previewing */}
      {previewPos && <img
          src={previewCard !== null ? card_hand_image_array[previewCard] : ''}
          alt="preview"
          style={{
            ...preview_style,
            left: previewPos,
            opacity: 1,
            pointerEvents: 'none'
          }}
			/>}

			{/* card hand fan */}
      {cards.map((cardIndex, index) => (
        <div
          key={index}
					/* dynamic styling */
          style={card_style(index, cards.length, index === draggedCard, index === dragOverIndex, index === hoveredCardIndex)}
					/* drag and drop */
          draggable={true}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
					/* hover preview */
          onMouseMove={(e) => debouncedSetPreview(e, index)}
          onMouseLeave={() => debouncedSetPreview(null)}
        >
					{/* set card object's image */}
          <img src={card_hand_image_array[cardIndex]} alt={`card ${cardIndex}`} style={card_image_style} />
        </div>
      ))}

    </div>
  );
};

export default CardHand;

