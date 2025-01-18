/* components/Row.jsx */
import { Stack, GameContext } from '.'
import { useContext } from 'react'

export const Row = ({ row_state }) => {
	const uuid = row_state.uuid

	const { notify_server } = useContext(GameContext)

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

	const html5_dnd_attr = {
		onDragOver: (event) => {
			event.preventDefault()
		},
		onDrop: (event) => {
			event.preventDefault()
			const src_uuid = event.dataTransfer.getData('source')
			console.log(event)
			notify_server({
				type: 'RowDropEvent',
				card: src_uuid,
				row: uuid
			})
		}
	}

  return (
    <div style={container_style} {...html5_dnd_attr}>
			{row_state['stacks'].map((stack, idx) => (
				<Stack key={idx} stack_state={stack} is_hand={row_state.is_hand} />
			))}
    </div>
  )
}

