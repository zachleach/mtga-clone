/* components/Card.jsx */

import { useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Server } from '.'

export const Card = ({ uuid, art_url, aspect_ratio = 745 / 1040, outline, opacity, name, card_art, disable_preview, is_hand, is_tapped }) => {

	const card_ref = useRef(null)
	const timeout_ref = useRef(null)

	const [is_hovered, set_is_hovered] = useState(false)
	const [preview_position, set_preview_position] = useState(false)
	const [show_preview, set_show_preview] = useState(false)

	const { State, set_and_sync_state } = useContext(Server)

  const container_style = {
    height: '100%',
    aspectRatio: aspect_ratio,
    overflow: 'hidden',
    background: 'black',
    border: is_hovered ? (State.Player.is_targetting() ? '2px solid red' : '2px solid blue') : '2px solid black',
    borderRadius: '12px',
		outline: `${outline}`,
		opacity: `${opacity}`,
		position: 'relative',
		transform: is_tapped ? `rotate(6deg)` : null,
  }

  const img_style = {
    width: '100%',
    height: '100%',
    display: 'block',
		objectFit: 'cover',
  }

	const preview_style = () => {
		const card_rect = card_ref.current.getBoundingClientRect()
		
		/* if card is in hand, preview at bottom */
		if (is_hand === true) {
			const card_center_x = card_rect.left + (card_rect.width / 2)
			
			return {
				pointerEvents: 'none',
				position: 'fixed',
				width: '500px',
				aspectRatio: 745 / 1040,
				border: '2px solid black',
				borderRadius: '24px',
				zIndex: 9999,
				left: `${card_center_x}px`,
				bottom: '100px',
				transform: 'translateX(-50%)', 
				boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
				overflow: 'hidden'
			}
		} 
		else {
			const card_middle_y = card_rect.top + (card_rect.height / 2)
			const horizontal_position = {}

			if (preview_position === 'left') {
				horizontal_position.right = `calc(100% - ${card_rect.left}px + 100px)`
			} 
			else {
				horizontal_position.left = `${card_rect.right + 100}px`
			}
			
			return {
				pointerEvents: 'none',
				position: 'fixed',
				width: '500px',
				aspectRatio: 745 / 1040,
				border: '2px solid black',
				borderRadius: '24px',
				zIndex: 9999,
				...horizontal_position,
				top: `${card_middle_y}px`,
				transform: 'translateY(-50%)',
				boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
				overflow: 'hidden'
			}
		}
	}




	const on_key_press = (event) => {
		/* move target card to graveyard */
		if (event.key === 'g') {
			event.stopPropagation()
			const { game_state: game_state_post_removal, removed_card_obj } = State.Card.remove(State.game_state, uuid)
			const game_state_post_insertion = State.Graveyard.insert(game_state_post_removal, removed_card_obj, 0)

			set_and_sync_state(game_state_post_insertion)
		} 

		/* move target card to hand */
		else if (event.key === 'd' || event.key === 'h') {
			event.stopPropagation()

			const { game_state: game_state_post_removal, removed_card_obj } = State.Card.remove(State.game_state, uuid)
			const game_state_post_insertion = State.Hand.insert(game_state_post_removal, removed_card_obj, -1)
			set_and_sync_state(game_state_post_insertion)
		}

		/* move target card to exile */
		else if (event.key === 'e') {
			event.stopPropagation()

			const { game_state: game_state_post_removal, removed_card_obj } = State.Card.remove(State.game_state, uuid)
			const game_state_post_insertion = State.Exile.insert(game_state_post_removal, removed_card_obj, 0)
			set_and_sync_state(game_state_post_insertion)
		} 

		/* move card to top of library */
		else if (event.key === 't') {
			/* deliberately allow propagation to App.jsx for scry counter modification */
			// event.stopPropagation()

			const { game_state: game_state_post_removal, removed_card_obj } = State.Card.remove(State.game_state, uuid)
			const game_state_post_insertion = State.Library.insert(game_state_post_removal, removed_card_obj, 0)

			set_and_sync_state(game_state_post_insertion)
		} 

		/* move card to bottom of library */
		else if (event.key === 'b') {
			/* deliberately allow propagation to App.jsx for scry counter modification */
			// event.stopPropagation()

			const { game_state: game_state_post_removal, removed_card_obj } = State.Card.remove(State.game_state, uuid)
			const game_state_post_insertion = State.Library.push(State.game_state, removed_card_obj)

			set_and_sync_state(game_state_post_insertion)
		}
	}



	const container_attr = {
		ref: card_ref,
		style: container_style,
		tabIndex: 0,

		/* on click: target if there are other targets set, otherwise tap ?*/
		onClick: (event) => {
			console.log('card click event')
			/* l-click while targetting: toggle target outline */
			if (State.Player.is_targetting()) {
				event.stopPropagation()
				const game_state_post_targetting = State.Card.toggle_target(State.game_state, uuid)
				set_and_sync_state(game_state_post_targetting)
				return
			}
			/* ctrl + l-click: tap a singular card */
			if (event.ctrlKey) {
				event.stopPropagation()
				const game_state_post_tap = State.Card.toggle_tapped(State.game_state, uuid)
				set_and_sync_state(game_state_post_tap)
				return
			}
		},

		/* on right click: target */
		onContextMenu: (event) => {
			event.preventDefault()
			event.stopPropagation()

			const game_state_post_targetting = State.Card.target_source(State.game_state, uuid)
			set_and_sync_state(game_state_post_targetting)
		},


		onMouseEnter: (event) => {
			card_ref.current.focus()
			set_is_hovered(prev => true)

			if (disable_preview) {
				return
			}

			/* get whether the card is left or right of the viewport */
			const card_mid_point = card_ref.current.getBoundingClientRect().left + card_ref.current.getBoundingClientRect().width / 2
			const is_left = card_mid_point < window.innerWidth / 2 + 50
			set_preview_position(is_left ? 'right' : 'left')

			/* schedule preview in 20 ms */
			timeout_ref.current = setTimeout(() => {
				set_show_preview(true)
			}, 20)
		},

		onMouseLeave: (event) => {
			card_ref.current.blur()
			set_is_hovered(prev => false)

			if (disable_preview) {
				return
			}

			/* clear scheduled preview if it exists */
			if (timeout_ref.current) {
				clearTimeout(timeout_ref.current)
				timeout_ref.current = null
			}

			/* clear hover preview */
			set_show_preview(false)
		},

		onDragStart: (event) => {
			card_ref.current.blur()
			set_is_hovered(prev => false)

			/* clear scheduled preview if it exists */
			if (timeout_ref.current) {
				clearTimeout(timeout_ref.current)
				timeout_ref.current = null
			}

			/* clear hover preview */
			set_show_preview(false)
		},


		onKeyDown: (event) => {
			on_key_press(event)
		}
	}

  return (
		<div>

			<div {...container_attr}> 
				<img 
					src={art_url} 
					alt="Card.jsx failed to load img element" 
					style={img_style}
				/>
				
				<div style={{ position: 'absolute', top: '5.5%', left: '8.5%', color: 'rgba(0, 0, 0, 0)' }}>
					{name}
				</div>
			</div>

			{show_preview && createPortal(
				<div style={preview_style()}>
					<img
						src={card_art} 
						alt="Card.jsx preview failed to load" 
						style={img_style}
					/>
				</div>, 
				document.body
			)}

		</div>
  )
}

