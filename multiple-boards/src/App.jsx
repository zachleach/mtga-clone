import './App.css'
import { useState, useEffect, useRef } from 'react'



const CardStack = ({ stack_id, is_hand = false }) => {
	const [card_arr, set_card_arr] = useState([
		{ imgSrc: '/src/artcrop.jpg' },
		{ imgSrc: '/src/artcrop.jpg' },
  ])

  const stack_container_styling = {
    position: 'relative',
    height: '75%',  
    width: 'auto', 
    aspectRatio: '0.714',  
    margin: '0pt 8pt',    
    flex: '0 1 auto',      
    minWidth: 0,          
  }

  const get_position_styling = (index) => {
    const totalCards = card_arr.length;
    const stackSpacing = 15; 
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
          <Card {...card} />
        </div>
      ))}
    </div>
  )
}





const CardRow = ({ h, w }) => {
  const [stack_ids, set_stack_ids] = useState(['0', '1', '2' ])

  const container_style = {
    background: 'white',
    border: '1px solid black',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    overflow: 'hidden',  
  }

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: null,
    onDrop: null,
    onDragOver: null
  })

  return (
    <div style={container_style} {...html5_dnd_attributes}>
      {stack_ids.map(id => (
        <CardStack key={id} stack_id={id} />
      ))}
    </div>
  )
}

const Board = ({ opp = false }) => {
  const container_style = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    minWidth: 0,  
    alignItems: 'center',
    justifyContent: 'flex-start',

  }

  return (
    <div style={container_style}>
      <div style={{ width: '100%', flex: 4 }}>
        <CardRow />
      </div>
      <div style={{ width: '100%', flex: 3,  display: 'flex' }}>
        <CardRow />
      </div>
			{!opp && (
				<div style={{ width: '100%', height: '25%', flex: 1 }}>
					<CardHand />
				</div>
			)}
    </div>
  )
}




const CardHand = () => {
  const [card_arr, set_card_arr] = useState([ 
		{ imgSrc: '/src/assets/mh3_101_Mindless_Conscription.png' },
		{ imgSrc: '/src/assets/mh3_104_Quest_for_the_Necropolis.png' },
		{ imgSrc: '/src/assets/mh3_105_Refurbished_Familiar.png' },
		{ imgSrc: '/src/assets/mh3_106_Retrofitted_Transmogrant.png' },
		{ imgSrc: '/src/assets/mh3_108_Scurrilous_Sentry.png' },
		{ imgSrc: '/src/assets/mh3_111_Wither_and_Bloom.png' },
		{ imgSrc: '/src/assets/mh3_112_Wurmcoil_Larva.png' },
	])
  
  const container_style = {
    height: '100%',
    width: '100%',
    background: 'grey',
    border: '1px solid black',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',  
  }

	const get_card_style = (index, total_cards) => {
		const base_height = '100%'
		const aspect_ratio = 0.714
		const card_width = parseInt(base_height) * aspect_ratio
		
		const position = index - (total_cards - 1) / 2
		
		const rotation_multiplier = 4
		const rotation = rotation_multiplier * position
		
		const hand_density = 120
		const hand_density_multiplier = 1
		
		const lower_by = 0.8 * card_width
		const vertical_offset = (Math.pow(position, 2) * rotation_multiplier) + lower_by

		return {
			position: 'absolute',
			height: base_height,
			aspectRatio: aspect_ratio.toString(),
			transform: `rotate(${rotation}deg) translateY(${vertical_offset}px)`,
			transformOrigin: 'bottom center',
			left: `calc(50% - ${card_width / 2}px + ${position * (hand_density / hand_density_multiplier)}px - 75px)`,
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


const Card = ({ imgSrc }) => {
	const h = 125;

  const card_style = {
    height: `${h}px`,
		width: `${1.36 * h}px`,
		overflow: 'hidden',
		background: 'black',
		border: '2px solid black',
		borderRadius: '8px',
  }

  const img_style = {
    width: '100%',
    height: '100%',
    display: 'block',
  }

  return (
    <div style={card_style}>
      <img 
        src={imgSrc} 
        alt="Card" 
        style={img_style}
      />
    </div>
  )
}






const App = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
			<Board />
			<Board />
    </div>
  )
}

export default App
