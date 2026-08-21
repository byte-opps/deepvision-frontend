import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { reportError } from './lib/error'
import './index.css'

function setupGlobalErrorHandlers() {
  // Uncaught JavaScript errors (not caught by try/catch or ErrorBoundary).
  // TS 5.9 types onerror as OnErrorEventHandler -> (ev: string | Event) => any.
  window.onerror = (ev: string | Event) => {
    const asEvent = ev instanceof Event ? (ev as ErrorEvent) : undefined
    const err = asEvent?.error || new Error(asEvent?.message || String(ev))
    reportError(err, { component: asEvent?.filename || '' })
    return true
  }
  // Unhandled promise rejections.
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason
    reportError(reason instanceof Error ? reason : new Error(String(reason)))
  }
}

setupGlobalErrorHandlers()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
