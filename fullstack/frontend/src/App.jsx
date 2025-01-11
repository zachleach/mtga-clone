import './remove_scrollbars.css'
import { PlayerBoard, OpponentBoard, CardGridOverlay } from './components'
import React, { useState, useEffect } from 'react';

const App = () => {
  /* State management */
  const [username, setUsername] = useState('');
	const [decklist, set_decklist] = useState('')

  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [ws, setWs] = useState(null);
	const [game_state, set_game_state] = useState({})


	const [is_viewing_library, set_is_viewing_library] = useState(false)
	const [is_viewing_graveyard, set_is_viewing_graveyard] = useState(false)
	const [is_viewing_exile, set_is_viewing_exile] = useState(false)
	const [scry_counter, set_scry_counter] = useState(0)



  /* Handle WebSocket connection */
  const connectWebSocket = (username) => {
    const websocket = new WebSocket(`ws://localhost:8000/ws/${username}`);
    
    websocket.onopen = () => {
      setIsConnected(true);
      setWs(websocket);

			websocket.send(JSON.stringify({
				type: "decklist",
				payload: decklist
			}))
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'game_state') {
        setConnectedUsers(Object.keys(data.game_state));
				set_game_state(data.game_state)
			}
    };
    
    websocket.onclose = () => {
      setIsConnected(false);
      setWs(null);
    };

    
    return websocket;
  }

  /* Clean up WebSocket on component unmount */
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);



	/* setup global window hotkeys */
	useEffect(() => {
		const keyboard_listener = (event) => {
			if (!isConnected) return

			switch (event.key) {
				case 'l':
					if (scry_counter > 0) return
					if (is_viewing_exile) return
					if (is_viewing_graveyard) return

					set_is_viewing_library(true)
					break;

				case 's':
					if (is_viewing_library) return
					if (is_viewing_exile) return
					if (is_viewing_graveyard) return

					set_scry_counter(prev => prev + 1)
					break;
				
				case 't':
					if (scry_counter > 0 || is_viewing_library || is_viewing_exile || is_viewing_graveyard) return
					/* fill in when you get to the board state hotkey stuff */
					break;

				case 'b':
					if (scry_counter > 0 || is_viewing_library || is_viewing_exile || is_viewing_graveyard) return
					/* fill in when you get to the board state hotkey stuff */
					break;

				case 'g':
					if (scry_counter > 0 || is_viewing_library || is_viewing_exile || is_viewing_graveyard) return
					/* fill in when you get to the board state hotkey stuff */
					break;


				default:
					console.log(`App.jsx: event.key === ${event.key}`)
			}
		}

		window.addEventListener('keydown', keyboard_listener)
		return () => window.removeEventListener('keydown', keyboard_listener)
	}, [isConnected, is_viewing_library, scry_counter])


  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      connectWebSocket(username);
    }
  };



  /* render loading screen */
  if (!isConnected) {
    return (
      <div>
        <h1>Welcome</h1>
        <form onSubmit={handleSubmit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
          />
          <button type="submit">Join</button>
					<br/>
					<textarea
						value={decklist}
						onChange={(e) => set_decklist(e.target.value)}
						placeholder="Enter MTGA formatted decklist"
					/>
        </form>
      </div>
    );
  }




	const generate_overlay = () => {
		if (is_viewing_library) {
			return <CardGridOverlay card_arr={game_state[username]['library']} type={'library'} connection={ws} toggle={() => set_is_viewing_library(!is_viewing_library)}/>
		}
		if (scry_counter > 0) {
			return <CardGridOverlay card_arr={game_state[username]['library'].slice(0, scry_counter)} type={'scry'} connection={ws} toggle={() => set_scry_counter(0)}/>
		}
	}



	const opponents = connectedUsers.filter(user => user !== username)

  /* Render game screen */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

			{generate_overlay()}

      {/* Opponents Section - 30% height */}
      <div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'column', border: '1pt solid red', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'row', overflow: 'hidden',  }}>
					{opponents.map((name, idx) => (

						<div key={name} style={{ display: 'flex', flex: `0 0 ${100 / opponents.length}%`, flexDirection: 'column', border: '1pt solid red', boxSizing: 'border-box' }}>
							<OpponentBoard board_state={game_state[name]}/>
						</div>

					))}
        </div>
      </div>

      {/* Player's Board - 70% height */}
      <div style={{ display: 'flex', flex: '0 0 70%', overflow: 'hidden' }}>
				{username && game_state[username] && (
					<PlayerBoard board_state={game_state[username]}/>
				)}
      </div>

    </div>
  )
}



export default App
