/* components/PlayerBoard.jsx */
import { Row, Hand } from '.'

const PlayerBoard = () => {
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
				<Hand />
      </div>
    </div>
  )
}

export default PlayerBoard
