/* App.jsx */
import React from 'react'
import { GameStateProvider } from './providers/GameState'
import GameLayout from './components/GameLayout'
import './styles/remove_scrollbars.css'

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
