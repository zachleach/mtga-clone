from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

todos = [
    {'text': 'Example todo', 'username': 'system'},
]

active_connections: Dict[str, WebSocket] = {}

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await websocket.accept()
    active_connections[username] = websocket
    
    try:
        await websocket.send_json({
            'type': 'init',
            'todos': todos,
            'users': list(active_connections.keys())
        })
        
        # Notify others of new user
        for user, conn in active_connections.items():
            if user != username:
                await conn.send_json({
                    'type': 'users',
                    'users': list(active_connections.keys())
                })
        
        while True:
            data = await websocket.receive_json()
            todos.append({'text': data['text'], 'username': username})
            # Broadcast updates
            for conn in active_connections.values():
                await conn.send_json({
                    'type': 'todos',
                    'todos': todos
                })
    except:
        del active_connections[username]
        # Notify others of user disconnect
        for conn in active_connections.values():
            await conn.send_json({
                'type': 'users',
                'users': list(active_connections.keys())
            })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=5000, reload=True)
