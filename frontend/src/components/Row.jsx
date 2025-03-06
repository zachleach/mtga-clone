/* components/Row.jsx */
import { Stack, Server } from '.'
import { useContext, useRef } from 'react'

export const Row = ({ row_state }) => {
	const uuid = row_state.uuid

	const { State, push_changes } = useContext(Server)
	const row_ref = useRef(null)

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

			const card = State.Card.remove(source)
			const row_bb = row_ref.current.getBoundingClientRect()
			const drop_x = event.clientX - row_bb.left

			/* drop left if drop_x is less than half the row width */
			if (drop_x < row_bb.width / 2) {
				State.Row.insert(uuid, card, 0)
			}
			/* otherwise, drop right */
			else {
				State.Row.insert(uuid, card, -1)
			}
			push_changes()
		},
		onDragEnter: (event) => {
			console.log(`Row onDragEnter: ${uuid}`)
		},
		onDragLeave: (event) => {
			console.log(`Row onDragLeave: ${uuid}`)
		}
	}

  return (
    <div ref={row_ref} style={container_style} {...html5_dnd_attr}>
			{row_state['stacks'].map((stack, idx) => (
				<Stack key={idx} stack_state={stack} is_hand={row_state.is_hand} />
			))}
    </div>
  )
}

