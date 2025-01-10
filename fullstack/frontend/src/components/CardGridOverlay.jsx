

export const CardGridOverlay = () => {
	const overlay_style = {
		backgroundColor: 'rgba(0, 0, 0, 0.8)', 
		color: 'white',
		position: 'absolute',
		inset: 0,
		zIndex: '1000',
	}

	return (
		<div style={overlay_style}>
			Hello World!
		</div>
	)
	
}
