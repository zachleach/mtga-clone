/* components/Image.jsx */

import { useContext, useRef, useState } from 'react'
import { Server } from '.'

export const Card = ({ uuid, art_url, aspect_ratio = 745 / 1040, outline, opacity, name }) => {

	const card_ref = useRef(null)
	const [is_hovered, set_is_hovered] = useState(false)
	const { State, push_changes } = useContext(Server)

  const container_style = {
    height: '100%',
    aspectRatio: aspect_ratio,
    overflow: 'hidden',
    background: 'black',
    border: '2px solid black',
    borderRadius: '8px',
		outline: is_hovered ? '1px solid blue' : 'none',
		opacity: `${opacity}`,
		position: 'relative'
  }

  const img_style = {
    width: '100%',
    height: '100%',
    display: 'block',
		objectFit: 'cover',
  }

	const container_attr = {
		ref: card_ref,
		style: container_style,
		tabIndex: 0,
		onMouseEnter: (event) => {
			card_ref.current.focus()
			set_is_hovered(prev => true)
		},
		onMouseLeave: (event) => {
			card_ref.current.blur()
			set_is_hovered(prev => false)
		},
		onKeyDown: (event) => {
			console.log('card event')
			if (event.key === 'g') {
				event.stopPropagation()
				const card_obj = State.Card.remove(uuid)
				State.Graveyard.insert(card_obj, 0)
				push_changes()
			} 
			else if (event.key === 'd') {
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
	}

  return (
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
  )
}

