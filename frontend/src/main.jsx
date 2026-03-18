import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Authenticator } from '@aws-amplify/ui-react';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Este Provider es el que permite que App sepa si hay alguien logueado */}
    <Authenticator.Provider>
      <App />
    </Authenticator.Provider>
  </React.StrictMode>,
)