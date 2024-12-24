/* components/Stack.jsx */
import { useState, useRef, useEffect } from 'react'
import { Tile, Card } from '.'

const TILE_ASPECT_RATIO = 626 / 457
const CARD_ASPECT_RATIO = 745 / 1040


const Stack = ({ stack_id, is_hand = false }) => {

	const same_stack_drop = useRef(false)

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
    onDragStart: (e) => on_drag_start(e, index),
    onDrop: (e) => on_drop(e, index),
    onDragOver: (e) => on_drag_over(e, index),
		onDragEnd: (e) => on_drag_end(e, index),

  })


	const on_drag_start = (e, index) => {
    /* We can store the dragged card data and its source index in dataTransfer */
    const dragged_card = card_arr[index]
    e.dataTransfer.setData('application/json', JSON.stringify({
      card: dragged_card,
      source_index: index,
      source_stack_id: stack_id
    }))
  }

  const on_drag_over = (e, index) => {
    /* Prevent default to allow drop and set move effect */
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const on_drag_end = (e, index) => {
    /* Only remove card if drop was successful */
    if (!same_stack_drop.current && e.dataTransfer.dropEffect === 'move') {
      set_card_arr(prev_cards => 
        prev_cards.filter((_, idx) => idx !== index)
      )
    }
		same_stack_drop.current = false
  }

  const on_drop = (e, drop_index) => {
    e.preventDefault()
    
    /* Get the dropped card data */
    const drop_data = JSON.parse(e.dataTransfer.getData('application/json'))
    const { card, source_index, source_stack_id } = drop_data

		/* mechanism for on_drag_end to cancel the deletion from source stack after the drop occurs */
		same_stack_drop.current = source_stack_id === stack_id
    
    set_card_arr(prev_cards => {
      /* For same stack, filter out the source card first */
      const cards_without_source = source_stack_id === stack_id 
        ? prev_cards.filter((_, idx) => idx !== source_index)
        : prev_cards
        
      /* Insert the dropped card at the target position */
      const new_cards = [...cards_without_source]
      new_cards.splice(drop_index, 0, card)
      return new_cards
    })
  }


  return (
    <div style={stack_container_styling}>

			{card_arr.map((card, index) => (
				<div key={index} style={get_position_styling(index)} {...html5_dnd_attributes(index)}>
					<Tile tile_art={card.tile_art} />
				</div>
			))}

    </div>
  )
}

export default Stack
