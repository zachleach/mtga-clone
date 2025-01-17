/* components/Image.jsx */

import { useContext } from 'react'
import { GameContext } from '.'

export const Image = ({ uuid, art_url, aspect_ratio = 745 / 1040, outline }) => {

	const { notify_server } = useContext(GameContext)

	const handle_click = () => {
		notify_server({
			type: 'CardClickEvent',
			uuid: uuid
		})
	}

	const html5_dnd_attr = {
		onDragStart: () => {
			event.dataTransfer.setData('source', uuid)
		},

		onDragOver: () => {
			event.preventDefault()
		},

		onDrop: () => {
			const src_uuid = event.dataTransfer.getData('source')
			notify_server({
				type: 'CardDropEvent',
				src: src_uuid,
				dst: uuid
			})

		},

		onDragEnd: () => {
		}
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
    <div style={container_style} onClick={handle_click} {...html5_dnd_attr}>
      <img 
        src={art_url} 
        alt="Card.jsx failed to load img element" 
        style={img_style}
      />
    </div>
  )
}

