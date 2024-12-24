import { useState, useRef, useEffect } from 'react'
import { Tile, Card } from '.'

const TILE_ASPECT_RATIO = 626 / 457
const CARD_ASPECT_RATIO = 745 / 1040


const Stack = ({ stack_id, is_hand = false }) => {
  const [card_arr, set_card_arr] = useState([
    { img_path: '/src/assets/artcrop.png' },
    { img_path: '/src/assets/artcrop.png' },
  ])

	const ASPECT_RATIO = TILE_ASPECT_RATIO
  
  const stack_container_styling = {
    position: 'relative',
    height: '40%',  
    aspectRatio: `${ASPECT_RATIO}`,
    minWidth: 0,          
  }

  const get_position_styling = (index) => {
    const total_cards = card_arr.length
    const MAX_STACK_HEIGHT = 100 
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
