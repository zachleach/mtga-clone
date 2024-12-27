import { useState, useEffect } from 'react'

const App = () => {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '')
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('username'))
  const [todos, setTodos] = useState([])
  const [users, setUsers] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [socket, setSocket] = useState(null)
  const [status, setStatus] = useState('disconnected')

  useEffect(() => {
    if (isLoggedIn) {
      connect()
    }
  }, [isLoggedIn])

  const handleLogin = (e) => {
    e.preventDefault()
    if (!username.trim()) return
    localStorage.setItem('username', username)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('username')
    setIsLoggedIn(false)
    socket?.close()
  }

  const connect = () => {
    const ws = new WebSocket(`ws://localhost:5000/ws/${username}`)
    
    ws.onopen = () => setStatus('connected')
    ws.onclose = () => {
      setStatus('disconnected')
      setTimeout(() => connect(), 1000)
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'init':
          setTodos(data.todos)
          setUsers(data.users)
          break
        case 'todos':
          setTodos(data.todos)
          break
        case 'users':
          setUsers(data.users)
          break
      }
    }
    
    setSocket(ws)
  }


  const addTodo = () => {
    if (!newTodo.trim() || !socket) return
    socket.send(JSON.stringify({ text: newTodo }))
    setNewTodo('')
  }




  if (!isLoggedIn) {
    return (
      <div>
        <h1>Enter Username</h1>
        <form onSubmit={handleLogin}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <button type="submit">Join</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h1>Real-time Todos</h1>
      <p>Welcome, {username}! <button onClick={handleLogout}>Logout</button></p>
      <p>Status: {status}</p>
      
      <div>
        <h2>Online Users</h2>
        <ul>
          {users.map(user => (
            <li key={user}>{user}</li>
          ))}
        </ul>
      </div>

      <input
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        placeholder="Enter todo"
      />
      <button onClick={addTodo} disabled={status !== 'connected'}>
        Add
      </button>

      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo.username}: {todo.text}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
