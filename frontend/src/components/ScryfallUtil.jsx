// Configuration constants
const BULK_URL = "https://api.scryfall.com/cards/collection"
const BATCH_SIZE = 75 // Scryfall's maximum batch size
const DEFAULT_REQUEST_DELAY = 100

// Utility to pause execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const ScryfallUtil = {
  // Fetch cards in batches from Scryfall API
  fetch_cards_bulk: async (card_identifiers, request_delay = DEFAULT_REQUEST_DELAY) => {
    const found_cards = []
    const not_found_cards = []
    
    const num_batches = Math.ceil(card_identifiers.length / BATCH_SIZE)
    
    for (let i = 0; i < num_batches; i++) {
      const start_idx = i * BATCH_SIZE
      const end_idx = Math.min((i + 1) * BATCH_SIZE, card_identifiers.length)
      const current_batch = card_identifiers.slice(start_idx, end_idx)
      
      const payload = {
        identifiers: current_batch
      }
      
      try {
        const response = await fetch(BULK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        found_cards.push(...(data.data || []))
        not_found_cards.push(...(data.not_found || []))
        
        if (i < num_batches - 1) {
          await delay(request_delay)
        }
      } catch (e) {
        console.error(`Error in batch ${i + 1}/${num_batches}:`, e)
        continue
      }
    }
    
    return {
      found: found_cards,
      not_found: not_found_cards
    }
  },

  // Parse MTGA decklist text into card identifiers
  parse_mtga_decklist: (decklist_text) => {
    const pattern = /^\s*(\d+)\s+([^(\n]+?)(?:\s+\((\w+)\)\s+(\d+))?\s*(?:#[^\n]*)?$/
    const identifiers = []
    
    const lines = decklist_text.trim().split('\n')
    
    for (const line of lines) {
      if (!line.trim() || line.startsWith('//')) {
        continue
      }
      
      const match = line.match(pattern)
      if (match) {
        const [_, quantity, card_name, set_code, collector_number] = match
        
        let identifier
        if (set_code && collector_number) {
          identifier = {
            set: set_code.toLowerCase(),
            collector_number: collector_number
          }
        } else {
          identifier = {
            name: card_name.trim()
          }
        }
        
        for (let i = 0; i < parseInt(quantity); i++) {
          identifiers.push({ ...identifier })
        }
      }
    }
    
    return identifiers
  },

  // Main function to fetch deck data
  fetch_deck_data: async (decklist_text, request_delay = DEFAULT_REQUEST_DELAY) => {
    const identifiers = ScryfallUtil.parse_mtga_decklist(decklist_text)
    
    if (!identifiers.length) {
      return {
        cards: [],
        not_found: [],
        total_cards: 0,
        error: 'No valid card entries found in decklist'
      }
    }
    
    const results = await ScryfallUtil.fetch_cards_bulk(identifiers, request_delay)
		console.log(results)
    
    // Count occurrences of each card
    const card_counts = {}
    for (const card of results.found) {
      const card_id = card.id
      if (!(card_id in card_counts)) {
        card_counts[card_id] = {
          quantity: 1,
          card_data: card
        }
      } else {
        card_counts[card_id].quantity += 1
      }
    }
    
    return {
      cards: Object.values(card_counts).map(data => ({
        quantity: data.quantity,
        ...data.card_data
      })),
      not_found: results.not_found,
      total_cards: identifiers.length
    }
  }
}

// Example usage:
/*
const example_decklist = `
4 Lightning Bolt (2X2) 117
3 Island (NEO) 284
2 Shock (M21) 159
// Sideboard
2 Negate (ZNR) 71
`

ScryfallUtil.fetch_deck_data(example_decklist)
  .then(result => {
    console.log(`Total cards: ${result.total_cards}`)
    result.cards.forEach(card => {
      console.log(`${card.quantity}x ${card.name}`)
    })
    
    if (result.not_found.length) {
      console.log("\nNot found:")
      result.not_found.forEach(card => {
        console.log(`- ${card.name || 'Unknown card'}`)
      })
    }
  })
*/
