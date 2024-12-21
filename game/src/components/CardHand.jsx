/* components/CardHand.jsx */
import React from 'react'
import { useBoardState } from '../providers/BoardState'
import Card from './Card'

/**
 * COMPONENT FOR DISPLAYING A FANNED HAND OF CARDS
 * CARDS ARE ARRANGED IN A CURVED ARC PATTERN WITH ROTATION AND VERTICAL OFFSET
 * HANDLES DRAG/DROP EVENTS AT THE CARD LEVEL
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
    boxSizing: 'border-box',
  }

  const get_card_style = (index, total_cards) => {
    const card_height = 200
    const card_width = card_height * 0.714
    const position = index - (total_cards - 1) / 2
    const rotation_multiplier = 4
    const hand_density = 120
    const hand_density_multiplier = 1
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

export default CardHand
