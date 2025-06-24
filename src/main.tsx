import * as ReactDOMLegacy from 'react-dom'
// Provide default export shim for libraries expecting ReactDOM default (e.g., react-draggable)
// @ts-ignore
;(ReactDOMLegacy as any).default = ReactDOMLegacy

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
