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



	const set_and_sync_state = (new_game_state) => {
		set_game_state(new_game_state)	
		ws.send(JSON.stringify({
			type: 'state_update',
			game_state: new_game_state,
			client_version: version
		}))
	}


	/* helper functions for modifying game state using uuids */
	const State = {
		game_state: game_state,
		Library: {
			shuffle: (game_state) => {
				const new_game_state = { ...game_state }
				const shuffled = [...new_game_state[username].library]
				for (let i = shuffled.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1))
					const temp = shuffled[i]
					shuffled[i] = shuffled[j]
					shuffled[j] = temp
				}
				new_game_state[username].library = shuffled

				return new_game_state
			},

			/* insert a card into this player's library at the bottom */
			push: (game_state, card_obj) => {
				const new_game_state = { ...game_state }
				new_game_state[username].library.push(card_obj)

				return new_game_state
			},

			/* inserts a card into this player's library */
			insert: (game_state, card_obj, index) => {
				const new_game_state = { ...game_state }
				new_game_state[username].library.splice(index, 0, card_obj)

				return new_game_state
			},

			/* removes card object from library, returning the object removed */
			remove: (game_state, card_uuid) => {
				const new_game_state = { ...game_state }
				const index = new_game_state[username].library.findIndex(c => c.uuid === card_uuid)
				if (index === -1) {
					return null
				}
				const removed_card_obj = new_game_state[username].library.splice(index, 1)[0]
				
				return { game_state: new_game_state, removed_card_obj }
			},

			/* removes card object from top of library and adds to hand */
			draw: (game_state) => {
				if (!game_state[username].library.length) {
					return 
				}
				const new_game_state = { ...game_state }
				const card_obj = new_game_state[username].library.splice(0, 1)[0]
				const new_stack = State.Stack.create(card_obj)
				new_game_state[username]['hand_row'].stacks.push(new_stack)

				return new_game_state
			}

		},

		Graveyard: {
			/* inserts a card into the library */
			insert: (game_state, card_obj, index) => {
				const new_game_state = { ...game_state }
				new_game_state[username].graveyard.splice(index, 0, card_obj)

				return new_game_state
			},

			/* removes card object from graveyard, returning the object removed */
			remove: (game_state, card_uuid) => {
				console.log(card_uuid)
				const new_game_state = { ...game_state }
				const index = new_game_state[username].graveyard.findIndex(c => c.uuid === card_uuid)
				if (index === -1) {
					return null
				}
				const removed_card_obj = new_game_state[username].graveyard.splice(index, 1)[0]

				return { game_state: new_game_state, removed_card_obj }
			}
		},

		Exile: {
			/* inserts a card into the library */
			insert: (game_state, card_obj, index) => {
				const new_game_state = { ...game_state }
				new_game_state[username].exile.splice(index, 0, card_obj)

				return new_game_state
			},
			/* removes card object from exile, returning the object removed */
			remove: (game_state, card_uuid) => {
				const new_game_state = { ...game_state }
				const index = new_game_state[username].exile.findIndex(c => c.uuid === card_uuid)
				if (index === -1) {
					return null
				}
				const removed_card_obj = new_game_state[username].exile.splice(index, 1)[0]

				return { game_state: new_game_state, removed_card_obj }
			}
		},

		Stack: {
			/* insert a card at index */
			insert: (game_state, stack_id, card, index) => {
				if (index === undefined) return
				const new_game_state = { ...game_state }
				for (const player_name of Object.keys(new_game_state)) {
					for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
						const stack = new_game_state[player_name][row_name].stacks.find(s => s.uuid === stack_id)
						if (stack) {
							stack.card_arr.splice(index, 0, card)

							return new_game_state
						}
					}
				}
			},

			/* remove a card from a stack */
			remove: (game_state, stack_id, card_uuid) => {
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
								const removed_card_obj = stack.card_arr.splice(card_index, 1)[0]
								
								/* if stack is now empty, remove it from the row's stacks array */
								if (stack.card_arr.length === 0) {
									new_game_state[player_name][row_name].stacks.splice(stack_index, 1)
								}
								
								return { game_state: new_game_state, removed_card_obj } 
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

			/**
			 * returns game_state with the given stack tapped 
			 *
			 */
			toggle_tapped: (game_state, stack_uuid) => {
				const new_game_state = { ...game_state }
				const { username, row_name } = State.Stack.find(new_game_state, stack_uuid)
				const stack = new_game_state[username][row_name].stacks.find(s => s.uuid === stack_uuid)

				stack.is_tapped = !stack.is_tapped
				console.log('Stack.toggle_tapped: ', stack.is_tapped)
				stack.card_arr.forEach(card => {
					card.is_tapped = stack.is_tapped
				})

				return new_game_state
			},

			/**
			 * returns the username and row_name of a given stack 
			 *
			 */
			find: (game_state, stack_uuid) => {
				for (const player_name of Object.keys(game_state)) {
					for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
						const stack = game_state[player_name][row_name].stacks.find(s => s.uuid === stack_uuid)
						if (stack) {
							return { username: player_name, row_name }
						}
					}
				}

				return null
			},

		},

		Row: {
			/**
			 * add a card to a row at some horizontal index
			 * if index -1 then it pushes 
			 *
			 */
			insert: (game_state, row_id, card_obj, index) => {
				const new_game_state = { ...game_state }
        for (const player_name of Object.keys(new_game_state)) {
          for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
            const row = new_game_state[player_name][row_name]
						/* find the row */
            if (row.uuid === row_id) {
							/* create the new stack */
              const new_stack = State.Stack.create(card_obj)
              
							/* insert at index */
              if (index !== -1) {
                row.stacks.splice(index, 0, new_stack)
              } 
							/* push for index -1 */
							else {
                row.stacks.push(new_stack)
              }
              
							return new_game_state
            }
          }
        }
      },
		},

		Hand: {
			/* add a card to a row at index */
			insert: (game_state, card_obj, index) => {
				const new_game_state = { ...game_state }
				const new_stack = State.Stack.create(card_obj)
				
				/* insert at index */
				if (index !== -1) {
					new_game_state[username]['hand_row'].stacks.splice(index, 0, new_stack)
				} 
				/* push for index -1 */
				else {
					new_game_state[username]['hand_row'].stacks.push(new_stack)
				}
				
				return new_game_state
      },
		},

		Board: {
			/* identifies the stack_id of a card, and then calls Stack.remove(stack_id, card) */
			remove: (game_state, card_uuid) => {
				for (const player_name of Object.keys(game_state)) {
					for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
						const stack = game_state[player_name][row_name].stacks.find(s => s.card_arr.some(c => c.uuid === card_uuid))
						if (stack) {
							return State.Stack.remove(game_state, stack.uuid, card_uuid)
						}
					}
				}
			},
		},

		Card: {


			find: (game_state, card_uuid) => {
				for (const player_name of Object.keys(game_state)) {
					if (game_state[player_name].library.some(card => card.uuid === card_uuid)) {
						const card_index = game_state[player_name].library.findIndex(card => card.uuid === card_uuid)
						return { username: player_name, zone: 'library', card_index }
					}
					
					if (game_state[player_name].graveyard.some(card => card.uuid === card_uuid)) {
						const card_index = game_state[player_name].graveyard.findIndex(card => card.uuid === card_uuid)
						return { username: player_name, zone: 'graveyard', card_index }
					}
					
					if (game_state[player_name].exile.some(card => card.uuid === card_uuid)) {
						const card_index = game_state[player_name].exile.findIndex(card => card.uuid === card_uuid)
						return { username: player_name, zone: 'exile', card_index }
					}
					
					for (const row_name of ['top_row', 'hand_row', 'left_row', 'right_row']) {
						const stacks = game_state[player_name][row_name].stacks
						
						for (let stack_index = 0; stack_index < stacks.length; stack_index++) {
							const stack = stacks[stack_index]
							
							for (let card_index = 0; card_index < stack.card_arr.length; card_index++) {
								if (stack.card_arr[card_index].uuid === card_uuid) {
									return {
										username: player_name,
										row_name,
										stack_index,
										card_index,
										stack_uuid: stack.uuid,
									}
								}
							}
						}
					}
				}
				
				return null 
			},



			/**
			 * returns game state with the card's tapped property toggled
			 *
			 */
			toggle_tapped: (game_state, card_uuid) => {
				const new_game_state = { ...game_state }
				const { username, row_name, stack_index, card_index } = State.Card.find(new_game_state, card_uuid)

				const is_tapped = new_game_state[username][row_name].stacks[stack_index].card_arr[card_index].is_tapped
				new_game_state[username][row_name].stacks[stack_index].card_arr[card_index].is_tapped = !is_tapped

				return new_game_state
			},


			set_tapped: (game_state, card_uuid, tapped_boolean) => {
				const new_game_state = { ...game_state }
				const { username, row_name, stack_index, card_index } = State.Card.find(new_game_state, card_uuid)
				new_game_state[username][row_name].stacks[stack_index].card_arr[card_index].is_tapped = tapped_boolean

				return new_game_state
			},



			/* identifies where a card is located in game_state and pops it from that location */
			remove: (game_state, card_uuid) => {
				if (game_state[username].library.find(c => c.uuid === card_uuid)) {
					return State.Library.remove(game_state, card_uuid)
				}
				else if (game_state[username].graveyard.find(c => c.uuid === card_uuid)) {
					return State.Graveyard.remove(game_state, card_uuid)
				}
				else if (game_state[username].exile.find(c => c.uuid === card_uuid)) {
					return State.Exile.remove(game_state, card_uuid)
				}
				else {
					return State.Board.remove(game_state, card_uuid)
				}
			},

			/**
			 * Toggles a card's target state with no condition checks
			 *
			 */
			toggle_target: (game_state, uuid) => {
				const new_game_state = {...game_state}
				if (State.Card.is_targetted(uuid)) {
					new_game_state[username].targets = new_game_state[username].targets.filter(card_id => card_id !== uuid)
				}
				else {
					new_game_state[username].targets = [...new_game_state[username].targets, uuid]
				}

				return new_game_state
			},

			/**
			 * If the player has any targets: clears them
			 * Otherwise: targets the given card
			 *
			 * Right click action
			 *
			 */
			target_source: (game_state, uuid) => {
				const new_game_state = {...game_state}
				if (new_game_state[username].targets.length > 0) {
					new_game_state[username].targets = []
				}
				else {
					new_game_state[username].targets = [uuid]
				}

				return new_game_state
			},

			is_targetted: (card_uuid) => {
				for (const player_name of Object.keys(game_state)) {
					if (game_state[player_name].targets.includes(card_uuid)) {
						return true
					}
				}
				return false 
			},
		},

		Player: {
			has_target: (username, card_uuid) => {
				return game_state[username].targets.includes(card_uuid)
			},

			is_targetting: () => {
				return game_state[username].targets.length > 0
			},

			clear_targets: (game_state) => {
				const new_game_state = {...game_state}
				new_game_state[username].targets = []

				return new_game_state
			},


		},
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
					targets: [],
					library: [],
					graveyard: [],
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


	const value = {
		ws_connect,
		is_connected,
		game_state,
		connected_users,
		set_and_sync_state,
		State
	}

	return (
		<Server.Provider value={value}>
			{children}
		</Server.Provider>
	)






}

