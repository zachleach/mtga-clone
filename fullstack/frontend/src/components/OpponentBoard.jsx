/* components/OpponentBoard.jsx */
import { Row } from './Row'

export const OpponentBoard = ({ board_state }) => {
  return (
    <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'column', border: '1pt solid red' }}>
      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 40%', flexDirection: 'row' }}>
        <Row row_state={board_state.left_row_state} />
        <Row row_state={board_state.right_row_state} />
      </div>

      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 60%' }}>
        <Row row_state={board_state.top_row_state} />
      </div>
    </div>
  )
}
