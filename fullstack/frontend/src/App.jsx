import { useState, useEffect } from 'react'

const App = () => {
  const [todos, set_todos] = useState([])
  const [new_todo, set_new_todo] = useState('')
  const [socket, set_socket] = useState(null)
  const [status, set_status] = useState('connecting')

  useEffect(() => {
    /* connect to websocket and handle reconnection */
    const connect = () => {
      const ws = new WebSocket('ws://localhost:5000/ws')
      
      ws.onopen = () => set_status('connected')
      ws.onclose = () => {
        set_status('disconnected')
        /* attempt to reconnect after 1 second */
        setTimeout(connect, 1000)
      }
      ws.onmessage = (event) => set_todos(JSON.parse(event.data))
      
      set_socket(ws)
    }
    
    connect()
    return () => socket?.close()
  }, [])


  const add_todo = () => {
    if (!new_todo.trim() || !socket) return
    socket.send(JSON.stringify({ text: new_todo }))
    set_new_todo('')
		console.log(todos)
  }

  const handle_key_press = (e) => {
    if (e.key === 'Enter') add_todo()
  }
	



  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Real-time Todos</h1>
        <span className={`px-2 py-1 rounded text-sm ${
          status === 'connected' ? 'bg-green-100 text-green-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      </div>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={new_todo}
          onChange={(e) => set_new_todo(e.target.value)}
          onKeyPress={handle_key_press}
          className="flex-1 border p-2 rounded"
          placeholder="Enter new todo"
        />
        <button
          onClick={add_todo}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 
                     transition-colors disabled:opacity-50"
          disabled={status !== 'connected'}
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map((todo, index) => (
          <li key={index} className="p-3 bg-white border rounded shadow-sm">
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
