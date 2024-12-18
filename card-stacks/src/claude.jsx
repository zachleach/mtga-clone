import { useState, useRef } from 'react';

const App = () => {
  const [dropIndicator, setDropIndicator] = useState(null);
  
  const [rows, setRows] = useState([
    {
      id: 'row1',
      stacks: [
        { id: 'stack1', cards: [{ color: 'red' }, { color: 'blue' }] },
        { id: 'stack2', cards: [{ color: 'green' }, { color: 'yellow' }] }
      ]
    },
    {
      id: 'row2',
      stacks: [] // Empty row
    },
    {
      id: 'row3',
      stacks: [
        { id: 'stack3', cards: [{ color: 'purple' }, { color: 'orange' }] },
        { id: 'stack4', cards: [{ color: 'pink' }, { color: 'cyan' }] }
      ]
    }
  ]);

  const rowRefs = useRef({});
  const stackRefs = useRef({});
  const cardRefs = useRef({});

  const handleDragStart = (e, sourceRowId, sourceStackId, cardIndex) => {
    const dragData = {
      sourceRowId,
      sourceStackId,
      cardIndex
    };
    e.dataTransfer.setData('text', JSON.stringify(dragData));
  };

  const handleDragOverCard = (e, rowId, stackId, cardIndex) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to stack/row handlers
    
    const cardElement = cardRefs.current[`${stackId}-${cardIndex}`];
    const cardRect = cardElement.getBoundingClientRect();
    const mouseY = e.clientY;
    
    // Determine if we should place card above or below the target card
    const dropPosition = mouseY < (cardRect.top + cardRect.height / 2) ? 'before' : 'after';
    
    setDropIndicator({
      rowId,
      stackId,
      position: 'card',
      targetIndex: cardIndex,
      placement: dropPosition
    });
  };

  const handleDragOver = (e, rowId) => {
    e.preventDefault();
    
    const rowElement = rowRefs.current[rowId];
    const rowRect = rowElement.getBoundingClientRect();
    const mouseX = e.clientX - rowRect.left;
    
    const currentRow = rows.find(r => r.id === rowId);
    
    if (currentRow.stacks.length === 0) {
      setDropIndicator({
        rowId,
        position: 'empty-row',
        mouseX: mouseX
      });
      return;
    }
    
    let dropPosition = null;
    
    for (let stack of currentRow.stacks) {
      const stackElement = stackRefs.current[stack.id];
      const stackRect = stackElement.getBoundingClientRect();
      const stackCenterX = stackRect.left + (stackRect.width / 2) - rowRect.left;
      
      if (mouseX < stackCenterX) {
        dropPosition = { rowId, stackId: stack.id, position: 'left' };
        break;
      } else if (mouseX < stackRect.right - rowRect.left) {
        dropPosition = { rowId, stackId: stack.id, position: 'middle' };
        break;
      }
    }
    
    if (!dropPosition && currentRow.stacks.length > 0) {
      dropPosition = {
        rowId,
        stackId: currentRow.stacks[currentRow.stacks.length - 1].id,
        position: 'right'
      };
    }
    
    setDropIndicator(dropPosition);
  };

  const handleDrop = (e, targetRowId) => {
    e.preventDefault();
    
    if (!dropIndicator) return;
    
    const dragData = JSON.parse(e.dataTransfer.getData('text'));
    const { sourceRowId, sourceStackId, cardIndex: sourceCardIndex } = dragData;
    
    setRows(prev => {
      const newRows = [...prev];
      const sourceRow = newRows.find(r => r.id === sourceRowId);
      const targetRow = newRows.find(r => r.id === targetRowId);
      const sourceStack = sourceRow.stacks.find(s => s.id === sourceStackId);
      
      // Handle dropping card within the same stack
      if (dropIndicator.position === 'card' && 
          sourceRowId === targetRowId && 
          sourceStackId === dropIndicator.stackId) {
        const [movedCard] = sourceStack.cards.splice(sourceCardIndex, 1);
        const targetIndex = dropIndicator.targetIndex;
        
        // Adjust target index if moving card within same stack
        const adjustedTargetIndex = dropIndicator.placement === 'after' ? 
          (targetIndex < sourceCardIndex ? targetIndex + 1 : targetIndex) :
          (targetIndex > sourceCardIndex ? targetIndex - 1 : targetIndex);
        
        sourceStack.cards.splice(adjustedTargetIndex, 0, movedCard);
        return newRows;
      }
      
      // Remove card from source
      const [movedCard] = sourceStack.cards.splice(sourceCardIndex, 1);
      
      // Clean up empty source stack
      if (sourceStack.cards.length === 0) {
        sourceRow.stacks = sourceRow.stacks.filter(s => s.id !== sourceStackId);
      }
      
      // Handle different drop scenarios
      if (dropIndicator.position === 'empty-row') {
        const newStackId = `stack${Date.now()}`;
        targetRow.stacks = [{ id: newStackId, cards: [movedCard] }];
      } else if (dropIndicator.position === 'middle') {
        const targetStack = targetRow.stacks.find(s => s.id === dropIndicator.stackId);
        targetStack.cards.push(movedCard);
      } else {
        const newStackId = `stack${Date.now()}`;
        const newStack = { id: newStackId, cards: [movedCard] };
        const targetStackIndex = targetRow.stacks.findIndex(s => s.id === dropIndicator.stackId);
        const insertIndex = dropIndicator.position === 'left' ? targetStackIndex : targetStackIndex + 1;
        targetRow.stacks.splice(insertIndex, 0, newStack);
      }
      
      return newRows;
    });
    
    setDropIndicator(null);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      {rows.map(row => (
        <div
          key={row.id}
          ref={el => rowRefs.current[row.id] = el}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '20px',
            background: 'lightgray',
            margin: '10px',
            position: 'relative'
          }}
          onDragOver={e => handleDragOver(e, row.id)}
          onDrop={e => handleDrop(e, row.id)}
        >
          {dropIndicator?.rowId === row.id && dropIndicator?.position === 'empty-row' && (
            <div style={{
              position: 'absolute',
              left: dropIndicator.mouseX - 2,
              top: 0,
              width: 4,
              height: '100%',
              background: 'blue'
            }} />
          )}
          
          {row.stacks.map(stack => (
            <div
              key={stack.id}
              ref={el => stackRefs.current[stack.id] = el}
              style={{ position: 'relative' }}
            >
              {dropIndicator?.rowId === row.id && dropIndicator?.stackId === stack.id && (
                <>
                  {dropIndicator.position === 'left' && (
                    <div style={{
                      position: 'absolute',
                      left: -10,
                      top: 0,
                      width: 4,
                      height: '100%',
                      background: 'blue'
                    }} />
                  )}
                  {dropIndicator.position === 'right' && (
                    <div style={{
                      position: 'absolute',
                      right: -10,
                      top: 0,
                      width: 4,
                      height: '100%',
                      background: 'blue'
                    }} />
                  )}
                  {dropIndicator.position === 'middle' && (
                    <div style={{
                      position: 'absolute',
                      inset: -4,
                      border: '2px solid blue',
                      pointerEvents: 'none'
                    }} />
                  )}
                </>
              )}
              
              <CardStack
                rowId={row.id}
                stackId={stack.id}
                cards={stack.cards}
                onDragStart={handleDragStart}
                onDragOverCard={handleDragOverCard}
                cardRefs={cardRefs}
                dropIndicator={dropIndicator}
              />
            </div>
          ))}
          
          {row.stacks.length === 0 && (
            <div style={{
              width: '100%',
              textAlign: 'center',
              color: '#666',
              pointerEvents: 'none'
            }}>
              Drop cards here
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const CardStack = ({ rowId, stackId, cards, onDragStart, onDragOverCard, cardRefs, dropIndicator }) => {
  const cardHeight = 140;
  const overlap = 0.15;
  const visibleHeight = cardHeight * overlap;

  return (
    <div style={{
      position: 'relative',
      height: `${cardHeight + (cards.length - 1) * visibleHeight}px`,
      width: '100px',
    }}>
      {cards.map((card, index) => (
        <div
          key={index}
          ref={el => cardRefs.current[`${stackId}-${index}`] = el}
          draggable
          onDragStart={(e) => onDragStart(e, rowId, stackId, index)}
          onDragOver={(e) => onDragOverCard(e, rowId, stackId, index)}
          style={{
            position: 'absolute',
            top: `${index * visibleHeight}px`,
            zIndex: index + 1,
            width: '100%',
            height: `${cardHeight}px`,
            cursor: 'move',
          }}
        >
          {/* Drop indicator line for card reordering */}
          {dropIndicator?.position === 'card' && 
           dropIndicator.stackId === stackId && 
           dropIndicator.targetIndex === index && (
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              [dropIndicator.placement === 'before' ? 'top' : 'bottom']: -2,
              height: 4,
              background: 'blue',
              pointerEvents: 'none'
            }} />
          )}
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

