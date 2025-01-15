/* components/Row.jsx */
import { Stack } from '.'

export const Row = ({ row_state }) => {
	const uuid = row_state.uuid

  const container_style = {
    height: '100%',
    background: 'white',
    border: '1px solid green',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 50%', 
    overflow: 'hidden'
  }

  return (
    <div style={container_style} >
			{row_state['stacks'].map((stack, idx) => (
				<Stack key={idx} stack_state={stack} is_hand={row_state.is_hand}/>
			))}
    </div>
  )
}

