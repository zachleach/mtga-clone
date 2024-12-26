import { useState, useEffect } from 'react'

const App = () => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [socket, setSocket] = useState(null)
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket('ws://localhost:5000/ws')
      ws.onopen = () => setStatus('connected')
      ws.onclose = () => {
        setStatus('disconnected')
        setTimeout(connect, 1000)
      }
      ws.onmessage = (event) => setTodos(JSON.parse(event.data))
      setSocket(ws)
    }
    
    connect()
    return () => socket?.close()
  }, [])

  const addTodo = () => {
    if (!newTodo.trim() || !socket) return
    socket.send(JSON.stringify({ text: newTodo }))
    setNewTodo('')
  }

  return (
    <div>
      <h1>Real-time Todos</h1>
      <p>Status: {status}</p>

      <input
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addTodo()}
      />
      <button onClick={addTodo} disabled={status !== 'connected'}>
        Add
      </button>

      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo.text}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
