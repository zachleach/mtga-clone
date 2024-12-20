/* App.jsx */
import './remove_scrollbars.css'
import React, { useRef, useEffect } from 'react'
import { GameStateProvider, useGameState } from './GameState'
import { BoardStateProvider, useBoardState } from './BoardState'
import { createReadOnlyHandlers } from './handlerUtils'



/**
 * MAIN LAYOUT COMPONENT ORGANIZING CARD ROWS IN A T-SHAPED ARRANGEMENT
 * TOP ROW SPANS FULL WIDTH, LEFT AND RIGHT ROWS ARE POSITIONED HORIZONTALLY
 * HAND REMAINS AT THE BOTTOM
 */
const Board = () => {
  const { rows } = useBoardState()
  const [top_row, left_row, right_row] = rows

  const container_style = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  }

  const middle_section_style = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '20%',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  }

  return (
    <div style={container_style}>
      <CardRow row={top_row} row_position="top" />
      <div style={middle_section_style}>
        <CardRow row={left_row} row_position="left" />
        <CardRow row={right_row} row_position="right" />
      </div>
      <CardHand />
    </div>
  )
}







/**
 * BASE VISUAL COMPONENT REPRESENTING A SINGLE CARD
 * RENDERS AS A COLORED RECTANGLE WITH ROUNDED CORNERS AND BORDER
 *
 * @param {Object} props
 * @param {string} props.color - Color to fill card background
 */
const Card = ({ color }) => {
  const card_style = {
    width: '100%',
    height: '100%',
    backgroundColor: color || 'white',
    border: '1px solid black',
    borderRadius: '12px',
  }

  return <div style={card_style}/>
}


/**
 * COMPONENT FOR DISPLAYING A FANNED HAND OF CARDS
 * CARDS ARE ARRANGED IN A CURVED ARC PATTERN WITH ROTATION AND VERTICAL OFFSET
 * HANDLES DRAG/DROP EVENTS AT THE CARD LEVEL
 */
const CardHand = () => {
  const { hand, handlers } = useBoardState()
  
  const container_style = {
    height: '20%',
    width: '100%',
    background: 'grey',
    border: '1px solid black',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  }

  const get_card_style = (index, total_cards) => {
    const card_height = 200
    const card_width = card_height * 0.714
    const position = index - (total_cards - 1) / 2
    const rotation_multiplier = 4
    const hand_density = 120
    const hand_density_multiplier = 1
    const rotation = rotation_multiplier * position
    const lower_by = 0.8 * card_width
    const vertical_offset = (Math.pow(position, 2) * rotation_multiplier) + lower_by

    return {
      position: 'absolute',
      height: `${card_height}px`,
      width: `${card_width}px`,
      transform: `rotate(${rotation}deg) translateY(${vertical_offset}px)`,
      transformOrigin: 'bottom center',
      left: `calc(50% - ${card_width / 2}px + ${position * (hand_density / hand_density_multiplier)}px)`,
      backgroundColor: 'transparent',
      zIndex: index,
    }
  }

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: (e) => handlers.drag_start.hand(e, index),
    onDrop: (e) => handlers.drop.hand(e, index),
    onDragOver: handlers.drag_over.hand
  })

  const container_dnd_attributes = {
    onDrop: (e) => handlers.drop.hand_container(e, hand.cards.length, e.clientX),
    onDragOver: handlers.drag_over.hand_container
  }

  return (
    <div style={container_style} {...container_dnd_attributes}>
      {hand.cards.map((card, index) => (
        <div
          key={index}
          style={get_card_style(index, hand.cards.length)}
          {...html5_dnd_attributes(index)}
        >
          <Card {...card} />
        </div>
      ))}
    </div>
  )
}





/**
 * CONTAINER COMPONENT FOR A ROW OF CARD STACKS
 * SUPPORTS BOTH VERTICAL AND HORIZONTAL POSITIONING BASED ON ROW_POSITION
 * MAINTAINS CONSISTENT HEIGHT AND SPACING OF STACKS WITHIN ROW
 *
 * @param {Object} props
 * @param {Object} props.row - Row state object containing stack data
 * @param {string} props.row_position - Identifier for row position ('top', 'left', 'right')
 */
const CardRow = ({ row, row_position }) => {
  const { handlers } = useBoardState()

  const get_container_style = () => {
    const base_style = {
      background: 'grey',
      border: '1px solid black',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }

    if (row_position === 'top') {
      return {
        ...base_style,
        height: '20%',
        width: '100%',
      }
    }
    return {
      ...base_style,
      height: '100%',
      width: '50%',
      flex: 1,
    }
  }

  const html5_dnd_attributes = {
    onDragOver: (e) => handlers.drag_over.cardrow(e, row_position),
    onDrop: (e) => handlers.drop.cardrow(e, row_position),
  }

  return (
    <div style={get_container_style()} {...html5_dnd_attributes}>
      {row.stacks.map(stack => (
        <CardStack
          key={stack.id}
          card_arr={stack.cards}
          row={row_position}
          stack_id={stack.id}
        />
      ))}
    </div>
  )
}






/**
 * MANAGES LAYOUT AND DRAG/DROP BEHAVIOR FOR A VERTICAL STACK OF CARDS
 * CARDS ARE POSITIONED ABSOLUTELY WITH PARTIAL OVERLAP BASED ON STACK SIZE
 * REGISTERS ITSELF WITH BOARDSTATE'S REF SYSTEM FOR POSITION TRACKING
 *
 * @param {Object} props
 * @param {Array} props.card_arr - Array of card objects to display
 * @param {string} props.row - Row identifier for this stack
 * @param {string} props.stack_id - Unique identifier for this stack
 */
const CardStack = ({ card_arr, row, stack_id }) => {
  const { handlers, register_stack_ref } = useBoardState()
  const stack_ref = useRef(null)

  useEffect(() => {
    register_stack_ref(row, stack_id, stack_ref)
    return () => register_stack_ref(row, stack_id, null)
  }, [row, stack_id])

  const card_height = 140
  const overlap = 0.15
  const visible_height = card_height * overlap
  
  const stack_container_styling = {
    position: 'relative',
    height: `${((card_arr.length - 1) * visible_height) + card_height}px`,
    width: `${card_height * 0.714}px`,
    margin: `${card_height * 0.1}px`,
  }

  const get_position_styling = (index) => ({
    position: 'absolute',
    height: `${card_height}px`,
    width: '100%',
    top: `${index * card_height * overlap}px`,
    zIndex: index,
  })

  const html5_dnd_attributes = (index) => ({
    draggable: true,
    onDragStart: (e) => handlers.drag_start.cardstack(e, row, stack_id, index),
    onDrop: (e) => handlers.drop.cardstack(e, row, stack_id, index),
    onDragOver: (e) => handlers.drag_over.cardstack(e, index)
  })

  return (
    <div ref={stack_ref} style={stack_container_styling}>
      {card_arr.map((card, index) => (
        <div key={index} style={get_position_styling(index)} {...html5_dnd_attributes(index)}>
          <Card {...card} />
        </div>
      ))}
    </div>
  )
}






/**
 * MANAGES THE OVERALL GAME LAYOUT INCLUDING OPPONENT AND PLAYER AREAS
 * HANDLES VIEWPORT DIVISION AND BOARD POSITIONING/ROTATION
 */
const GameLayout = () => {
  const { currentPlayerId, players, isOpponentBoard, getBoardRotation } = useGameState()

  const container_style = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  }

  const opponents_container_style = {
    display: 'flex',
    height: '40vh',
    width: '100%',
    backgroundColor: '#1a1a1a',
  }

  const player_container_style = {
    height: '60vh',
    width: '100%',
    backgroundColor: '#2a2a2a',
  }

  const opponent_board_style = (playerId) => ({
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transform: `rotate(${getBoardRotation(playerId)}deg)`,
    transformOrigin: 'center center',
  })

  return (
    <div style={container_style}>
      <div style={opponents_container_style}>
        {Object.entries(players)
          .filter(([playerId]) => isOpponentBoard(playerId))
          .map(([playerId, data]) => (
            <div key={playerId} style={opponent_board_style(playerId)}>
              <PlayerBoard 
                playerId={playerId} 
                isOpponentBoard={true}
              />
            </div>
          ))}
      </div>
      <div style={player_container_style}>
        <PlayerBoard 
          playerId={currentPlayerId}
          isOpponentBoard={false}
        />
      </div>
    </div>
  )
}






/**
 * WRAPS THE MAIN BOARD COMPONENT WITH APPROPRIATE STATE AND INTERACTION HANDLING
 * BASED ON WHETHER IT REPRESENTS THE CURRENT PLAYER OR AN OPPONENT
 * 
 * @param {Object} props
 * @param {string} props.playerId - Unique identifier for the player
 * @param {boolean} props.isOpponentBoard - Whether this board belongs to an opponent
 */
const PlayerBoard = ({ playerId, isOpponentBoard }) => {
  const getModifiedHandlers = (originalHandlers) => {
    if (isOpponentBoard) {
      return createReadOnlyHandlers(originalHandlers)
    }
    return originalHandlers
  }

  return (
    <BoardStateProvider modifyHandlers={getModifiedHandlers}>
      <div style={{ height: '100%', width: '100%' }}>
        <Board />
      </div>
    </BoardStateProvider>
  )
}






/**
 * ROOT APPLICATION COMPONENT
 * INITIALIZES GAME STATE WITH CURRENT PLAYER CONTEXT
 */
const App = () => {
  /* WOULD NORMALLY COME FROM AUTH/SESSION */
  const currentPlayerId = 'player1'

  return (
    <GameStateProvider currentPlayerId={currentPlayerId}>
      <GameLayout />
    </GameStateProvider>
  )
}

export default App
