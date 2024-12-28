from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, Set
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections and their usernames
active_connections: Dict[str, WebSocket] = {}

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    # Accept the connection
    await websocket.accept()
    
    # Store the connection
    active_connections[username] = websocket
    
    try:
        # Send the current list of users to the new connection
        await websocket.send_json({
            "type": "users_list",
            "users": list(active_connections.keys())
        })
        
        # Broadcast to all users that someone new joined
        for connection in active_connections.values():
            await connection.send_json({
                "type": "users_list",
                "users": list(active_connections.keys())
            })
            
        # Keep the connection alive and handle any incoming messages
        while True:
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        # Remove the connection when user disconnects
        del active_connections[username]
        
        # Broadcast the updated user list to remaining users
        for connection in active_connections.values():
            await connection.send_json({
                "type": "users_list",
                "users": list(active_connections.keys())
            })

# Optional: Add a health check endpoint
@app.get("/")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
