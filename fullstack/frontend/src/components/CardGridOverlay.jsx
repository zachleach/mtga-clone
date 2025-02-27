import { useState, useEffect, useCallback } from 'react'
import { Card } from '.'

const card_width = 250
const gap = 10

export const CardGridOverlay = ({ card_arr, type, connection, toggle }) => {
	const [hovered_index, set_hovered_index] = useState(null)
	const [selected_cards, set_selected_cards] = useState([])

	useEffect(() => {
		const handler = (event) => {
			console.log(`CardGridOverlay.jsx: ${event.key}`)
			switch (event.key) {
				case 'Escape':
					/* toggle off */
					toggle()
					break

				case 'l':
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


	const card_container_style = (is_hovered, is_selected) => ({
		width: `${card_width}px`,
		aspectRatio: 754 / 1040,
		backgroundColor: 'black',
		borderRadius: '16px',
		overflow: 'hidden',
		outline: is_hovered && is_selected ? '2px solid blue' : (is_hovered ? '2px solid white' : (is_selected ? '2px solid red' : 'none')),
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

					<div key={index} {...card_container_attr(index)}>
						<Card 
							art_url={card.card} 
						/>
					</div>

				))}
			</div>

		</div>
	)
	
}


