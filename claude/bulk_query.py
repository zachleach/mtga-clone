#!/bin/python3

import pprint
import requests
import re
import time
from math import ceil
from typing import List, Dict, Any, Optional

class ScryfallDeckUtils:
    """
    Utility class for handling Scryfall API requests and MTGA decklist parsing.
    """
    
    def __init__(self, request_delay: float = 0.1):
        self.request_delay = request_delay
        self.bulk_url = "https://api.scryfall.com/cards/collection"
        self.batch_size = 75  # Scryfall's maximum batch size
    
    def fetch_cards_bulk(self, card_identifiers: List[Dict[str, str]]) -> Dict[str, List[Dict[str, Any]]]:
        found_cards = []
        not_found_cards = []
        
        num_batches = ceil(len(card_identifiers) / self.batch_size)
        
        for i in range(num_batches):
            start_idx = i * self.batch_size
            end_idx = min((i + 1) * self.batch_size, len(card_identifiers))
            current_batch = card_identifiers[start_idx:end_idx]
            
            payload = {
                "identifiers": current_batch
            }
            
            try:
                response = requests.post(self.bulk_url, json=payload)
                response.raise_for_status()
                
                data = response.json()
                found_cards.extend(data.get('data', []))
                not_found_cards.extend(data.get('not_found', []))
                
                if i < num_batches - 1:
                    time.sleep(self.request_delay)
                    
            except requests.exceptions.RequestException as e:
                print(f"Error in batch {i + 1}/{num_batches}: {str(e)}")
                continue
        
        return {
            'found': found_cards,
            'not_found': not_found_cards
        }
    
    @staticmethod
    def parse_mtga_decklist(decklist_text: str) -> List[Dict[str, str]]:
        pattern = r'^\s*(\d+)\s+([^(\n]+?)(?:\s+\((\w+)\)\s+(\d+))?\s*(?:#[^\n]*)?$'
        identifiers = []
        
        for line in decklist_text.strip().split('\n'):
            if not line.strip() or line.startswith('//'):
                continue
                
            match = re.match(pattern, line)
            if match:
                quantity, card_name, set_code, collector_number = match.groups()
                
                if set_code and collector_number:
                    identifier = {
                        "set": set_code.lower(),
                        "collector_number": collector_number
                    }
                else:
                    identifier = {
                        "name": card_name.strip()
                    }
                
                identifiers.extend([identifier.copy() for _ in range(int(quantity))])
        
        return identifiers
    

    def fetch_deck_data(self, decklist_text: str) -> Dict[str, Any]:
        identifiers = self.parse_mtga_decklist(decklist_text)
        
        if not identifiers:
            return {
                'cards': [],
                'not_found': [],
                'total_cards': 0,
                'error': 'No valid card entries found in decklist'
            }
        
        # Fetch the cards
        results = self.fetch_cards_bulk(identifiers)
        
        # Count occurrences of each card
        card_counts = {}
        for card in results['found']:
            card_id = card['id']
            if card_id not in card_counts:
                card_counts[card_id] = {
                    'quantity': 1,
                    'card_data': card
                }
            else:
                card_counts[card_id]['quantity'] += 1
        
        return {
            'cards': [
                {'quantity': data['quantity'], **data['card_data']}
                for data in card_counts.values()
            ],
            'not_found': results['not_found'],
            'total_cards': len(identifiers)
        }

# Example usage
if __name__ == "__main__":
    # Initialize the utility
    scryfall_utils = ScryfallDeckUtils(request_delay=0.1)
    
    # Example decklist
    example_decklist = """
    4 Lightning Bolt (2X2) 117
    3 Island (NEO) 284
    2 Shock (M21) 159
    // Sideboard
    2 Negate (ZNR) 71
    """
    
    # Parse and fetch deck data
    result = scryfall_utils.fetch_deck_data(example_decklist)
    
    # Display results
    print(f"Total cards: {result['total_cards']}")
    for card in result['cards']:
        print(f"{card['quantity']}x {card['name']}")
    
    pprint.pprint(result['cards'])

    if result['not_found']:
        print("\nNot found:")
        for card in result['not_found']:
            print(f"- {card.get('name', 'Unknown card')}")
