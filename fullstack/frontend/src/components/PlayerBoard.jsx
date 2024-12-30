/* components/PlayerBoard.jsx */
import { Row } from './Row'

export const PlayerBoard = ({ player_name }) => {

  return (
    <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'column', border: '1pt solid red' }}>
      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 50%' }}>
				<Row state={player_name} />
      </div>

      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'row' }}>
				<Row state={"Lands"} /> 
				<Row state={"Artifacts / Enchantments"} /> 
      </div>

      {/* Hand */}
      <div style={{ display: 'flex', flex: '0 0 20%', flexDirection: 'column', border: '1pt solid yellow' }}>
				<Row state={"Hand"} />
      </div>
    </div>
  )
}

