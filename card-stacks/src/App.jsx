/* App.jsx */
import React from 'react'
import { BoardStateProvider } from './BoardContext'
import Board from './components/Board'
import './remove_scrollbars.css'

/**
 * Root component wrapping Board with BoardState provider.
 * Ensures all child components have access to shared state management.
 */
const App = () => {
  return (
    <div style={{ height: '100vh' }}>
      <BoardStateProvider>
        <Board />
      </BoardStateProvider>
    </div>
  )
}

export default App
