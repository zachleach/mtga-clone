/* components/Stack.jsx */

import { useState } from 'react'
import { Tile, Card } from '.'

const Stack = ({ stack_id, is_hand = false }) => {
	const [card_arr, set_card_arr] = useState([
		{ img_path: '/src/assets/artcrop.jpg' }
  ])

	/*
  const [card_arr, set_card_arr] = useState([ 
		{ img_path: '/src/assets/mh3_101_Mindless_Conscription.png' },
		{ img_path: '/src/assets/mh3_104_Quest_for_the_Necropolis.png' },
		{ img_path: '/src/assets/mh3_105_Refurbished_Familiar.png' },
	])
	*/

	const stack_container_styling = {
		position: 'relative',
		height: '100%',  
		width: 'auto', 
		aspectRatio: (626 / 457).toString(),  
		margin: '0pt 0pt',    
		flex: '1 1 auto',      
		minWidth: 0,          
	}

  const get_position_styling = (index) => {
    const totalCards = card_arr.length;
    const stackSpacing = 8; 
    const totalStackHeight = (totalCards - 1) * stackSpacing;
    const startOffset = -(totalStackHeight / 2); 

    return {
      position: 'absolute',
      height: '100%',
      width: '100%',
      top: `calc(50% + ${startOffset + (index * stackSpacing)}%)`,
      transform: 'translateY(-50%)', 
      zIndex: index,
    }
  }

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: (e) => on_drag_start(e),
    onDrop: (e) => on_drop(e),
    onDragOver: (e) => on_drag_over(e)
  })

  const on_drag_start = (e, index) => {}
  const on_drag_end = (e, index) => {}
  const on_drop = (e, index) => {}
  const on_drag_over = (e, index) => {}

  return (
    <div style={stack_container_styling}>
      {card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)} {...html5_dnd_attributes(index)}>
          <Tile {...card} />
        </div>
      ))}
    </div>
  )
}

export default Stack
