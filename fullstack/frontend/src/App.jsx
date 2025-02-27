import './remove_scrollbars.css'
import { PlayerBoard, OpponentBoard, CardGridOverlay, Server, ScryfallUtil } from './components'
import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid'

const App = () => {
  const [username, set_username] = useState('');
	const [decklist, set_decklist] = useState('')

	const [is_viewing_library, set_is_viewing_library] = useState(false)
	const [is_viewing_graveyard, set_is_viewing_graveyard] = useState(false)
	const [is_viewing_exile, set_is_viewing_exile] = useState(false)
	const [scry_counter, set_scry_counter] = useState(0)

	const { 
		ws_connect,
		is_connected,
		game_state,
		connected_users
	} = useContext(Server)


	/* queries scryfall for the card objects then converts into deck array the application can recognize */
	const query_decklist = async (decklist) => {
		const res = await ScryfallUtil.fetch_deck_data(decklist)

		const cards = []
		for (const card_obj of res.cards) {
			for (let i = 0; i < card_obj.quantity; i++) {
				cards.push({
					uuid: uuidv4(),
					card: card_obj.image_uris.large,
					crop: card_obj.image_uris.art_crop
				})
			}
		}

		return cards
	}


  const handle_login_button = async (event) => {
    event.preventDefault()
		if (!username.trim()) {
			return
		}
		
		const temp_decklist = `
			1 Forest (ELD) 266
			1 Island (UND) 89
			1 Mountain (ELD) 262
			1 Plains (UND) 87
			1 Swamp (UND) 91
		`	

		/* replace with state decklist */
		const deck = await query_decklist(temp_decklist)
		ws_connect(username, deck)
  }


  /* render loading screen */
  if (!is_connected) {
    return (
      <div>

        <h1>
					Login Screen
				</h1>

        <form onSubmit={handle_login_button}>

					{/* username */}
          <input
            value={username}
            onChange={(e) => set_username(e.target.value)}
            placeholder="Enter your name"
          />

					<br/>

					{/* decklist */}
					<textarea
						value={decklist}
						onChange={(e) => set_decklist(e.target.value)}
						placeholder="Enter MTGA formatted decklist"
					/>

					<br/>

					{/* button */}
          <button type="submit">
						Join
					</button>

        </form>

      </div>
    );
  }

	const opponents = connected_users.filter(user => user !== username)

  /* Render game screen */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>


      {/* Opponents Section - 30% height */}
      <div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'column', border: '1pt solid red', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'row', overflow: 'hidden',  }}>
					{opponents.map((name, idx) => (
						<div key={name} style={{ display: 'flex', flex: `0 0 ${100 / opponents.length}%`, flexDirection: 'column', border: '1pt solid red', boxSizing: 'border-box' }}>
							<OpponentBoard board_state={game_state[name]}/>
						</div>
					))}
        </div>
      </div>


      {/* Player's Board - 70% height */}
      <div style={{ display: 'flex', flex: '0 0 70%', overflow: 'hidden' }}>
				{username && game_state[username] && (
					<PlayerBoard board_state={game_state[username]}/>
				)}
      </div>


    </div>
  )
}



export default App
