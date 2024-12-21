/* Board.jsx */
import { useState, useEffect, useRef } from 'react'
import { useBoardState } from './BoardState'
import { useGameState } from './GameState'

/**
 * Base visual component representing a single card.
 * Uses relative sizing based on container dimensions.
 */
const Card = ({ color, container_height }) => {
  const card_height = container_height * 0.6
  
  const card_style = {
    width: `${card_height * 0.714}px`,
    height: `${card_height}px`,
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
 * Supports relative sizing and rotated coordinate spaces.
 */
const CardStack = ({ card_arr, row, stack_id, container_height }) => {
  const { handlers, register_stack_ref } = useBoardState()
  const { active_player } = useGameState()
  const stack_ref = useRef(null)
  
  const card_height = container_height * 0.6
  const overlap = 0.15
  const visible_height = card_height * overlap
  
  useEffect(() => {
    register_stack_ref(row, stack_id, stack_ref)
    return () => register_stack_ref(row, stack_id, null)
  }, [row, stack_id])

  const stack_container_styling = {
    position: 'relative',
    height: `${((card_arr.length - 1) * visible_height) + card_height}px`,
    width: `${card_height * 0.714}px`,
    margin: `${card_height * 0.1}px`,
  }

  const is_rotated = active_player !== 0

  const get_position_styling = (index) => ({
    position: 'absolute',
    height: `${card_height}px`,
    width: '100%',
    top: `${index * card_height * overlap}px`,
    zIndex: index,
    transform: is_rotated ? 'rotate(180deg)' : undefined
  })

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: (e) => handlers.drag_start.cardstack(e, row, stack_id, index, active_player),
    onDrop: (e) => handlers.drop.cardstack(e, row, stack_id, index),
    onDragOver: (e) => handlers.drag_over.cardstack(e, index)
  })

  return (
    <div ref={stack_ref} style={stack_container_styling}>
      {card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)} {...html5_dnd_attributes(index)}>
          <Card {...card} container_height={container_height} />
        </div>
      ))}
    </div>
  )
}

/**
 * Container component for a row of card stacks.
 * Handles relative sizing and rotated drop zones.
 */
const CardRow = ({ row, row_position, container_height }) => {
  const { handlers } = useBoardState()
  const { active_player } = useGameState()

  const is_rotated = active_player !== 0

  const container_style = {
    background: 'grey',
    border: '1px solid black',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    transform: is_rotated ? 'rotate(180deg)' : undefined
  }

  const html5_dnd_attributes = {
    onDragOver: (e) => handlers.drag_over.cardrow(e, row_position),
    onDrop: (e) => handlers.drop.cardrow(e, row_position)
  }

  return (
    <div style={container_style} {...html5_dnd_attributes}>
      {row.stacks.map(stack => (
        <CardStack
          key={stack.id}
          card_arr={stack.cards}
          row={row_position}
          stack_id={stack.id}
          container_height={container_height}
        />
      ))}
    </div>
  )
}

/**
 * Component for displaying a fanned hand of cards.
 * Implements relative sizing and rotated coordinate handling.
 */
const CardHand = ({ container_height }) => {
  const { hand, handlers } = useBoardState()
  const { active_player } = useGameState()
  
  const is_rotated = active_player !== 0
  const card_height = container_height * 0.6
  const card_width = card_height * 0.714
  
  const container_style = {
    height: '100%',
    width: '100%',
    background: 'grey',
    border: '1px solid black',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    transform: is_rotated ? 'rotate(180deg)' : undefined
  }

  const get_card_style = (index, total_cards) => {
    const position = index - (total_cards - 1) / 2
    
    const rotation_multiplier = 4
    const hand_density = card_width * 0.6
    const hand_density_multiplier = 1
    
    const rotation = rotation_multiplier * position
    const lower_by = 0.8 * card_width
    const vertical_offset = (Math.pow(position, 2) * rotation_multiplier) + lower_by

    return {
      position: 'absolute',
      height: `${card_height}px`,
      width: `${card_width}px`,
      transform: `
        rotate(${rotation + (is_rotated ? 180 : 0)}deg)
        translateY(${vertical_offset}px)
      `,
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
          <Card {...card} container_height={container_height} />
        </div>
      ))}
    </div>
  )
}

/**
 * Main board component managing layout and size calculations.
 */
const Board = () => {
  const { rows } = useBoardState()
  const [container_height, set_container_height] = useState(0)
  const board_ref = useRef(null)
  
  useEffect(() => {
    const update_height = () => {
      if (board_ref.current) {
        set_container_height(board_ref.current.clientHeight)
      }
    }
    
    update_height()
    window.addEventListener('resize', update_height)
    return () => window.removeEventListener('resize', update_height)
  }, [])

  const [top_row, left_row, right_row] = rows

  return (
    <div ref={board_ref} style={{ height: '100%' }}>
      <div style={{ height: '50%' }}>
        <CardRow 
          row={top_row} 
          row_position="top" 
          container_height={container_height * 0.5} 
        />
      </div>
      <div style={{ height: '25%', display: 'flex' }}>
        <CardRow 
          row={left_row}
          row_position="left"
          container_height={container_height * 0.25}
        />
        <CardRow 
          row={right_row}
          row_position="right"
          container_height={container_height * 0.25}
        />
      </div>
      <div style={{ height: '25%' }}>
        <CardHand container_height={container_height * 0.25} />
      </div>
    </div>
  )
}

export default Board
