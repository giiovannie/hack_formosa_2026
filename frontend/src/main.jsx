import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ThemeProvider from '@/components/theme-provider'
import './index.css'
import Page from './Page.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  </StrictMode>,
)
