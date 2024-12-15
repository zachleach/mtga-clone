import './App.css'





/**
 * not really sure about the inner-style thing, need to look into it later
 */
const Card = ({ content }) => {
	const s = {
		width: '100%',
		height: '0',
		paddingBottom: '140%', 
		position: 'relative',
		border: '1px solid black',
		borderRadius: '12px',
		backgroundColor: 'white',
	}

	const innerStyle = {
		position: 'absolute',
		top: '0',
		left: '0',
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	}

	return (
		<div style={s}>
			<div style={innerStyle}>
				{content}
			</div>
		</div>
	)
}



/**
 * don't know how, but it makes the cards appear centered with the correct aspect ratio 
 */
const Cards = ({ N, w }) => {
	return (
		<div style={{ display: 'flex', height: '100%', width: '100%' }}>
			{Array(N).fill(null).map((_, index) => (
				<div style={{ flex: `0 1 ${100/N}%`, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<Card key={index} w={w} />
				</div>
			))}
		</div>
	)
}




/** 
 * horizontal container
 */
const Container = ({ children, w, h, vertical }) => {
	const s = {
		display: 'flex',
		width: `${w}%`, 
		height: `${h}%`,

		boxSizing: 'border-box',

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

			{/* creature zone */}
			<Container w={100} h={50}>
				<Cards N={10} w={90}/>
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
