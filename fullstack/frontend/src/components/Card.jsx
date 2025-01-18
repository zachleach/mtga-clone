/* components/Image.jsx */

import { useContext } from 'react'
import { Server } from '.'

export const Card = ({ uuid, art_url, aspect_ratio = 745 / 1040, outline, opacity }) => {

	const { notify_server } = useContext(Server)

	const handle_click = () => {
		notify_server({
			type: 'CardClickEvent',
			uuid: uuid
		})
	}

  const container_style = {
    height: '100%',
    aspectRatio: aspect_ratio,
    overflow: 'hidden',
    background: 'black',
    border: '2px solid black',
    borderRadius: '8px',
		outline: `${outline}`
  }

  const img_style = {
    width: '100%',
    height: '100%',
    display: 'block',
  }

  return (
    <div style={container_style} onClick={handle_click}>
      <img 
        src={art_url} 
        alt="Card.jsx failed to load img element" 
        style={img_style}
      />
    </div>
  )
}

