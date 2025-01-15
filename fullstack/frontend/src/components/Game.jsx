import { useState, useEffect, createContext } from 'react'

export const GameContext = createContext(null)

export const GameProvider = ({ children }) => {
  const [ws, set_ws] = useState(null);
  const [is_connected, set_is_connected] = useState(false);
  const [connected_users, set_connected_users] = useState([]);
	const [game_state, set_game_state] = useState({})


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
      set_is_connected(true);
      set_ws(websocket);

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
	}

	return (
		<GameContext.Provider value={value}>
			{children}
		</GameContext.Provider>
	)
}

