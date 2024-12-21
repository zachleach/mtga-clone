/* components/PlayerBoard.jsx */
import React from 'react'
import { BoardStateProvider } from '../providers/BoardState'
import Board from './Board'
import { createReadOnlyHandlers } from '../utilities/handlerUtils'

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

export default PlayerBoard
