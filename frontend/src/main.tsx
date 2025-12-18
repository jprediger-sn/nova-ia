import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { configureAmplify } from './lib/cognito/amplify-config'
import App from './App.tsx'

// Configura o Amplify antes de renderizar a aplicação
configureAmplify()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
