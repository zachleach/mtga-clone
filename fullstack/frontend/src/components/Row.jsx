/* components/Row.jsx */
import { Stack, Client, Server } from '.'
import { useContext } from 'react'

export const Row = ({ row_state }) => {
	const uuid = row_state.uuid

	const { notify_server } = useContext(Server)
	const { register_ref, get_ref } = useContext(Client)

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
			const source = event.dataTransfer.getData('source')
			console.log(`Row onDrop: ${source} -> ${uuid}`)
			console.log(`Row ref:`, get_ref(uuid))
		},
		onDragEnter: (event) => {
			console.log(`Row onDragEnter: ${uuid}`)
		},
		onDragLeave: (event) => {
			console.log(`Row onDragLeave: ${uuid}`)
		}
	}



  return (
    <div ref={(ele) => register_ref(uuid, ele)} style={container_style} {...html5_dnd_attr}>
			{row_state['stacks'].map((stack, idx) => (
				<Stack key={idx} stack_state={stack} is_hand={row_state.is_hand} />
			))}
    </div>
  )
}

