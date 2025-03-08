/* components/Stack.jsx */
import { useState, useRef, useEffect, useContext, useCallback } from 'react'
import { Card, Server } from '.'

const TILE_ASPECT_RATIO = 626 / 457
const CARD_ASPECT_RATIO = 745 / 1040

export const Stack = ({ stack_state, is_hand = false }) => {
	const uuid = stack_state.uuid
	const { State, set_and_sync_state } = useContext(Server)

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

	const handle_click = () => {
		const game_state_after_tapping = State.Stack.tap(State.game_state, uuid)
		set_and_sync_state(game_state_after_tapping)
	}

	const card_html5_dnd_attr = (dest_card, dest_card_stack_index) => ({
		onDragStart: (event) => {
			event.dataTransfer.setData('source_card_uuid', dest_card.uuid)
		},

		onDragOver: (event) => {
			event.stopPropagation()
			event.preventDefault()
		},

		/* remove card from source stack, then insert at drop index */
		onDrop: (event) => {
			event.stopPropagation()
			const source_card_uuid = event.dataTransfer.getData('source_card_uuid')
			if (source_card_uuid === dest_card.uuid) {
				return
			}

			const { game_state: game_state_post_removal, removed_card_obj } = State.Card.remove(State.game_state, source_card_uuid)
			const game_state_post_insertion = State.Stack.insert(game_state_post_removal, uuid, removed_card_obj, dest_card_stack_index)
			set_and_sync_state(game_state_post_insertion)
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
						name={card.name}
						card_art={card.card}
						is_hand={is_hand}
						outline={State.Card.is_targetted(card.uuid) === true ? '4px solid red' : 'none'}
					/>
        </div>
      ))}

    </div>
  )
}
