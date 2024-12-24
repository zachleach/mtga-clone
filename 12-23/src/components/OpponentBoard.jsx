/* components/OpponentBoard.jsx */
import { Row } from '.'

const OpponentBoard = () => {
  return (
    <div style={{ display: 'flex', flex: '0 0 33.33%', flexDirection: 'column', border: '1pt solid red' }}>

      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 40%', flexDirection: 'row' }}>
        <Row />
        <Row />
      </div>

      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 60%' }}>
        <Row />
      </div>

    </div>
  )
}

export default OpponentBoard
