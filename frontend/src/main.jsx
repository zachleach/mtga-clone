import { createRoot } from 'react-dom/client'
import { ServerProvider } from './components'
import App from './App.jsx'

createRoot(document.getElementById('root')).render( 
	<ServerProvider>
		<App />
	</ServerProvider>
)

