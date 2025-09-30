import React from 'react'

export default function App() {
  return (
    <div
      style={{
        padding: 24,
        border: '4px solid red',
        background: '#fffbe6',
        color: '#111',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial'
      }}
      className="container"
    >
      <h1 className="display-5">✅ Vite + React</h1>
      <p>Si ves este bloque con borde rojo, la app está montando bien.</p>
      <button className="btn btn-primary">Botón Bootstrap</button>
    </div>
  )
}
