/* components/Hand.jsx */

import { useState } from 'react'
import { Card } from '.'

const Hand = () => {
  const [card_arr, set_card_arr] = useState([ 
		{ img_path: '/src/assets/mh3_101_Mindless_Conscription.png' },
		{ img_path: '/src/assets/mh3_104_Quest_for_the_Necropolis.png' },
		{ img_path: '/src/assets/mh3_105_Refurbished_Familiar.png' },
		{ img_path: '/src/assets/mh3_106_Retrofitted_Transmogrant.png' },
		{ img_path: '/src/assets/mh3_108_Scurrilous_Sentry.png' },
		{ img_path: '/src/assets/mh3_111_Wither_and_Bloom.png' },
		{ img_path: '/src/assets/mh3_112_Wurmcoil_Larva.png' },
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
		const base_height = '100%'
		const aspect_ratio = 745 / 1040
		const card_width = parseInt(base_height) * aspect_ratio
		
		const position = index - (total_cards - 1) / 2
		
		const rotation_multiplier = 4
		const rotation = rotation_multiplier * position
		
		const hand_density = 150
		const hand_density_multiplier = 1
		
		const lower_by = 0.8 * card_width
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
        <div key={index} style={get_card_style(index, card_arr.length)} {...html5_dnd_attributes(index)} >
          <Card {...card} />
        </div>
      ))}
    </div>
  )
}


export default Hand


