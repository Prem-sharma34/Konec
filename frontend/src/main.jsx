import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import './index.css'
import App from './App.jsx'

// Import Roboto font (optional)
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Inter", "Avenir", "Helvetica", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalizes CSS across browsers */}
      <App />
    </ThemeProvider>
  </StrictMode>,
)