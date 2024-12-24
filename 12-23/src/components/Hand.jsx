/* components/Hand.jsx */
import { useState, useRef, useEffect } from 'react'
import { Card } from '.'

const Hand = () => {
  const [card_arr, set_card_arr] = useState([
		{
			card_art: '/src/assets/card1.png',
			tile_art: '/src/assets/crop1.png'
		},
		{
			card_art: '/src/assets/card2.png',
			tile_art: '/src/assets/crop2.png'
		},
		{
			card_art: '/src/assets/card3.png',
			tile_art: '/src/assets/crop3.png'
		},
	])

  const container_style = {
    height: '100%',
    width: '100%',
    background: 'grey',
    border: '1px solid black',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const get_card_style = (index, total_cards) => {
    const base_height = '200%'
    const aspect_ratio = 745 / 1040
    const card_width = parseInt(base_height) * aspect_ratio
    
    const position = index - (total_cards - 1) / 2
    const rotation_multiplier = 8
    const rotation = rotation_multiplier * position
    
    const hand_density = 100
    const hand_density_multiplier = 0.4

    const lower_by = 0.2 * card_width
    const vertical_offset = (Math.pow(position, 2) * rotation_multiplier) + lower_by

    return {
      position: 'absolute',
      height: base_height,
      aspectRatio: aspect_ratio.toString(),
      transform: `rotate(${rotation}deg) translateY(${vertical_offset}px)`,
      transformOrigin: 'bottom center',
      left: `calc(50% - ${card_width / 2}px + ${position * (hand_density / hand_density_multiplier)}px)`,
      backgroundColor: 'transparent',
      zIndex: index,
    }
  }

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: null,
    onDrop: null,
    onDragOver: null
  })

  const container_dnd_attributes = {
    onDrop: null,
    onDragOver: null
  }

  return (
    <div style={container_style} {...container_dnd_attributes}>

			{card_arr.map((card, index) => (
				<div key={index} style={get_card_style(index, card_arr.length)} {...html5_dnd_attributes(index)}>
					<Card card_art={card.card_art} />
				</div>
			))}

    </div>
  )
}

export default Hand
