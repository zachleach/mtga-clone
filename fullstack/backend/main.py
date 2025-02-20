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
game_state = { "version": 0 }

# enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def broadcast_state_update():
    for connection in active_connections.values():
        await connection.send_json({
            "type": "state_update",
            "game_state": game_state
        })


async def attempt_state_update(state):
    current_version = game_state["version"]
    if (current_version != state["version"]):
        return False
    game_state.clear()
    game_state.update(state)
    game_state["version"] = current_version + 1
    return True


async def add_player(username, initial_data):
    current_version = game_state["version"]
    game_state[username] = initial_data
    game_state["version"] = current_version + 1


async def remove_player(username):
    current_version = game_state["version"]
    del active_connections[username]
    del game_state[username]
    game_state["version"] = current_version + 1


@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await websocket.accept()
    active_connections[username] = websocket

    try:
        request = await websocket.receive_json()
        if (request['type'] == 'connection'):
            await add_player(username, request['initial_data'])
            await broadcast_state_update()

        while True:
            data = await websocket.receive_json()
            if 'type' not in data: 
                continue

            match data['type']:
                case 'state_update':
                    success = await attempt_state_update(data['data'])
                    await broadcast_state_update()

                case _:
                    print(data)

    except WebSocketDisconnect:
        await remove_player(username)
        await broadcast_state_update()



if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

'''
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

'''
