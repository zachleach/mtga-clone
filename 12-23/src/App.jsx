import './App.css'
import { OpponentBoard, PlayerBoard } from './components'

const App = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Opponents Section - 30% height */}
      <div style={{ display: 'flex', flex: '0 0 30%', flexDirection: 'column', border: '1pt solid yellow', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flex: '0 0 100%', flexDirection: 'row', overflow: 'hidden' }}>
          <OpponentBoard />
          <OpponentBoard />
          <OpponentBoard />
        </div>
      </div>

      {/* Player's Board - 70% height */}
      <div style={{ display: 'flex', flex: '0 0 70%', overflow: 'hidden' }}>
        <PlayerBoard />
      </div>

    </div>
  )
}

export default App
