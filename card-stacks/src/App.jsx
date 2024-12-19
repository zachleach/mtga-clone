import { useState, useEffect, useRef } from 'react'
import './remove_scrollbars.css'
import { ListenersProvider, useListeners } from './Listeners'


const Card = ({ color }) => {
  const card_style = {
    width: '100%',
    height: '100%',
    backgroundColor: color || 'white',
    border: '1px solid black',
    borderRadius: '12px',
  }

  return (
    <div style={card_style}/>
  )
}


/* 
 * Global styling constants shared between CardStack and CardFan 
 */
const CARD_HEIGHT = 150
const CARD_WIDTH = CARD_HEIGHT * 0.714


/*
 * Calculates styling for a card in the fan based on its position
 * Uses position relative to center to determine rotation and offset
 */
const get_fan_position_styling = (index, total_cards) => {
  const position = index - (total_cards - 1) / 2
  const rotation = 4 * position
  const vertical_offset = (Math.pow(position, 2) * 4) + (0.8 * CARD_WIDTH)

  return {
    position: 'absolute',
    height: `${CARD_HEIGHT}px`,
    width: `${CARD_WIDTH}px`,
    transform: `rotate(${rotation}deg) translateY(${vertical_offset}px)`,
    transformOrigin: 'bottom center',
    left: `calc(50% - ${CARD_WIDTH / 2}px + ${position * 120}px)`,
    zIndex: index,
  }
}


/**
 * CardFan component - renders cards in a curved fan layout
 * Used by CardHand for visual presentation of cards
 */
const CardFan = ({ card_arr, row_id, stack_id }) => {


	const { listeners, register_stack_ref, register_fan_card_ref } = useListeners()
  const fan_ref = useRef(null)
  const card_refs = useRef([])


  /* register container ref for overall fan positioning */
  useEffect(() => {
    register_stack_ref(row_id, stack_id, fan_ref)
    return () => register_stack_ref(row_id, stack_id, null)
  }, [row_id, stack_id])

 /* register individual card refs for precise fan position calculations */
  useEffect(() => {
    card_arr.forEach((_, index) => {
      register_fan_card_ref(row_id, stack_id, index, card_refs[index])
    })
    return () => {
      card_arr.forEach((_, index) => {
        register_fan_card_ref(row_id, stack_id, index, null)
      })
    }
  }, [row_id, stack_id, card_arr.length])

  const fan_container_styling = {
    position: 'relative',
    height: `${CARD_HEIGHT * 1.5}px`, /* Extra height for card rotation */
    width: `${CARD_WIDTH * 3}px`,     /* Extra width for fan spread */
    margin: `${CARD_HEIGHT * 0.1}px`,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  }

  /* HTML5 drag and drop handlers remain consistent with CardStack */
  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: (e) => listeners.drag_start.cardstack(e, row_id, stack_id, index),
    onDrop: (e) => listeners.drop.cardstack(e, row_id, stack_id, index),
    onDragOver: (e) => listeners.drag_over.cardstack(e, index)
  })



	return (
    <div ref={fan_ref} style={fan_container_styling}>
      {card_arr.map((card, index) => (
        <div 
          key={index}
          ref={card_refs.current[index]}
          style={get_fan_position_styling(index, card_arr.length)}
          {...html5_dnd_attributes(index)}
        >
          <Card {...card} />
        </div>
      ))}
    </div>
  )
}


/**
 * CardHand component - container for a player's hand of cards
 * Uses CardFan for layout and connects to drag/drop system
 */

const CardHand = ({ row }) => {
  const { listeners } = useListeners()

  const container_style = {
    height: '25%',
    width: '100%',
    background: '#2a2a2a',
    border: '1px solid black',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  /* single fan layout - hands don't support multiple stacks */
  const stack = row.stacks[0]

  /* mirror cardrow pattern for event handling */
  const html5_dnd_attributes = {
    onDragOver: (e) => listeners.drag_over.cardhand(e),
    onDrop: (e) => listeners.drop.cardhand(e, row.id, stack.id)
  }

  return (
    <div style={container_style} {...html5_dnd_attributes}>
      <CardFan
        key={stack.id}
        card_arr={stack.cards}
        row_id={row.id}
        stack_id={stack.id}
      />
    </div>
  )
}




/**
 * layout component that also handles drag/drop of cards to/from it 
 */
const CardStack = ({ card_arr, row_id, stack_id }) => {
  const { listeners, register_stack_ref } = useListeners()
  const stack_ref = useRef(null)

  useEffect(() => {
    register_stack_ref(row_id, stack_id, stack_ref)
    return () => register_stack_ref(row_id, stack_id, null)
  }, [row_id, stack_id])

  const overlap = 0.15
  const visible_height = CARD_HEIGHT * overlap
  
  const stack_container_styling = {
    position: 'relative',
    height: `${((card_arr.length - 1) * visible_height) + CARD_HEIGHT}px`,
    width: `${CARD_WIDTH}px`,
    margin: `${CARD_HEIGHT * 0.1}px`,
  }

  const get_position_styling = (index) => ({
    position: 'absolute',
    height: `${CARD_HEIGHT}px`,
    width: '100%',
    top: `${index * CARD_HEIGHT * overlap}px`,
    zIndex: index,
  })

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: (e) => listeners.drag_start.cardstack(e, row_id, stack_id, index),
    onDrop: (e) => listeners.drop.cardstack(e, row_id, stack_id, index),
    onDragOver: (e) => listeners.drag_over.cardstack(e, index)
  })

  return (
    <div ref={stack_ref} style={stack_container_styling}>
      {card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)} {...html5_dnd_attributes(index)} >
          <Card {...card} />
        </div>
      ))}
    </div>
  )
}


/**
 * renders an array of card arrays (stacks of cards)
 */
const CardRow = ({ row }) => {
  const { listeners } = useListeners()

  const container_style = {
    height: '20%', 
    width: '100%', 
    background: 'grey',
    border: '1px solid black',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const html5_dnd_attributes = {
    onDragOver: (e) => listeners.drag_over.cardrow(e, row.id),
    onDrop: (e) => listeners.drop.cardrow(e, row.id),
  }

  return (
    <div style={container_style} {...html5_dnd_attributes}>
      {row.stacks.map(stack => (
        <CardStack
          key={stack.id}
          card_arr={stack.cards}
          row_id={row.id}
          stack_id={stack.id}
        />
      ))}
    </div>
  )
}


/**
 * Board component renders card rows and the player's hand
 */
const Board = () => {
  const { rows } = useListeners()

  const container_style = {
    display: 'flex',  
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  }

  /* Filter rows based on type - regular rows vs hand */
  const regular_rows = rows.filter(row => row.type !== 'hand')
  const hand_row = rows.find(row => row.type === 'hand')

  return (
    <div style={container_style}>
      {regular_rows.map(row => (
        <CardRow 
          key={row.id}
          row={row}
        />
      ))}
      {hand_row && (
        <CardHand
          key={hand_row.id}
          row={hand_row}
        />
      )}
    </div>
  )
}


const App = () => {
  return (
    <ListenersProvider>
      <Board/>
    </ListenersProvider>
  )
}

export default App
