/* components/Card.jsx */

import { useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Server } from '.'

export const Card = ({ uuid, art_url, aspect_ratio = 745 / 1040, outline, opacity, name, card_art, disable_preview, is_hand }) => {

	const card_ref = useRef(null)
	const timeout_ref = useRef(null)

	const [is_hovered, set_is_hovered] = useState(false)
	const [preview_position, set_preview_position] = useState(false)
	const [show_preview, set_show_preview] = useState(false)

	const { State, push_changes } = useContext(Server)

  const container_style = {
    height: '100%',
    aspectRatio: aspect_ratio,
    overflow: 'hidden',
    background: 'black',
    border: is_hovered ? (State.Player.is_targetting() ? '2px solid red' : '2px solid blue') : '2px solid black',
    borderRadius: '12px',
		outline: `${outline}`,
		opacity: `${opacity}`,
		position: 'relative'
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
		if (event.key === 'g') {
			event.stopPropagation()
			const card_obj = State.Card.remove(uuid)
			State.Graveyard.insert(card_obj, 0)
			push_changes()
		} 
		else if (event.key === 'd' || event.key === 'h') {
			event.stopPropagation()
			const card_obj = State.Card.remove(uuid)
			State.Hand.insert(card_obj, -1)
			push_changes()
		}
		else if (event.key === 'e') {
			event.stopPropagation()
			const card_obj = State.Card.remove(uuid)
			State.Exile.insert(card_obj, 0)
			push_changes()
		} 
		/* deliberately allow propagation to App.jsx for scry counter modification */
		else if (event.key === 't') {
			const card_obj = State.Card.remove(uuid)
			State.Library.insert(card_obj, 0)
			push_changes()
		} 
		/* deliberately allow propagation to App.jsx for scry counter modification */
		else if (event.key === 'b') {
			const card_obj = State.Card.remove(uuid)
			State.Library.push(card_obj)
			push_changes()
		}
	}



	const container_attr = {
		ref: card_ref,
		style: container_style,
		tabIndex: 0,

		onClick: (event) => {
			if (State.Player.is_targetting()) {
				State.Card.target(uuid)
				console.log('onClick is_targetting()')
				event.stopPropagation()
			}
		},

		onContextMenu: (event) => {
			event.preventDefault()
			event.stopPropagation()
			State.Card.target_source(uuid)
			console.log('onContextMenu target_source()')
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

