import './App.css'
import { PlayerBoard, OpponentBoard } from './components'
import React, { useState, useEffect } from 'react';

const App = () => {
  /* State management */
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [ws, setWs] = useState(null);

  /* Handle WebSocket connection */
  const connectWebSocket = (username) => {
    const websocket = new WebSocket(`ws://localhost:8000/ws/${username}`);
    
    websocket.onopen = () => {
      setIsConnected(true);
      setWs(websocket);
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'users_list') {
        setConnectedUsers(data.users);
      } else if (data.type === 'card_art') {
        setCardArt(data);
      }
    };
    
    websocket.onclose = () => {
      setIsConnected(false);
      setWs(null);
      setCardArt(null);
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

  /* Handle form submission */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      connectWebSocket(username);
    }
  };

  /* Handle requesting card art */
  const handleRequestCardArt = () => {
    if (ws) {
      ws.send(JSON.stringify({ type: 'request_card_art' }));
    }
  };

  /* Render loading screen */
  if (!isConnected) {
    return (
      <div>
        <h1>Welcome</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
          />
          <button type="submit">Join</button>
        </form>
      </div>
    );
  }



	const game_state = { 
		jordan: {
			uuid: 'jordan',
			hand_row_state: { 
				uuid: '',
				is_hand: true,
				stack_state: [
					{ 
						uuid: 'zach-hand-1', 
						card_arr: [  
							{
								card: 'https://cards.scryfall.io/large/front/3/d/3d7d07bb-b875-4a6d-8b87-4187e823af75.jpg?1717014307',
								crop: 'https://cards.scryfall.io/art_crop/front/3/d/3d7d07bb-b875-4a6d-8b87-4187e823af75.jpg?1717014307'
							},
						] 
					}, 
					{ 
						uuid: 'zach-hand-2', 
						card_arr:  [
							{
								card: "https://cards.scryfall.io/large/front/8/5/85ae1a74-cbff-4d36-bfee-d1b6494114b4.jpg?1717014333",
								crop: "https://cards.scryfall.io/art_crop/front/8/5/85ae1a74-cbff-4d36-bfee-d1b6494114b4.jpg?1717014333"
							}
						]
					}, 
				],
			},
			top_row_state: { 
				uuid: '',
				is_hand: 'false',
				stack_state: [
					{ 
						uuid: 'zach-hand-1', 
						card_arr: [  
							{
								card: 'https://cards.scryfall.io/large/front/3/d/3d7d07bb-b875-4a6d-8b87-4187e823af75.jpg?1717014307',
								crop: 'https://cards.scryfall.io/art_crop/front/3/d/3d7d07bb-b875-4a6d-8b87-4187e823af75.jpg?1717014307'
							},
						] 
					}, 
					{ 
						uuid: 'zach-hand-2', 
						card_arr:  [
							{
								card: "https://cards.scryfall.io/large/front/8/5/85ae1a74-cbff-4d36-bfee-d1b6494114b4.jpg?1717014333",
								crop: "https://cards.scryfall.io/art_crop/front/8/5/85ae1a74-cbff-4d36-bfee-d1b6494114b4.jpg?1717014333"
							}
						]
					}, 
				],
			},
			left_row_state: {
				uuid: '',
				is_hand: false,
				stack_state: []
			},
			right_row_state: {
				uuid: '',
				is_hand: false,
				stack_state: []
			}
		}
	}


	const opponents = connectedUsers.filter(user => user !== username)

  /* Render game screen */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

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
