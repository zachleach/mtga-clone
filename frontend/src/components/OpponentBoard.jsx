/* components/OpponentBoard.jsx */
import { Row } from '.'

export const OpponentBoard = ({ uuid, board_state }) => {

  return (
    <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'column' }}>


      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 40%', flexDirection: 'row' }}>
        <Row row_state={board_state.right_row} />



				<div style={{ 
          height: '99%',  
          aspectRatio: '1 / 1',  
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <img
            src='/assets/guts_pfp.jpg'
            style={{ 
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '2px solid black'
            }}
          />
        </div>


        <Row row_state={board_state.left_row} />
      </div>

      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 60%' }}>
        <Row row_state={board_state.top_row} />
      </div>

    </div>
  )
}
