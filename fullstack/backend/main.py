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



'''
    get an array of frontend card objects from an mtga decklist

'''
def get_cards(decklist):
    deck_json = scryfall_utils.fetch_deck_data(decklist)
    card_jsons = deck_json['cards']

    cards = []
    for card in card_jsons:
        cards += [generate_card(card)]

    return cards


'''
    get a frontend card object from a scryfall card json object

'''
def generate_card(scryfall_card_json: dict) -> dict:
    return {
        'card': scryfall_card_json['image_uris']['large'],
        'crop': scryfall_card_json['image_uris']['art_crop']
    }


'''
    create a frontend card stack object that can be stored in a row's `stacks` array

'''
def create_stack(cards, mtga_list=None):
    stack = { 
        'uuid': '',
        'card_arr': cards
    }

    if (mtga_list is None):
        return stack

    stack['card_arr'] = get_cards(mtga_list)
    return stack


'''
    hardcode deck state for initial testing purposes

'''
def generate_initial_state(mtga_list=None) -> dict:
    decklist = '''
        1 Abrade (LCI) 131
        1 Ancestral Vision (TSR) 52
        1 Blackblade Reforged (DMC) 178
        1 Cathartic Reunion (2XM) 121
        1 Doom Blade (IMA) 87
        1 Feed the Swarm (OTC) 134
        1 Fleetfeather Sandals (THS) 216
        1 Glamdring (LTR) 239
        1 Go for the Throat (MOC) 250
        1 Illusionist's Bracers (RVR) 260
        1 Inevitable Betrayal (MH2) 47
        1 Lightning Greaves (OTC) 260
        1 Adarkar Wastes (M3C) 316 
        1 Arcane Sanctum (BRC) 173 
        1 Arid Mesa (MH2) 244 
        1 Badlands (VMA) 291 
        1 Battlefield Forge (M3C) 321 
        1 Bayou (VMA) 293 
        1 Blackcleave Cliffs (OTC) 272 
        1 Blood Crypt (RVR) 292 
        1 Bloodstained Mire (MH3) 216 
        1 Blooming Marsh (OTJ) 266 
        1 Botanical Sanctum (OTJ) 267 
        1 Breeding Pool (RNA) 246 
        1 Brushland (M3C) 324 
        1 Cascade Bluffs (2XM) 313 
        1 Cascading Cataracts (DMC) 202 
        1 Caves of Koilos (C20) 262 
        1 City of Brass (MD1) 15 
        1 Command Tower (ELD) 333
        1 Commercial District (MKM) 259 
        1 Concealed Courtyard (KLD) 245 
        1 Copperline Gorge (ONE) 249 
    '''

    deck = get_cards(decklist)

    return {
        'uuid': '',
        'deck': deck,
        'library': deck,
        'graveyard': [],
        'exile': [],
        'scry': [],
        'hand_row': {
            'uuid': '',
            'is_hand': True,
            'stacks': []
        },
        'top_row': {
            'uuid': '',
            'is_hand': False,
            'stacks': []
        },
        'left_row': {
            'uuid': '',
            'is_hand': False,
            'stacks': []
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
