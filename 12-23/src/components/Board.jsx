/* components/Hand.jsx */
import { Row, Hand } from '.'

const Board = ({ opp = false }) => {
  const container_style = {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    minWidth: 0,  
    alignItems: 'center',
    justifyContent: 'flex-start',
  }

  return (
		<div style={{ display: 'flex', flex: '1 1 100%', flexDirection: 'column', width: '100%' }}>
			<Row />
			<div style={{ display: 'flex', flex: '1 1 100%', flexDirection: 'row' }}>
				<Row />
				<Row />
			</div>
		</div>
  )
}


export default Board
