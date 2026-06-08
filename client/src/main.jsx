import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

// React 18 mount configuration root entry block
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Router hooks like useNavigate seamlessly access karne ke liye pure App ko BrowserRouter se wrap kiya hai */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)