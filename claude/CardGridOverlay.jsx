import { useState, useEffect, useContext } from 'react'
import { Card, Server } from '.'

const card_width = 250
const gap = 10

export const CardGridOverlay = ({ card_arr }) => {
	const [hovered_index, set_hovered_index] = useState(null)
	const { State, set_and_sync_state } = useContext(Server)

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

		/* add card to hand on click */
		onClick: (event) => {
			event.stopPropagation()

			const { game_state: game_state_post_removal, removed_card_obj } = State.Card.remove(State.game_state, card_arr[index].uuid)
			const game_state_post_insertion = State.Hand.insert(game_state_post_removal, removed_card_obj, -1)
			set_and_sync_state(game_state_post_insertion)
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
							disable_preview={true}
						/>
					</div>

				))}
			</div>

		</div>
	)
	
}


