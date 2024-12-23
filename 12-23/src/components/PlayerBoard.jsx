import { Row } from '.'

const PlayerBoard = () => {
  return (
    <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'column', border: '1pt solid red', overflow: 'hidden' }}>
      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 50%', minHeight: '50%' }}>
        <Row />
      </div>

      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'row', minHeight: '30%' }}>
        <Row />
        <Row />
      </div>

      {/* Hand */}
      <div style={{ display: 'flex', flex: '0 0 20%', flexDirection: 'column', border: '1pt solid yellow', minHeight: '20%' }}>
        Hand
      </div>
    </div>
  )
}

export default PlayerBoard
