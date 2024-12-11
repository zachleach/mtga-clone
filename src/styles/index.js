export const container = {
  height: '100%', 
  display: 'flex', 
  flex_direction: 'column',
  position: 'relative'
}

export const layout = {
  top: {
    flex: '4',
    background_color: '#f0f0f0'
  },
  bottom: {
    flex: '1',
    display: 'flex',
    position: 'relative',
    padding: '8px',
    background_color: '#e0e0e0',
    justify_content: 'center',
    align_items: 'flex-end',
  }
}

export const create_card_style = (index, total_cards, is_dragging, is_drag_over) => {
  const card_width = 200;
  const position = index - (total_cards - 1) / 2;
  const rotation_multiplier = 4;
  const rotation = position * rotation_multiplier;
  const vertical_offset = Math.pow(position, 2) * rotation_multiplier + (0.8 * card_width);
  
  return {
    width: `${card_width}px`,
    height: `${card_width / 0.714}px`,
    background_color: 'white',
    border: '1px solid black',
    border_radius: '8px',
    transform: `rotate(${rotation}deg) translateY(${vertical_offset}px)`,
    transform_origin: 'bottom center',
    position: 'absolute',
    left: `calc(50% - ${card_width / 2}px + ${position * 120}px)`,
    opacity: is_dragging ? 0.5 : 1,
    cursor: 'grab',
    outline: is_drag_over ? '2px solid blue' : 'none',
  }
}

export const card_image = {
  width: '100%',
  height: '100%',
  object_fit: 'cover',
  border_radius: 'inherit'
}

export const preview = {
  position: 'fixed',
  bottom: '20px',
  width: '300px',
  height: '420px',
  transform: 'translateX(-50%)',
  z_index: 1000,
  border_radius: '12px',
  box_shadow: '0 4px 8px rgba(0,0,0,0.2)',
  pointer_events: 'none'
}
