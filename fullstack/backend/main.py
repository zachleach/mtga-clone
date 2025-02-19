import pprint
import uuid
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict
import json
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from bulk_query import ScryfallDeckUtils

app = FastAPI()
active_connections: Dict[str, WebSocket] = {}
game_state = {}

# enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def broadcast_json(payload: Dict, sending_connection = None):
    for connection in active_connections.values():
        if connection == sending_connection:
            continue
        await connection.send_json(payload)

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await websocket.accept()
    active_connections[username] = websocket

    try:
        request = await websocket.receive_json()

        if (request['type'] == 'connection'):
            player_data = request['initial_data'] 
            game_state[username] = player_data[username]

            await broadcast_json({
                "type": "state_update",
                "game_state": game_state,
                "sender": 'server' + '_username'
            }, username)

        while True:
            data = await websocket.receive_json()
            if 'type' not in data: 
                continue

            match data['type']:
                case 'state_update':
                    game_state.clear()
                    game_state.update(data['data'])
                    await broadcast_json({
                        "type": "state_update",
                        "game_state": game_state,
                        "sender": username
                    }, username)

                case 'StackClickEvent':
                    print('StackClickEvent')
                    stack_uuid = data['uuid']
                    for username in game_state:
                        for row_name in ['hand_row', 'top_row', 'left_row', 'right_row']:
                            row = game_state[username][row_name]
                            for stack in row['stacks']:
                                if stack['uuid'] == stack_uuid:
                                    stack['is_tapped'] = not stack['is_tapped']
                                    break

                case _:
                    print(data)

            '''
            await broadcast_json({
                "type": "game_state",
                "game_state": game_state
            })
            '''
            
            
    except WebSocketDisconnect:
        del active_connections[username]
        del game_state[username]
        await broadcast_json({
            "type": "game_state",
            "game_state": game_state,
            "sender": username
        })

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
