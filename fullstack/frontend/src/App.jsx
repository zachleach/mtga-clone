import './App.css'
import { PlayerBoard, OpponentBoard } from './components'
import React, { useState, useEffect } from 'react';

export default function App() {
  /* State management */
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [ws, setWs] = useState(null);
  const [cardArt, setCardArt] = useState(null);

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



	const opponents = connectedUsers.filter(user => user !== username)


  /* Render game screen */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Opponents Section - 30% height */}
      <div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'column', border: '1pt solid red', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'row', overflow: 'hidden',  }}>
					{opponents.map((name, idx) => (

						<div key={name} style={{ display: 'flex', flex: `0 0 ${100 / opponents.length}%`, flexDirection: 'column', border: '1pt solid red', boxSizing: 'border-box' }}>
							<OpponentBoard player_name={name}/>
						</div>

					))}
        </div>
      </div>

      {/* Player's Board - 70% height */}
      <div style={{ display: 'flex', flex: '0 0 70%', overflow: 'hidden' }}>
				<PlayerBoard player_name={username}/>
      </div>

    </div>
  )
}



