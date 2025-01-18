/* components/Stack.jsx */
import { useState, useRef, useEffect, useContext } from 'react'
import { Card, Server } from '.'

const TILE_ASPECT_RATIO = 626 / 457
const CARD_ASPECT_RATIO = 745 / 1040

export const Stack = ({ stack_state, is_hand = false }) => {

	const { notify_server, State } = useContext(Server)

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

	const html5_dnd_attr = (card, index) => ({
		onDragStart: (event) => {
			console.log(`Card onDragStart: ${uuid}`)
			event.dataTransfer.setData('source', uuid)

			/* set the card */
			State.set_dragged_card(card)
		},

		onDragOver: (event) => {
			event.stopPropagation()
			event.preventDefault()
		},

		onDrop: (event) => {
			event.stopPropagation()

			/* remove the source card from the source stack? i swear this made sense but didn't work last time i implemented it */
			 
			const source = event.dataTransfer.getData('source')
			console.log(`Stack onDrop: ${source} -> ${uuid}`)
		},

		onDragEnd: (event) => {
			State.set_dragged_card(null)
		},

		onDragEnter: (event) => {
			const same_stack = stack_state.card_arr.some(card => card.uuid === State.dragged_card.uuid)
			if (!event.currentTarget.contains(event.relatedTarget) && !same_stack) {
				console.log(`Stack onDragEnter: ${uuid}`)

				/* you need some kind of mechanism for removing the dragged card from whatever stack it was in before inserting it into this new stack */
				/* also, currently, when you delete a stack on removal, it causes the rest of the cards to shift before releasing the key */
				State.Stack.insert(uuid, State.dragged_card, index)

			}
		},

		onDragLeave: (event) => {
			if (!event.currentTarget.contains(event.relatedTarget)) {
				console.log(`Stack onDragLeave: ${uuid}`)
			}
		}

	})




  return (
    <div style={container_style}>
      {stack_state.card_arr.map((card, index) => (

        <div key={index} style={get_position_styling(index)} {...html5_dnd_attr(card, index)}>
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
