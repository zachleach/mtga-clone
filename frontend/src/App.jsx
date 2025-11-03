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
		set_and_sync_state
	} = useContext(Server) 
	

	/* queries scryfall for the card objects then converts into deck array the application can recognize */
	const query_decklist = async (decklist) => {
		const res = await ScryfallUtil.fetch_deck_data(decklist)
		console.log(res)

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
		
		// Use user's decklist input if provided, otherwise use temp_decklist for quick testing
		let decklist_to_use = decklist.trim()

		if (!decklist_to_use) {
			decklist_to_use = `
				1 Forest (ELD) 266
				1 Island (UND) 89
				1 Mountain (ELD) 262
				1 Plains (UND) 87
				1 Swamp (UND) 91
			`
		}

		const deck = await query_decklist(decklist_to_use)
		ws_connect(username, deck)
  }

	/* top-level 'keydown' window event listener */
	useEffect(() => {
		const handler = (event) => {
			if (!is_connected) return
			console.log(`App.jsx: ${event.key}`)

			switch (event.key) {
				/* l: toggle library overlay */
				case 'l':
					if (scry_counter || is_viewing_exile || is_viewing_graveyard) {
						return
					}
					set_is_viewing_library(prev => !prev)
					break;

				/* x: toggle exile overlay */
				case 'x':
					if (scry_counter || is_viewing_graveyard || is_viewing_library) {
						return
					}
					set_is_viewing_exile(prev => !prev)
					break;

				/* g: toggle graveyard overlay */
				case 'g':
					if (scry_counter || is_viewing_exile || is_viewing_library) {
						return
					}
					set_is_viewing_graveyard(prev => !prev)
					break;

				/* s: toggle scry overlay */
				case 's':
					if (is_viewing_library || is_viewing_exile || is_viewing_graveyard) {
						return
					}
					set_scry_counter(prev => Math.min(scry_counter + 1, game_state[username].library.length))
					break

				/* card `b` event deliberately propagates up */
				case 'b':
					/* if you bottom a card while scrying, you need to decrease the scry counter */
					if (scry_counter > 0) {
						set_scry_counter(prev => prev - 1)
					}
					break
				
				/* d: draw from library */
				case 'd':
					const game_state_post_draw = State.Library.draw(State.game_state)
					if (game_state_post_draw) {
						set_and_sync_state(game_state_post_draw)
					}
					break

				/* esc: toggle-off / clear everything */
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
		/* escape from viewing library will shuffle the deck (but `l` again won't) */
		if (is_viewing_library) {
			const game_state_post_library_shuffle = State.Library.shuffle(State.game_state)
			set_and_sync_state(game_state_post_library_shuffle)
			set_is_viewing_library(prev => false)

			return
		}

		/* if not viewing library: just catch all toggle everything off */
		set_is_viewing_graveyard(prev => false)
		set_is_viewing_exile(prev => false)
		set_scry_counter(prev => 0)

		/* clear any tagets */
		const game_state_post_clear_targets = State.Player.clear_targets(State.game_state)
		set_and_sync_state(game_state_post_clear_targets)
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


	const app_attributes = () => ({
		/* on right click anywhere at the top-level */
		onContextMenu: (event) => {
			event.preventDefault()

			/* clear targets */
			if (State.Player.is_targetting()) {
				const game_state_post_clear_targets = State.Player.clear_targets(State.game_state)
				set_and_sync_state(game_state_post_clear_targets)
			}
		}
	})



  /* Render game screen */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }} {...app_attributes()}>

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
