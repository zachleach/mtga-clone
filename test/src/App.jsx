import './App.css'

/** 
 * horizontal container
 */
const Container = ({ children, w }) => {
	const s = {
		display: 'flex',
		flex: '1 0 auto',
		width: `${w}vw`,
		height: `${100/6}vh`,

		backgroundColor: 'grey',
		border: '1px solid red',
		alignItems: 'center',
		justifyContent: 'center',
	}

	return (
		<div style={s}>
			{children}
		</div>
	)
}

/**
 * blank card object for testing purposes
 */
const Card = ({ content }) => {
	const s = {
		width: '100px',
		aspectRatio: '0.714',
		border: '1px solid black',
		borderRadius: '12px',
		backgroundColor: 'white',

		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	}

	return (
		<div style={s}>
			{content}
		</div>
	)
}

const App = () => {
	return (
		<div>

			<Container>
				<Container w={50}>
					{Array(1).fill(null).map((_, index) => (
						<Card key={index} />
					))}
				</Container>
				<Container w={50}>
					{Array(8).fill(null).map((_, index) => (
						<Card key={index} />
					))}
				</Container>
			</Container>
		
			<Container>
				{Array(20).fill(null).map((_, index) => (
					<Card key={index} />
				))}
			</Container>

		</div>
	)
}

export default App
