import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' 
import { GoogleOAuthProvider } from '@react-oauth/google';

// 🔥 IMPORT CRYPTO PROVIDER
import { CryptoProvider } from './context/CryptoContext.jsx'; 
// 🔥 IMPORT CALENDAR NOTIFICATION PROVIDER
import { CalendarNotificationProvider } from './context/CalendarNotificationProvider.jsx'; // Path check kar lena
// 🔥 IMPORT SETTINGS PROVIDER
import { SettingsProvider } from './context/SettingsContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> 
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <CryptoProvider>
          {/* 🔥 APP KO CALENDAR NOTIFICATIONS AUR SETTINGS SE WRAP KIYA HAI */}
          <SettingsProvider>
            <CalendarNotificationProvider>
              <App />
            </CalendarNotificationProvider>
          </SettingsProvider>
        </CryptoProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
