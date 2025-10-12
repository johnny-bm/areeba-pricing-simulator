import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.tsx'
import { ErrorBoundary } from './components/system/ErrorBoundary'
import './globals.css'
import { verifyDatabaseSchemaInDev } from '@/lib/db-verification';

// Verify database schema in development
verifyDatabaseSchemaInDev();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)