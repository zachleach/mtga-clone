/* components/GameLayout.jsx */
import React from 'react'
import { useGameState } from '../providers/GameState'
import PlayerBoard from './PlayerBoard'

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

export default GameLayout
