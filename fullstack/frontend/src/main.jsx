import { createRoot } from 'react-dom/client'
import { ServerProvider, ClientProvider } from './components'
import App from './App.jsx'

createRoot(document.getElementById('root')).render( 
	<ServerProvider>
		<ClientProvider>
			<App />
		</ClientProvider>
	</ServerProvider>
)

