/* components/OpponentBoard.jsx */
import { Row } from './Row'

export const OpponentBoard = ({ player_name }) => {
  return (
    <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'column', border: '1pt solid red' }}>

      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 40%', flexDirection: 'row' }}>
				<Row state={"Lands"} />
				<Row state={"Artifacts / Enchantments"} /> 
      </div>

      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 60%' }}>
				<Row state={player_name} />
      </div>

    </div>
  )
}

