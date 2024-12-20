/* App.jsx */
import { useState, useEffect, useRef } from 'react'
import './remove_scrollbars.css'
import { BoardStateProvider, useBoardState } from './BoardState'

/**
 * Base visual component representing a single card.
 * Renders as a colored rectangle with rounded corners and border.
 *
 * @param {Object} props
 * @param {string} props.color - Color to fill card background
 *
 */
const Card = ({ color }) => {
  const card_style = {
    width: '100%',
    height: '100%',
    backgroundColor: color || 'white',
    border: '1px solid black',
    borderRadius: '12px',
  }

  return (
    <div style={card_style}/>
  )
}

/**
 * Manages layout and drag/drop behavior for a vertical stack of cards.
 * Cards are positioned absolutely with partial overlap based on stack size.
 * Registers itself with BoardState's ref system for position tracking.
 * Handles drag/drop events at the card level.
 *
 * @param {Object} props
 * @param {Array} props.card_arr - Array of card objects to display
 * @param {string} props.row - Row identifier for this stack
 * @param {string} props.stack_id - Unique identifier for this stack
 *
 */
const CardStack = ({ card_arr, row, stack_id }) => {
  const { handlers, register_stack_ref } = useBoardState()
  const stack_ref = useRef(null)

  /* register ref on mount, clear on unmount */
  useEffect(() => {
    register_stack_ref(row, stack_id, stack_ref)
    return () => register_stack_ref(row, stack_id, null)
  }, [row, stack_id])

  const card_height = 140
  const overlap = 0.15
  const visible_height = card_height * overlap
  
  const stack_container_styling = {
    position: 'relative',
    height: `${((card_arr.length - 1) * visible_height) + card_height}px`,
    width: `${card_height * 0.714}px`,
    margin: `${card_height * 0.1}px`,
  }

  const get_position_styling = (index) => ({
    position: 'absolute',
    height: `${card_height}px`,
    width: '100%',
    top: `${index * card_height * overlap}px`,
    zIndex: index,
  })

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: (e) => handlers.drag_start.cardstack(e, row, stack_id, index),
    onDrop: (e) => handlers.drop.cardstack(e, row, stack_id, index),
    onDragOver: (e) => handlers.drag_over.cardstack(e, index)
  })

  return (
    <div ref={stack_ref} style={stack_container_styling}>
      {card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)} {...html5_dnd_attributes(index)} >
          <Card {...card} />
        </div>
      ))}
    </div>
  )
}

/**
 * Container component for a horizontal row of card stacks.
 * Handles drag/drop events at the row level for creating new stacks.
 * Maintains consistent height and spacing of stacks within row.
 *
 * @param {Object} props
 * @param {Object} props.row - Row state object containing stack data
 * @param {string} props.row_position - Identifier for row position ('top', 'left', 'right')
 *
 */
const CardRow = ({ row, row_position }) => {
  const { handlers } = useBoardState()

  const container_style = {
    height: '20%', 
    width: '100%', 
    background: 'grey',
    border: '1px solid black',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const html5_dnd_attributes = {
    onDragOver: (e) => handlers.drag_over.cardrow(e, row_position),
    onDrop: (e) => handlers.drop.cardrow(e, row_position),
  }

  return (
    <div style={container_style} {...html5_dnd_attributes}>
      {row.stacks.map(stack => (
        <CardStack
          key={stack.id}
          card_arr={stack.cards}
          row={row_position}
          stack_id={stack.id}
        />
      ))}
    </div>
  )
}




/**
 * Component for displaying a fanned hand of cards at the bottom of the board.
 * Cards are arranged in a curved arc pattern with rotation and vertical offset.
 * Handles drag/drop events at the card level.
 */


const CardHand = () => {
  const { hand, handlers } = useBoardState()
  
  const container_style = {
    height: '20%',
    width: '100%',
    background: 'grey',
    border: '1px solid black',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const get_card_style = (index, total_cards) => {
    const card_height = 200
    const card_width = card_height * 0.714
    
    /* position is relative to center */
    const position = index - (total_cards - 1) / 2
    
    /* card fan parameters */
    const rotation_multiplier = 4
    const hand_density = 120
    const hand_density_multiplier = 1
    
    /* calculate rotation and offsets */
    const rotation = rotation_multiplier * position
    const lower_by = 0.8 * card_width
    const vertical_offset = (Math.pow(position, 2) * rotation_multiplier) + lower_by

    return {
      position: 'absolute',
      height: `${card_height}px`,
      width: `${card_width}px`,
      transform: `rotate(${rotation}deg) translateY(${vertical_offset}px)`,
      transformOrigin: 'bottom center',
      left: `calc(50% - ${card_width / 2}px + ${position * (hand_density / hand_density_multiplier)}px)`,
      backgroundColor: 'transparent',
      zIndex: index,
    }
  }

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: (e) => handlers.drag_start.hand(e, index),
    onDrop: (e) => handlers.drop.hand(e, index),
    onDragOver: handlers.drag_over.hand
  })

  const container_dnd_attributes = {
    onDrop: (e) => handlers.drop.hand_container(e, hand.cards.length, e.clientX),
    onDragOver: handlers.drag_over.hand_container
  }

  return (
    <div style={container_style} {...container_dnd_attributes}>
      {hand.cards.map((card, index) => (
        <div
          key={index}
          style={get_card_style(index, hand.cards.length)}
          {...html5_dnd_attributes(index)}
        >
          <Card {...card} />
        </div>
      ))}
    </div>
  )
}





/**
 * Main layout component organizing three rows of card stacks and a card hand.
 * Provides full-height container and centers content vertically and horizontally.
 * Consumes row and hand data from BoardState context.
 */
const Board = () => {
  const { rows } = useBoardState()
  const [top_row, left_row, right_row] = rows

  const container_style = {
    display: 'flex',  
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  }

  return (
    <div style={container_style}>
      <CardRow row={top_row} row_position="top" />
      <CardRow row={left_row} row_position="left" />
      <CardRow row={right_row} row_position="right" />
      <CardHand />
    </div>
  )
}

/**
 * Root component wrapping Board with BoardState provider.
 * Ensures all child components have access to shared state management.
 */
const App = () => {
  return (
    <BoardStateProvider>
      <Board/>
    </BoardStateProvider>
  )
}

export default App
