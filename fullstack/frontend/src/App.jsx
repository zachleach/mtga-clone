import React, { useState, useEffect, useCallback } from 'react';

export default function App() {
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

    /* Handle form submission */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            connectWebSocket(username);
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

    /* Render game screen */
    return (
        <div>
            <h1>Welcome, {username}!</h1>
            <h2>Connected Users:</h2>
            <ul>
                {connectedUsers.map((user) => (
                    <li key={user}>{user}</li>
                ))}
            </ul>
        </div>
    );
}
