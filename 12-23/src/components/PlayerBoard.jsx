/* components/PlayerBoard.jsx */
import { Row } from '.'

const PlayerBoard = () => {

	/* create a test hand i can pass to the Hand Row component to experiment with the drag and drop functionality */
	const test_hand = [
    {
      tile_art: '/assets/crop1.png',
      card_art: '/assets/card1.png'
    },
    {
      tile_art: '/assets/crop2.png',
      card_art: '/assets/card2.png'
    },
    {
      tile_art: '/assets/crop3.png',
      card_art: '/assets/card3.png'
    }
  ]

  return (
    <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'column', border: '1pt solid red' }}>

      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 50%' }}>
        <Row />
      </div>

      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'row' }}>
        <Row />
        <Row />
      </div>

      {/* Hand */}
      <div style={{ display: 'flex', flex: '0 0 20%', flexDirection: 'column', border: '1pt solid yellow' }}>
				<Row init_data={test_hand}/>
      </div>

    </div>
  )
}

export default PlayerBoard
