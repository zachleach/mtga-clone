
const card_width = 220
const gap = 10


export const CardGridOverlay = ({ card_arr, type }) => {

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

	const card_container_style = {
		width: `${card_width}px`,
		aspectRatio: '0.714',
		backgroundColor: 'black',
		borderRadius: '12px',
		overflow: 'hidden',
	}

	const card_img_style = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	}

	console.log(card_arr)

	return (
		<div style={overlay_style}>

			<div style={grid_style}>
				{card_arr.map((card, idx) => (
					<div key={idx} style={card_container_style}>
						<img style={card_img_style}
							src={card.card}
							alt={idx}
						/>
					</div>
				))}
			</div>


		</div>
	)
	
}
