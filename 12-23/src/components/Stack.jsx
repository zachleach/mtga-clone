/* components/Stack.jsx */
import { useState, useRef, useEffect } from 'react'
import { Tile, Card } from '.'

const TILE_ASPECT_RATIO = 626 / 457
const CARD_ASPECT_RATIO = 745 / 1040

const Stack = ({ stack_id, self_destruct_func, init_card = null, use_cards = false }) => {
  const same_stack_drop = useRef(false)

  const [card_arr, set_card_arr] = useState(() => 
    init_card ? [init_card] : []
  )

  useEffect(() => {
    if (card_arr.length === 0) {
      self_destruct_func(stack_id)
    }
  }, [card_arr.length, stack_id, self_destruct_func])

  const aspect_ratio = use_cards ? CARD_ASPECT_RATIO : TILE_ASPECT_RATIO
  
  const stack_container_styling = {
    position: 'relative',
    height: use_cards ? '100%' : '40%',  
    aspectRatio: aspect_ratio,
    minWidth: 0,          
  }

  const get_position_styling = (index) => {
    const total_cards = card_arr.length
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

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: (e) => on_drag_start(e, index),
    onDrop: (e) => on_drop(e, index),
    onDragOver: (e) => on_drag_over(e, index),
    onDragEnd: (e) => on_drag_end(e, index),
  })

  const on_drag_start = (e, index) => {
    const dragged_card = card_arr[index]
    e.dataTransfer.setData('application/json', JSON.stringify({
      card: dragged_card,
      source_index: index,
      source_stack_id: stack_id
    }))
  }

  const on_drag_over = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const on_drag_end = (e, index) => {
    if (!same_stack_drop.current && e.dataTransfer.dropEffect === 'move') {
      set_card_arr(prev_cards => 
        prev_cards.filter((_, idx) => idx !== index)
      )
    }
    same_stack_drop.current = false
  }

  const on_drop = (e, drop_index) => {
    e.preventDefault()
    e.stopPropagation()
    
    const drop_data = JSON.parse(e.dataTransfer.getData('application/json'))
    const { card, source_index, source_stack_id } = drop_data

    same_stack_drop.current = source_stack_id === stack_id
    
    set_card_arr(prev_cards => {
      const cards_without_source = source_stack_id === stack_id 
        ? prev_cards.filter((_, idx) => idx !== source_index)
        : prev_cards
        
      const new_cards = [...cards_without_source]
      new_cards.splice(drop_index, 0, card)
      return new_cards
    })
  }

  const DisplayComponent = use_cards ? Card : Tile
  const art_prop = use_cards ? 'card_art' : 'tile_art'

  return (
    <div style={stack_container_styling}>
      {card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)} {...html5_dnd_attributes(index)}>
          <DisplayComponent {...{[art_prop]: card[art_prop]}} />
        </div>
      ))}
    </div>
  )
}

export default Stack
