import './App.css'





/**
 * blank card object for testing purposes
 */
const Card = ({ content, h }) => {
	const s = {
		flex: '0 0 auto',
		height: '80%',
		minWidth: '0px',
		minHeight: '0px',
		aspectRatio: '0.714',


		margin: '0pt 1pt',
		border: '1px solid black',
		borderRadius: '12px',
		backgroundColor: 'white',

		justifyContent: 'center',
		alignItems: 'center',

	}

	return (
		<div style={s}>
			{content}
		</div>
	)
}



const Cards = ({ N, h }) => {


	return (
		<div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
			{Array(N).fill(null).map((_, index) => (
					<Card key={index} />
			))}
		</div>
	)
}



/** 
 * horizontal container
 */
const CardRow = ({ children, w, h }) => {
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

			<CardRow w={100} h={50}>
				<Cards N={1} />
			</CardRow>


			<CardRow w={100} h={25}>

				<CardRow w={50} h={100}>
					<Cards N={5}/>
				</CardRow> 

				<CardRow w={50} h={100}>
					Artifacts / Enchantments
				</CardRow> 

			</CardRow>

			<CardRow w={100} h={25}>
				Hand
			</CardRow>

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
