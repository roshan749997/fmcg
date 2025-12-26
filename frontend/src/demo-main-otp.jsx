import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoginOTP from './components/LoginOTP.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoginOTP />
  </StrictMode>,
)

