import { useState, useEffect, useCallback } from 'react'
import { Card } from '.'

const card_width = 220
const gap = 10

export const CardGridOverlay = ({ card_arr, type, connection, toggle }) => {
	const [hovered_index, set_hovered_index] = useState(null)
	const [selected_cards, set_selected_cards] = useState([])

	useEffect(() => {
		const handler = (event) => {

			switch (event.key) {
				case 'Escape':

					/* send selected_cards to server */
					if (selected_cards.length > 0) {
						connection.send(JSON.stringify({
							type: `${type}-esc`,
							cards: selected_cards
						}))
					}

					/* toggle off */
					toggle()
					break

				case 't':
				case 'b':
				case 'g':
				case 'e':
				default:
					console.log(`CardGridOverlay: event.key === '${event.key}'`)
			}
		}

		window.addEventListener('keydown', handler) 
		return () => window.removeEventListener('keydown', handler)
	}, [selected_cards, connection])


	const overlay_style = {
		backgroundColor: 'rgba(0, 0, 0, 0.8)', 
		color: 'white',
		position: 'absolute',
		inset: 0,
		zIndex: '1000',
		overflow: 'auto',
	}


	const grid_style = {
		display: 'grid',
		gridTemplateColumns: `repeat(5, ${card_width}px)`,
		gap: `${gap}px`,
		alignItems: 'center',
		justifyContent: 'center',
		padding: '20px',
	}


	const card_img_style = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	}

	const card_Card_attr = (card_obj) => ({
		style: card_img_style,
		src: card_obj.card, 
		alt: "fuck, it's not loading"
	})


	const card_container_style = (is_hovered, is_selected) => ({
		width: `${card_width}px`,
		aspectRatio: '0.714',
		backgroundColor: 'black',
		borderRadius: '12px',
		overflow: 'hidden',
		outline: is_hovered && is_selected ? '4px solid blue' : (is_hovered ? '4px solid white' : (is_selected ? '4px solid red' : 'none')),
	})

	const card_container_attr = (index) => ({
		style: card_container_style(index === hovered_index, selected_cards.includes(index)),

		onMouseEnter: () => {
			set_hovered_index(index) 
		},

		onMouseLeave: () => {
			set_hovered_index(null)
		},

		onClick: (event) => {
			if (type === 'scry') {
				return
			}

			/* if not scrying, add clicked card to selected state */
			set_selected_cards(prev => {
				if (prev.includes(index)) {
					return prev.filter(i => i !== index)
				}
				return [...prev, index]
			})
		},
	})



	return (
		<div style={overlay_style}>

			<div style={grid_style}>
				{card_arr.map((card, index) => (
					<Card key={index} art_url={card.card} />
				))}
			</div>

		</div>
	)
	
}


