import { useState, useEffect, createContext } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ScryfallUtil } from '.'

export const Server = createContext(null)

export const ServerProvider = ({ children }) => {
	/* server state */
  const [ws, set_ws] = useState(null)
  const [is_connected, set_is_connected] = useState(false)
  const [connected_users, set_connected_users] = useState([])
  const [username, set_username] = useState('')
	const [version, set_version] = useState(0)

	/* game state */
	const [game_state, set_game_state] = useState({})


	/* helper functions for modifying game state using uuids */
	const State = {

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
			remove: (stack_id, card_uuid) => {
				const new_game_state = { ...game_state }
				for (const player_name of Object.keys(new_game_state)) {
					for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
						/* find the stack's index in the row's stacks array */
						const stack_index = new_game_state[player_name][row_name].stacks.findIndex(s => s.uuid === stack_id)
						if (stack_index !== -1) {
							const stack = new_game_state[player_name][row_name].stacks[stack_index]
							
							/* find and remove the card from the stack's card array */
							const card_index = stack.card_arr.findIndex(c => c.uuid === card_uuid)
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
        return {
          uuid: uuidv4(),
          card_arr: [card_obj]
        }
      },

			tap: (stack_id) => {
				const new_game_state = { ...game_state }
				for (const player_name of Object.keys(new_game_state)) {
					for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
						const stack = new_game_state[player_name][row_name].stacks.find(s => s.uuid === stack_id)
						if (stack) {
							stack.is_tapped = !stack.is_tapped
							set_game_state(new_game_state)
							return
						}
					}
				}
			},


		},
		Row: {
			/* add a card to a row at index */
			insert: (row_id, card_obj, index) => {
				const new_game_state = { ...game_state }
        for (const player_name of Object.keys(new_game_state)) {
          for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
            const row = new_game_state[player_name][row_name]
						/* find the row */
            if (row.uuid === row_id) {
							/* create the new stack */
              const new_stack = State.Stack.create(card_obj)
              
              if (index !== -1) {
                row.stacks.splice(index, 0, new_stack)
              } 
							else {
                row.stacks.push(new_stack)
              }
              
              set_game_state(new_game_state)
            }
          }
        }
      },


		},
		Card: {
			find_row: (card_uuid) => {
				for (const player_name of Object.keys(game_state)) {
					for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
						return game_state[player_name][row_name].stacks.find(s => s.card_arr.some(c => c.uuid === card_uuid))
					}
				}
			},

			/* identifies the stack_id of a card, and then calls Stack.remove(stack_id, card) */
			remove: (card_uuid) => {
				for (const player_name of Object.keys(game_state)) {
					for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
						const stack = game_state[player_name][row_name].stacks.find(s => 
							s.card_arr.some(c => c.uuid === card_uuid)
						)
						if (stack) {
							return State.Stack.remove(stack.uuid, card_uuid)
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




  const ws_connect = (username, deck) => {
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
      set_ws(websocket)
			set_username(username)
			set_is_connected(true)

			websocket.send(JSON.stringify({
				type: "connection",
				[username]: {
					uuid: uuidv4(),
					deck: deck,
					library: deck,
					gravey: [],
					exile: [],
					hand_row: {
						uuid: uuidv4(),
						is_hand: true,
						stacks: []
					},
					top_row: {
						uuid: uuidv4(),
						is_hand: false,
						stacks: deck.map(card => State.Stack.create(card))
					},
					left_row: {
						uuid: uuidv4(),
						is_hand: false,
						stacks: []
					},
					right_row: {
						uuid: uuidv4(),
						is_hand: false,
						stacks: []
					}
				}
			}))
		}

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
			console.log(data)

			/* RECEIVE: state_update */
      if (data.type === 'state_update') {
				set_version(data.version)
				set_game_state(data.game_state)
        set_connected_users(Object.keys(data.game_state))
			}
    }
    
    
    return websocket
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
        ws.close()
      }
    };
  }, [ws]);


	/* update game_state and then broadcast the changes */
	const push_changes = () => {
		ws.send(JSON.stringify({
			type: 'state_update',
			game_state: game_state,
			client_version: version
		}))
	}

	const value = {
		ws_connect,
		is_connected,
		game_state,
		connected_users,
		push_changes,
		State
	}

	return (
		<Server.Provider value={value}>
			{children}
		</Server.Provider>
	)






}

