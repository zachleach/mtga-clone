import pprint
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict
import json
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from bulk_query import ScryfallDeckUtils


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


game_state = {}
scryfall_utils = ScryfallDeckUtils()



def get_cards(decklist):
    deck_json = scryfall_utils.fetch_deck_data(decklist)
    card_jsons = deck_json['cards']

    cards = []
    for card in card_jsons:
        cards += [generate_card(card)]

    return cards

def generate_card(scryfall_card_json: dict) -> dict:
    return {
        'card': scryfall_card_json['image_uris']['large'],
        'crop': scryfall_card_json['image_uris']['art_crop']
    }


def create_stack(cards, mtga_list=None):
    stack = { 
        'uuid': '',
        'card_arr': cards
    }

    if (mtga_list is None):
        return stack

    stack['card_arr'] = get_cards(mtga_list)
    return stack


def generate_initial_state(mtga_list=None) -> dict:
    hand = '''
        1 Abrade (LCI) 131
        1 Ancestral Vision (TSR) 52
        1 Blackblade Reforged (DMC) 178
        1 Cathartic Reunion (2XM) 121
    '''

    left = '''
        1 Doom Blade (IMA) 87
        1 Feed the Swarm (OTC) 134
        1 Fleetfeather Sandals (THS) 216
        1 Glamdring (LTR) 239
    '''

    top = '''
        1 Go for the Throat (MOC) 250
        1 Illusionist's Bracers (RVR) 260
        1 Inevitable Betrayal (MH2) 47
        1 Lightning Greaves (OTC) 260
    '''

    hand_stacks = []
    for card in get_cards(hand):
        hand_stacks += [create_stack([card])]

    left_stacks = []
    for card in get_cards(left):
        left_stacks += [create_stack([card])]

    top_stacks = []
    for card in get_cards(top):
        top_stacks += [create_stack([card])]



    return {
        'uuid': '',
        'deck': [],
        'graveyard': [],
        'exile': [],
        'scry': [],
        'hand_row': {
            'uuid': '',
            'is_hand': True,
            'stacks': hand_stacks
        },
        'top_row': {
            'uuid': '',
            'is_hand': False,
            'stacks': top_stacks
        },
        'left_row': {
            'uuid': '',
            'is_hand': False,
            'stacks': left_stacks
        },
        'right_row': {
            'uuid': '',
            'is_hand': False,
            'stacks': []
        }
    }








@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await websocket.accept()
    active_connections[username] = websocket

    game_state[username] = generate_initial_state()
    
    try:
        request = await websocket.receive_json()
        if (request['type'] == 'decklist'):
            decklist = request['payload'] 

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
