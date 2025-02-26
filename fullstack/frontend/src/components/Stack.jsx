/* components/Stack.jsx */
import { useState, useRef, useEffect, useContext, useCallback } from 'react'
import { Card, Server } from '.'

const TILE_ASPECT_RATIO = 626 / 457
const CARD_ASPECT_RATIO = 745 / 1040

export const Stack = ({ stack_state, is_hand = false }) => {
	const uuid = stack_state.uuid
	const { State, push_changes } = useContext(Server)

	const handle_click = () => {
		console.log('StackClickEvent')
		State.Stack.tap(uuid)
		push_changes()
	}

	const container_style = {
		transform: stack_state.is_tapped ? `rotate(6deg)` : null,
		position: 'relative',
		height: is_hand === true ? '100%' : '40%',
		aspectRatio: is_hand === true ? CARD_ASPECT_RATIO : TILE_ASPECT_RATIO,
		minWidth: 0,
		margin: '10px'
	}

  const get_position_styling = (index) => {
    const total_cards = stack_state.card_arr.length
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





	
	const card_html5_dnd_attr = (card, index) => ({
		onDragStart: (event) => {
			console.log(`Stack onDragStart: ${uuid}`)
			event.dataTransfer.setData('source', card.uuid)
		},

		onDragOver: (event) => {
			event.stopPropagation()
			event.preventDefault()
		},

		/* remove card from source stack, then insert at drop index */
		onDrop: (event) => {
			event.stopPropagation()
			const source = event.dataTransfer.getData('source')
			console.log(`Stack onDrop: ${source} -> ${uuid}`)

			const card = State.Card.remove(source)
			State.Stack.insert(uuid, card, index)
			push_changes()
		},

		onDragEnter: (event) => {
			event.stopPropagation()
		},

		onDragLeave: (event) => {
			event.stopPropagation()
		}



	})




  return (
    <div style={container_style} onClick={handle_click}>

      {stack_state.card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)} {...card_html5_dnd_attr(card, index)}>
          <Card 
						uuid={card.uuid}
						art_url={is_hand === true ? card.card : card.crop} 
						aspect_ratio={is_hand === true ? CARD_ASPECT_RATIO : TILE_ASPECT_RATIO} 
						opacity={State.dragged_card === card ? '25%' : '100%'}
					/>
        </div>
      ))}

    </div>
  )
}
