import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. Importamos el Authenticator para habilitar el contexto de usuario
import { Authenticator } from '@aws-amplify/ui-react'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Envolvemos la App en el Provider; esto permite que 'useAuthenticator' 
           en App.jsx sepa en tiempo real si alguien inició sesión */}
    <Authenticator.Provider>
      <App />
    </Authenticator.Provider>
  </StrictMode>,
)