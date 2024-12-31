/* components/Row.jsx */
import { Stack } from '.'

export const Row = ({ row_state }) => {

  const container_style = {
    height: '100%',
    background: 'white',
    border: '1px solid green',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 0 50%', 
    overflow: 'hidden'
  }

  return (
    <div style={container_style} >
			{row_state['stack_state'].map((stack, idx) => (
				<Stack key={idx} stack_state={stack} is_hand={row_state.is_hand}/>
			))}
    </div>
  )
}

