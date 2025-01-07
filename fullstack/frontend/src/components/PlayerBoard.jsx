/* components/PlayerBoard.jsx */
import { Row } from './Row'

export const PlayerBoard = ({ board_state }) => {
  return (
    <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'column', border: '1pt solid red' }}>
      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 50%' }}>
        <Row row_state={board_state.top_row_state} />
      </div>

      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 25%', flexDirection: 'row' }}>
        <Row row_state={board_state.left_row_state} />
        <Row row_state={board_state.right_row_state} />
      </div>

      {/* Hand */}
      <div style={{ display: 'flex', flex: '0 0 25%', flexDirection: 'column', border: '1pt solid yellow' }}>
        <Row row_state={board_state.hand_row_state} />
      </div>
    </div>
  )
}

