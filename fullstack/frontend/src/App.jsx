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
		connected_users, 
		State,
		push_changes
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
					crop: card_obj.image_uris.art_crop,
					name: card_obj.name
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



	/* toggle effects */
	useEffect(() => {
		const handler = (event) => {
			if (!is_connected) return
			console.log(`App.jsx: ${event.key}`)

			switch (event.key) {
				/* c: library */
				case 'l':
					if (scry_counter || is_viewing_exile || is_viewing_graveyard) {
						return
					}
					if (is_viewing_library) {
						State.Library.shuffle()
						push_changes()
					}
					set_is_viewing_library(prev => !prev)
					break;

				/* x: exile */
				case 'x':
					if (scry_counter || is_viewing_graveyard || is_viewing_library) {
						return
					}
					set_is_viewing_exile(prev => !prev)
					break;

				/* g: graveyard */
				case 'g':
					if (scry_counter || is_viewing_exile || is_viewing_library) {
						return
					}
					set_is_viewing_graveyard(prev => !prev)
					break;

				/* s: scry */
				case 's':
					if (is_viewing_library || is_viewing_exile || is_viewing_graveyard) {
						return
					}
					set_scry_counter(prev => Math.min(scry_counter + 1, game_state[username].library.length))
					break

				/* if you bottom a card while scrying, you need to decrease the scry counter */
				case 'b':
					if (scry_counter > 0) {
						set_scry_counter(prev => prev - 1)
					}
					break
				
				/* draw from library */
				case 'd':
					State.Library.draw()
					push_changes()


				case 'Escape':
					esc_handler()
					break

				default:
					break
			}
		}

		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	})



	const esc_handler = () => {
		if (is_viewing_library) {
			State.Library.shuffle()
			push_changes()
		}
		set_is_viewing_library(prev => false)
		set_is_viewing_graveyard(prev => false)
		set_is_viewing_exile(prev => false)
		set_scry_counter(prev => 0)
	}


	const generate_overlay = () => {
		if (is_viewing_library) {
			const cards = game_state[username]['library']
			if (cards.length === 0) {
				set_is_viewing_library(prev => false)
			}
			return <CardGridOverlay card_arr={cards} />
		}
		if (is_viewing_graveyard) {
			const cards = game_state[username]['graveyard']
			if (cards.length === 0) {
				set_is_viewing_graveyard(prev => false)
			}
			return <CardGridOverlay card_arr={cards} />
		}
		if (is_viewing_exile) {
			const cards = game_state[username]['exile']
			if (cards.length === 0) {
				set_is_viewing_exile(prev => false)
			}
			return <CardGridOverlay card_arr={cards} />
		}
		if (scry_counter) {
			const cards = game_state[username].library.slice(0, scry_counter)
			return <CardGridOverlay card_arr={cards} />
		}
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
    )
  }

	const opponents = connected_users.filter(user => user !== username)

  /* Render game screen */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

			{/* library, graveyard, etc */}
			{generate_overlay()}


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
