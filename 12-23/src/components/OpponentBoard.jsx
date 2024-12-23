import { Row } from '.'

const OpponentBoard = () => {
  return (
    <div style={{ display: 'flex', flex: '0 0 33.33%', flexDirection: 'column', border: '1pt solid red' }}>
      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 40%', flexDirection: 'row', minHeight: '30%' }}>
        <Row />
        <Row />
      </div>

      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 60%', minHeight: '50%' }}>
        <Row />
      </div>
    </div>
  )
}

export default OpponentBoard
