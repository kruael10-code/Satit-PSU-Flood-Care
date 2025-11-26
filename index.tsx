import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// import './index.css'
// เปลี่ยนจาก BrowserRouter เป็น HashRouter
import { HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ใช้ HashRouter ครอบ App ไว้ จะช่วยแก้ปัญหาหน้าขาวบน GitHub Pages ได้ 100% */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)