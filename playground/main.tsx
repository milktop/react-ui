import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/inter'
import '@fontsource-variable/geist'
import '@fontsource-variable/dm-sans'
import './app.css'
import { App } from './App'

createRoot(document.getElementById('app')!).render(<App />)
