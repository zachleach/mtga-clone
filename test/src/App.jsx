import './App.css'

/** 
 * horizontal container
 */
const Container = ({ children, w, h }) => {
	const s = {
		display: 'flex',
		flex: '1 0 auto',
		width: `${w}vw`,
		height: h ? `${h}vh` : '100%', // Add conditional height

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








const Board_2 = () => {

	const s = {
		display: 'flex',
		flexDirection: 'column'
	}

	return (
		<div style={s}>

			<Container h={100/6}>
				{Array(1).fill(null).map((_, index) => (
					<div style={{
						transform: 'rotate(90deg)'
					}}>
						<Card key={index} w={80} />
					</div>
				))}
			</Container>

			<Container h={100/3 + 100/6}>
				{Array(3).fill(null).map((_, index) => (
					<Card key={index} w={250} />
				))}
			</Container>



			<Container h={100/6}>
				<Container w={50}>
					{Array(1).fill(null).map((_, index) => (
						<Card key={index} w={80} />
					))}
				</Container>

				<Container w={50}>
					{Array(4).fill(null).map((_, index) => (
						<Card key={index} w={80}/>
					))}
				</Container>
			</Container>


			<Container h={100/6}>
				{Array(7).fill(null).map((_, index) => (
					<Card key={index} w={80}/>
				))}
			</Container>

		</div>
	)

}







const Board_1 = () => {

	const s = {
		display: 'flex',
		flexDirection: 'column'
	}

	return (
		<div style={s}>
			<Container h={100/6}>

				<Container w={100/7}>
					{Array(1).fill(null).map((_, index) => (
						<Card key={index} w={80} />
					))}
				</Container>
				<Container w={100/7}>
					{Array(1).fill(null).map((_, index) => (
						<Card key={index} w={80} />
					))}
				</Container>
				<Container w={100/7}>
					{Array(1).fill(null).map((_, index) => (
						<Card key={index} w={80} />
					))}
				</Container>
				<Container w={100/7}>
					{Array(1).fill(null).map((_, index) => (
						<Card key={index} w={80} />
					))}
				</Container>
				<Container w={100/7}>
					{Array(1).fill(null).map((_, index) => (
						<Card key={index} w={80} />
					))}
				</Container>
				<Container w={100/7}>
					{Array(1).fill(null).map((_, index) => (
						<Card key={index} w={80} />
					))}
				</Container>
				<Container w={100/7}>
					{Array(1).fill(null).map((_, index) => (
						<Card key={index} w={80} />
					))}
				</Container>

			</Container>



			<Container h={100/3 + 100/6}>
				{Array(3).fill(null).map((_, index) => (
					<Card key={index} w={250} />
				))}
			</Container>



			<Container h={100/6}>
				<Container w={50}>
					{Array(1).fill(null).map((_, index) => (
						<Card key={index} w={80} />
					))}
				</Container>

				<Container w={50}>
					{Array(4).fill(null).map((_, index) => (
						<Card key={index} w={80}/>
					))}
				</Container>
			</Container>


			<Container h={100/6}>
				{Array(7).fill(null).map((_, index) => (
					<Card key={index} w={80}/>
				))}
			</Container>

		</div>
	)

}



const App = () => {
	return (
		<div>

			<Board_1 />

		</div>
	)
}

export default App
