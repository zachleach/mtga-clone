import { useState, useEffect, useContext } from 'react'
import { Card, Server } from '.'

const card_width = 250
const gap = 10

export const CardGridOverlay = ({ card_arr }) => {
	const [hovered_index, set_hovered_index] = useState(null)

	const { State } = useContext(Server)

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
		outline: is_hovered ? '1px solid blue' : 'none' 
	})

	const card_container_attr = (index) => ({
		style: card_container_style(index === hovered_index),
		onMouseEnter: () => {
			set_hovered_index(index) 
		},
		onMouseLeave: () => {
			set_hovered_index(null)
		},
		onClick: (event) => {
			event.stopPropagation()
			const card_obj = State.Card.remove(card_arr[index].uuid)
			State.Hand.insert(card_obj, -1)
		},
	})



	return (
		<div style={overlay_style}>

			<div style={grid_style}>
				{card_arr.map((card, index) => (

					<div key={index} {...card_container_attr(index)}>
						<Card 
							uuid={card.uuid}
							art_url={card.card} 
						/>
					</div>

				))}
			</div>

		</div>
	)
	
}


