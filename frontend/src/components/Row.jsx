/* components/Row.jsx */
import { Stack, Server } from '.'
import { useContext, useRef } from 'react'

export const Row = ({ row_state }) => {
	const uuid = row_state.uuid

	const { State, set_and_sync_state } = useContext(Server)
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
			const source_card_uuid = event.dataTransfer.getData('source_card_uuid')

			/* if a card is tapped and you move it to the hand, moving it to the board will cause it to enter tapped; therefore, unset tapped state when moving a card to hand */ 
			let game_state = State.game_state
			if (row_state.is_hand) {
				game_state = State.Card.set_tapped(State.game_state, source_card_uuid, false)
			}

			const { game_state: game_state_post_removal, removed_card_obj } = State.Card.remove(game_state, source_card_uuid)
			const row_bb = row_ref.current.getBoundingClientRect()
			const drop_x = event.clientX - row_bb.left

			/* drop left if drop_x is less than half the row width */
			if (drop_x < row_bb.width / 2) {
				const game_state_post_insertion = State.Row.insert(game_state_post_removal, uuid, removed_card_obj, 0)
				set_and_sync_state(game_state_post_insertion)
			}
			/* otherwise, drop right */
			else {
				const game_state_post_push = State.Row.insert(game_state_post_removal, uuid, removed_card_obj, -1)
				set_and_sync_state(game_state_post_push)
			}
		},

	}

  return (
    <div ref={row_ref} style={container_style} {...html5_dnd_attr}>
			{row_state['stacks'].map((stack, idx) => (
				<Stack key={idx} stack_state={stack} is_hand={row_state.is_hand} />
			))}
    </div>
  )
}

