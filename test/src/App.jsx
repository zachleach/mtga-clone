import './App.css'





/**
 * blank card object for testing purposes
 */
const Card = ({ w, content }) => {
	const s = {
		width: `${w}px`,
		aspectRatio: '0.714',
		border: '1px solid black',
		borderRadius: '12px',
		backgroundColor: 'white',

		display: 'flex',
		flex: '0 1 auto',
		justifyContent: 'center',
		alignItems: 'center',
	}

	return (
		<div style={s}>
			{content}
		</div>
	)
}



const Cards = ({ N, w }) => {
	return (
		<>
			{Array(N).fill(null).map((_, index) => (
				<div>
					<Card key={index} w={w} />
				</div>
			))}
		</>
	)
}









/** 
 * horizontal container
 */
const Container = ({ children, w, h, vertical }) => {
	const s = {
		display: 'flex',
		width: w ? `${w}%` : '100%',
		height: `${h}%`,

		boxSizing: 'border-box',

		flexDirection: vertical ? 'column' : 'row',

		backgroundColor: 'grey',
		border: '1px solid red',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	}

	return (
		<div style={s}>
			{children}
		</div>
	)
}


const Board = () => {

	return (
		<div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>

			<Container w={100} h={50}>
				Creatures
			</Container>


			<Container w={100} h={25}>

				<Container w={50} h={100}>
					Lands
				</Container> 

				<Container w={50} h={100}>
					Artifacts / Enchantments
				</Container> 

			</Container>

			<Container w={100} h={25}>
				Hand
			</Container>

		</div>
	)

}






const App = () => {
	return (
		<div>
			<div style={{ height: '30vh', display: 'flex', transform: 'rotate(180deg)' }}>
					<Board/>
					<Board/>
					<Board/>
			</div>

			<div style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
				<Board/>
			</div>
		</div>
	)
}

export default App
