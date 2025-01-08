/* components/Card.jsx */
export const Card = ({ art_url }) => {
  const ASPECT_RATIO = 745 / 1040

  const card_style = {
    height: '100%',
    aspectRatio: ASPECT_RATIO,
    overflow: 'hidden',
    background: 'black',
    border: '2px solid black',
    borderRadius: '8px',
  }

  const img_style = {
    width: '100%',
    height: '100%',
    display: 'block',
  }

  return (
    <div style={card_style}>
      <img 
        src={art_url} 
        alt="Card" 
        style={img_style}
      />
    </div>
  )
}

/* components/OpponentBoard.jsx */
import { Row } from '.'

export const OpponentBoard = ({ board_state }) => {
  return (
    <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'column', border: '1pt solid red' }}>

			{/* player icon */}
			<div style={{ display: 'flex', flex: '0 0 25%', justifyContent: 'center', overflow: 'hidden' }}>
				<img
					src='/assets/guts_pfp.jpg'
					style={{ maxHeight: '100%', zIndex: '1', aspectRatio: '1', borderRadius: '50%',  border: '2px solid black' }}
				/>
			</div>

      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 25%', flexDirection: 'row' }}>
        <Row row_state={board_state.left_row_state} />
        <Row row_state={board_state.right_row_state} />
      </div>

      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 50%' }}>
        <Row row_state={board_state.top_row_state} />
      </div>

    </div>
  )
}
/* components/PlayerBoard.jsx */
import { Row } from './Row'

export const PlayerBoard = ({ board_state }) => {
  return (
    <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'column', border: '1pt solid red' }}>
      {/* Creatures */}
      <div style={{ display: 'flex', flex: '0 0 50%' }}>
        <Row row_state={board_state.top_row_state} />
      </div>

      {/* Non-Creatures */}
      <div style={{ display: 'flex', flex: '0 0 25%', flexDirection: 'row' }}>
        <Row row_state={board_state.left_row_state} />
        <Row row_state={board_state.right_row_state} />
      </div>

      {/* Hand */}
      <div style={{ display: 'flex', flex: '0 0 25%', flexDirection: 'column', border: '1pt solid yellow' }}>
        <Row row_state={board_state.hand_row_state} />
      </div>
    </div>
  )
}

/* components/Row.jsx */
import { Stack } from '.'

export const Row = ({ row_state }) => {

  const container_style = {
    height: '100%',
    background: 'white',
    border: '1px solid green',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 50%', 
    overflow: 'hidden'
  }

  return (
    <div style={container_style} >
			{row_state['stacks'].map((stack, idx) => (
				<Stack key={idx} stack_state={stack} is_hand={row_state.is_hand}/>
			))}
    </div>
  )
}

/* components/Stack.jsx */

/* components/Stack.jsx */
import { useState, useRef, useEffect } from 'react'
import { Tile, Card } from '.'

const TILE_ASPECT_RATIO = 626 / 457
const CARD_ASPECT_RATIO = 745 / 1040

export const Stack = ({ stack_state, is_hand = false }) => {

	const container_style = {
      position: 'relative',
      height: is_hand === true ? '100%' : '40%',
      aspectRatio: is_hand === true ? CARD_ASPECT_RATIO : TILE_ASPECT_RATIO,
      minWidth: 0,
	}

  const get_position_styling = (index) => {
    const total_cards = stack_state.card_arr.length
    const MAX_STACK_HEIGHT = 150
    const stack_spacing = Math.min(25, MAX_STACK_HEIGHT / total_cards)
    const total_stack_height = (total_cards - 1) * stack_spacing
    const start_offset = -(total_stack_height / 2)

    return {
      position: 'absolute',
      height: '100%',
      width: '100%',
      top: `calc(50% + ${start_offset + (index * stack_spacing)}%)`,
      transform: 'translateY(-50%)', 
      zIndex: index,
    }
  }

  if (is_hand === true) {
    return (
      <div style={container_style}>
        {stack_state.card_arr.map((card, index) => (
          <div key={index} style={get_position_styling(index)}>
            <Card art_url={card.card} />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={container_style}>
      {stack_state.card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)}>
          <Tile art_url={card.crop} />
        </div>
      ))}
    </div>
  )
}
/* components/Tile.jsx */
export const Tile = ({ art_url }) => {
  const ASPECT_RATIO = 626 / 457

  const card_style = {
    height: '100%',
    aspectRatio: ASPECT_RATIO,
    overflow: 'hidden',
    background: 'black',
    border: '2px solid black',
    borderRadius: '8px',
  }

  const img_style = {
    width: '100%',
    height: '100%',
    display: 'block',
  }

  return (
    <div style={card_style}>
      <img 
        src={art_url} 
        alt="Tile" 
        style={img_style}
      />
    </div>
  )
}

export { Card } from './Card'
export { OpponentBoard } from './OpponentBoard'
export { PlayerBoard } from './PlayerBoard'
export { Row } from './Row'
export { Stack } from './Stack'
export { Tile } from './Tile'
