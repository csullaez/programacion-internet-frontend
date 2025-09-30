import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// estilos base (deja comentado el SCSS por ahora)
// import './style.scss'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

createRoot(document.getElementById('root')!).render(<App />)
