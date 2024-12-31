import pprint
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict
import json
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from bulk_query import ScryfallDeckUtils




game_state = {}
active_connections: Dict[str, WebSocket] = {}

async def broadcast_json(payload: Dict):
    for connection in active_connections.values():
        await connection.send_json(payload)

app = FastAPI()

# enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_initial_state(username: str) -> dict:
    return {
        'uuid': username,
        'hand_row_state': {
            'uuid': '',
            'is_hand': True,
            'stack_state': []
        },
        'top_row_state': {
            'uuid': '',
            'is_hand': False,
            'stack_state': []
        },
        'left_row_state': {
            'uuid': '',
            'is_hand': False,
            'stack_state': []
        },
        'right_row_state': {
            'uuid': '',
            'is_hand': False,
            'stack_state': []
        }
    }

'''
TODO:
    insert_stack(username, row_uuid, card, index)
    insert_card(username, stack_uuid, card, index)
    etc

'''




def generate_card(scryfall_card_json: dict) -> dict:
    return {
        'card': scryfall_card_json['image_uris']['large'],
        'crop': scryfall_card_json['image_uris']['art_crop']
    }


scryfall_utils = ScryfallDeckUtils()

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await websocket.accept()
    active_connections[username] = websocket

    game_state[username] = generate_initial_state(username)
    
    try:
        request = await websocket.receive_json()
        if (request['type'] == 'decklist'):
            decklist = request['payload'] 

            deck_json = scryfall_utils.fetch_deck_data(decklist)
            cards = deck_json['cards']

            for card in cards:
                card_obj = generate_card(card)
                game_state[username]['hand_row_state']['stack_state'] += [{
                    'uuid': '',
                    'card_arr': [card_obj]
                }]
                game_state[username]['top_row_state']['stack_state'] += [{
                    'uuid': '',
                    'card_arr': [card_obj]
                }]







        await broadcast_json({
            "type": "game_state",
            "game_state": game_state
        })

        while True:
            data = await websocket.receive_json()
            
    except WebSocketDisconnect:
        del active_connections[username]
        del game_state[username]
        await broadcast_json({
            "type": "game_state",
            "game_state": game_state
        })

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
