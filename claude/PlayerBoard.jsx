/* components/PlayerBoard.jsx */
import { Row } from './Row'

export const PlayerBoard = ({ board_state }) => {

	const uuid = board_state.uuid

  return (
    <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'column', border: '1pt solid red' }}>
      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 50%' }}>
        <Row row_state={board_state.top_row} />
      </div>

      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 25%', flexDirection: 'row' }}>
        <Row row_state={board_state.left_row} />
        <Row row_state={board_state.right_row} />
      </div>

      {/* Hand */}
      <div style={{ display: 'flex', flex: '0 0 25%', flexDirection: 'column', border: '1pt solid yellow' }}>
        <Row row_state={board_state.hand_row} />
      </div>
    </div>
  )
}

