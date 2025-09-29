import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DataProvider } from "./context/DataContext";
import { ChatProvider } from "./context/ChatContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChatProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </ChatProvider>
  </StrictMode>,
)
