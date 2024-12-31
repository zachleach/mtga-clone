/* components/Stack.jsx */

/* components/Stack.jsx */
import { useState, useRef, useEffect } from 'react'
import { Tile, Card } from '.'

const TILE_ASPECT_RATIO = 626 / 457
const CARD_ASPECT_RATIO = 745 / 1040

export const Stack = ({ stack_state, is_hand = false }) => {

	console.log(stack_state)

	const container_style = {
      position: 'relative',
      height: is_hand ? '100%' : '40%',
      aspectRatio: is_hand ? CARD_ASPECT_RATIO : TILE_ASPECT_RATIO,
      minWidth: 0,
	}

  const get_position_styling = (index) => {
    const total_cards = stack_state.card_arr.length
    const MAX_STACK_HEIGHT = 150
    const stack_spacing = Math.min(25, MAX_STACK_HEIGHT / total_cards)
    const total_stack_height = (total_cards - 1) * stack_spacing
    const start_offset = -(total_stack_height / 2)

    return {
      position: 'absolute',
      height: '100%',
      width: '100%',
      top: `calc(50% + ${start_offset + (index * stack_spacing)}%)`,
      transform: 'translateY(-50%)', 
      zIndex: index,
    }
  }

  if (is_hand) {
    return (
      <div style={container_style}>
        {stack_state && stack_state.card_arr.map((card, index) => (
          <div key={index} style={get_position_styling(index)}>
            <Card art_url={card.card} />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={container_style}>
      {stack_state && stack_state.card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)}>
          <Tile art_url={card.crop} />
        </div>
      ))}
    </div>
  )
}
