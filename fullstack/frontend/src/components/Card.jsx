/* components/Image.jsx */

import { useContext, useRef } from 'react'
import { Server } from '.'

export const Card = ({ uuid, art_url, aspect_ratio = 745 / 1040, outline, opacity }) => {

	const card_ref = useRef(null)

  const container_style = {
    height: '100%',
    aspectRatio: aspect_ratio,
    overflow: 'hidden',
    background: 'black',
    border: '2px solid black',
    borderRadius: '8px',
		outline: `${outline}`,
		opacity: `${opacity}`
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
		},
		onMouseLeave: (event) => {
			card_ref.current.blur()
		},
		onKeyDown: (event) => {
			console.log(uuid, event.key)
		}
	}

  return (
    <div {...container_attr}> 
			
      <img 
        src={art_url} 
        alt="Card.jsx failed to load img element" 
        style={img_style}
      />
    </div>
  )
}

