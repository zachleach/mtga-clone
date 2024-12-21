/* components/CardStack.jsx */
import React, { useRef, useEffect } from 'react'
import { useBoardState } from '../providers/BoardState'
import Card from './Card'

/**
 * MANAGES LAYOUT AND DRAG/DROP BEHAVIOR FOR A VERTICAL STACK OF CARDS
 * CARDS ARE POSITIONED ABSOLUTELY WITH PARTIAL OVERLAP BASED ON STACK SIZE
 * REGISTERS ITSELF WITH BOARDSTATE'S REF SYSTEM FOR POSITION TRACKING
 *
 * @param {Object} props
 * @param {Array} props.card_arr - Array of card objects to display
 * @param {string} props.row - Row identifier for this stack
 * @param {string} props.stack_id - Unique identifier for this stack
 */
const CardStack = ({ card_arr, row, stack_id }) => {
  const { handlers, register_stack_ref } = useBoardState()
  const stack_ref = useRef(null)

  useEffect(() => {
    register_stack_ref(row, stack_id, stack_ref)
    return () => register_stack_ref(row, stack_id, null)
  }, [row, stack_id])

  const card_height = 140
  const overlap = 0.15
  const visible_height = card_height * overlap
  
  const stack_container_styling = {
    position: 'relative',
    height: `${((card_arr.length - 1) * visible_height) + card_height}px`,
    width: `${card_height * 0.714}px`,
    margin: `${card_height * 0.1}px`,
  }

  const get_position_styling = (index) => ({
    position: 'absolute',
    height: `${card_height}px`,
    width: '100%',
    top: `${index * card_height * overlap}px`,
    zIndex: index,
  })

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: (e) => handlers.drag_start.cardstack(e, row, stack_id, index),
    onDrop: (e) => handlers.drop.cardstack(e, row, stack_id, index),
    onDragOver: (e) => handlers.drag_over.cardstack(e, index)
  })

  return (
    <div ref={stack_ref} style={stack_container_styling}>
      {card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)} {...html5_dnd_attributes(index)}>
          <Card {...card} />
        </div>
      ))}
    </div>
  )
}

export default CardStack
