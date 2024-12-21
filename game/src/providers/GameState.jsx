/* providers/GameState.jsx */
import { createContext, useContext, useState } from 'react'

const GameStateContext = createContext(null)

/**
 * CUSTOM HOOK PROVIDING ACCESS TO GAME-LEVEL STATE AND OPERATIONS
 * 
 * @returns {Object} Game state context and operations
 * @throws {Error} When used outside of GameStateProvider
 */
export const useGameState = () => {
  const context = useContext(GameStateContext)
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider')
  }
  return context
}

/**
 * PROVIDES GAME-LEVEL STATE MANAGEMENT AND PLAYER PERSPECTIVE HANDLING
 * COORDINATES MULTIPLE BOARD STATES AND DETERMINES VISUAL PRESENTATION
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap with context
 * @param {string} props.currentPlayerId - Identifier for the active player
 */
export const GameStateProvider = ({ children, currentPlayerId }) => {
  const [players] = useState({
    'player1': { position: 'bottom' },
    'player2': { position: 'top_left' },
    'player3': { position: 'top_center' },
    'player4': { position: 'top_right' }
  })

  /**
   * DETERMINES IF A BOARD SHOULD BE DISPLAYED AS AN OPPONENT VIEW
   * 
   * @param {string} playerId - ID of the player whose board is being checked
   * @returns {boolean} True if board belongs to an opponent
   */
  const isOpponentBoard = (playerId) => playerId !== currentPlayerId

  /**
   * CALCULATES ROTATION BASED ON PLAYER POSITION
   * 
   * @param {string} playerId - ID of the player whose board is being rotated
   * @returns {number} Rotation angle in degrees
   */
  const getBoardRotation = (playerId) => {
    if (playerId === currentPlayerId) return 0
    return 180
  }

  const value = {
    currentPlayerId,
    players,
    isOpponentBoard,
    getBoardRotation
  }

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  )
}
