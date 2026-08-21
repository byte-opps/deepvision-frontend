import React from 'react'
import { reportError } from '../lib/error'

interface Props {
  children: React.ReactNode
  component?: string
}

interface State {
  error: Error | null
  info: { componentStack?: string | null } | null
}

/**
 * Global render-error boundary. Catches errors thrown while a component tree
 * renders, relays them to the backend, and shows a recoverable fallback UI
 * (instead of a blank screen / uncaught crash).
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, info: null }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error, info })
    reportError(error, {
      component: this.props.component || info.componentStack || '',
    })
  }

  render() {
    const { error, info } = this.state
    if (error) {
      const stack = error.stack || error.message
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white border border-red-300 rounded-lg shadow-lg p-8 max-w-xl w-full">
            <h1 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h1>
            <p className="text-red-600 mb-4 text-sm">{error.message}</p>
            {(info?.componentStack || stack) && (
              <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-3 overflow-auto max-h-72 mb-4 whitespace-pre-wrap">
                {info?.componentStack ? `${info.componentStack}\n\n` : ''}
                {stack}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ error: null, info: null })
                window.location.href = '/'
              }}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Reload app
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
