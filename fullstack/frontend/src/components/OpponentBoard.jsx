/* components/OpponentBoard.jsx */
import { Row } from '.'

export const OpponentBoard = ({ uuid, board_state }) => {
  return (
    <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'column', border: '1pt solid red' }}>

			{/* player icon 
			<div style={{ display: 'flex', flex: '0 0 25%', justifyContent: 'center', overflow: 'hidden' }}>
				<img
					src='/assets/guts_pfp.jpg'
					style={{ maxHeight: '100%', zIndex: '1', aspectRatio: '1', borderRadius: '50%',  border: '2px solid black' }}
				/>
			</div>
			*/}

      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 40%', flexDirection: 'row' }}>
        <Row row_state={board_state.right_row} />
        <Row row_state={board_state.left_row} />
      </div>

      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 60%' }}>
        <Row row_state={board_state.top_row} />
      </div>

    </div>
  )
}
