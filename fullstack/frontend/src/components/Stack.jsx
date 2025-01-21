/* components/Stack.jsx */
import { useState, useRef, useEffect, useContext, useCallback } from 'react'
import { Card, Server, Client } from '.'

const TILE_ASPECT_RATIO = 626 / 457
const CARD_ASPECT_RATIO = 745 / 1040

export const Stack = ({ stack_state, is_hand = false }) => {

	const { notify_server, State } = useContext(Server)
	const { register_ref } = useContext(Client)

	const uuid = stack_state.uuid

	const container_style = {
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


	const stack_html5_dnd_attr = {

		/* if you move to a new stack while dragging, remove the copied card from previous stack */
		onDragLeave: (event) => {
			if (!event.currentTarget.contains(event.relatedTarget)) {
				console.log(`Stack Container onDragLeave: ${uuid}`)

				if (State.dragged_card !== null) {
					State.Stack.remove(uuid, State.copied_card)
				}
			}
		}


	}



	
	const card_html5_dnd_attr = (card, index) => ({
		onDragStart: (event) => {
			console.log(`Stack onDragStart: ${uuid}`)
			event.dataTransfer.setData('source', uuid)

			const copy = State.Card.copy(card)
			State.set_dragged_card(card)
			State.set_copied_card(copy)
		},

		onDragOver: (event) => {
			event.stopPropagation()
			event.preventDefault()
		},

		onDrop: (event) => {
			event.stopPropagation()

			const source = event.dataTransfer.getData('source')
			console.log(`Stack onDrop: ${source} -> ${uuid}`)

			if (card.uuid !== State.dragged_card.uuid) {
				State.Card.remove(State.dragged_card)
			}

		},

		onDragEnd: (event) => {
			console.log(`Stack onDragEnd: ${uuid}`, event.dataTransfer.dropEffect)
			State.set_dragged_card(null)
			State.set_copied_card(null)
		},

		onDragEnter: (event) => {
			if (!event.currentTarget.contains(event.relatedTarget) && card.uuid !== State.dragged_card.uuid) {
				console.log(`Stack onDragEnter: ${uuid}`)

				/* if stack contains the dragged card, replace the dragged card with copy card */
				const contains_dragged = stack_state.card_arr.some(card => card.uuid === State.dragged_card.uuid)
				if (contains_dragged) {
					State.Stack.remove(uuid, State.dragged_card)
					State.Stack.insert(uuid, State.copied_card, index)
					return
				}

				/* if stack does not contain the copy: insert on top of the card hovered */
				const contains_copy = stack_state.card_arr.some(card => card.uuid === State.copied_card.uuid)
				if (!contains_copy) {
					State.Stack.insert(uuid, State.copied_card, index + 1)
				}
				/* otherwise, if moving the card around in the stack: move the card to the index hovered */
				else {
					if (card.uuid === State.copied_card.uuid) {
						return
					}
					State.Stack.remove(uuid, State.copied_card)
					State.Stack.insert(uuid, State.copied_card, index)
				}
			}
		},



	})




  return (
    <div ref={(ele) => register_ref(uuid, ele)} 
			style={container_style} 
			{...stack_html5_dnd_attr}>

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
