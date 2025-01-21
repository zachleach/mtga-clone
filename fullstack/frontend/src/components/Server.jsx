import { useState, useEffect, createContext } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const Server = createContext(null)

export const ServerProvider = ({ children }) => {
	/* server state */
  const [ws, set_ws] = useState(null);
  const [is_connected, set_is_connected] = useState(false);
  const [connected_users, set_connected_users] = useState([]);
  const [username, set_username] = useState('');

	/* game state */
	const [game_state, set_game_state] = useState({})
	const [drag_card, set_drag_card] = useState(null)
	const [copy_card, set_copy_card] = useState(null)

	/* helper functions for modifying game state using uuids */
	const State = {
		dragged_card: drag_card,
		set_dragged_card: (card_obj) => {
			set_drag_card(card_obj)
		},
		copied_card: copy_card,
		set_copied_card: (card_obj) => {
			set_copy_card(card_obj)
		},

		Stack: {
			/* insert a card at index */
			insert: (stack_id, card, index) => {
				if (index === undefined) return
				const new_game_state = { ...game_state }
				for (const player_name of Object.keys(new_game_state)) {
					for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
						const stack = new_game_state[player_name][row_name].stacks.find(s => s.uuid === stack_id)
						if (stack) {
							stack.card_arr.splice(index, 0, card)
							set_game_state(new_game_state)
							return
						}
					}
				}
			},

			/* remove a card from a stack */
			remove: (stack_id, card) => {
				const new_game_state = { ...game_state }
				for (const player_name of Object.keys(new_game_state)) {
					for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
						/* find the stack's index in the row's stacks array */
						const stack_index = new_game_state[player_name][row_name].stacks.findIndex(s => s.uuid === stack_id)
						if (stack_index !== -1) {
							const stack = new_game_state[player_name][row_name].stacks[stack_index]
							
							/* find and remove the card from the stack's card array */
							const card_index = stack.card_arr.findIndex(c => c.uuid === card.uuid)
							if (card_index !== -1) {
								const removed_card = stack.card_arr.splice(card_index, 1)[0]
								
								/* if stack is now empty, remove it from the row's stacks array */
								if (stack.card_arr.length === 0) {
									new_game_state[player_name][row_name].stacks.splice(stack_index, 1)
								}
								
								set_game_state(new_game_state)
								return removed_card
							}
						}
					}
				}
				return null
			},

			/* create a new stack object containing a card */
			create: (card_obj) => {

			},
		},
		Row: {
			/* add a card to a row at index */
			insert: (row_id, card_id, index) => {

			},

		},
		Card: {

			/* identifies the stack_id of a card, and then calls Stack.remove(stack_id, card) */
			remove: (card) => {
				const new_game_state = { ...game_state }
				for (const player_name of Object.keys(new_game_state)) {
					for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
						const stack = new_game_state[player_name][row_name].stacks.find(s => 
							s.card_arr.some(c => c.uuid === card.uuid)
						)
						if (stack) {
							State.Stack.remove(stack.uuid, card)
							return
						}
					}
				}
			},

			/* creates a copy of a card but with a new uuid_4 */
			copy: (card) => {
				const card_copy = {
					...card,
					uuid: uuidv4()
				}

				return card_copy
			},



		}
	}




  const ws_connect = (username, decklist) => {
    const websocket = new WebSocket(`ws://localhost:8000/ws/${username}`)
    
		/**
		 * ON OPEN
		 *
		 * set is_connected state to true
		 * store the websocket in ws
		 * send server the inputted decklist 
		 *
		 */
    websocket.onopen = () => {
      set_is_connected(true)
      set_ws(websocket)
			set_username(username)

			/* SEND: DECKLIST */
			websocket.send(JSON.stringify({
				type: "decklist",
				payload: decklist
			}))
    };

		/** 
		 * ON CLOSE
		 *
		 * update connection and websocket state 
		 *
		 */
    websocket.onclose = () => {
      set_is_connected(false)
      set_ws(null)
    }

		/**
		 * ON MESSAGE
		 *
		 * parse and handle server responses 
		 *
		 */
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)

			/* RECEIVE: GAME_STATE */
      if (data.type === 'game_state') {
        set_connected_users(Object.keys(data.game_state))
				set_game_state(data.game_state)
			}
    }
    
    
    return websocket;
  }

  /** 
	 * SOCKET CLEAN UP 
	 * 
	 * still not convinced this is even necessary
	 *
	 */
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);


	const notify_server = (json_object) => {
		console.log(json_object)
		ws.send(JSON.stringify(json_object))
	}


	const value = {
		ws_connect,
		is_connected,
		game_state,
		connected_users,
		notify_server,
		State
	}

	return (
		<Server.Provider value={value}>
			{children}
		</Server.Provider>
	)
}

