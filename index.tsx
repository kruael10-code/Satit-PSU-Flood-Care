import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // (ถ้ามี)
// 1. นำเข้า HashRouter
import { HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. เอา HashRouter มาครอบ App ไว้แบบนี้ครับ */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)