import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuthStore } from '../stores/auth'
import { reportError } from '../lib/error'
import { Wifi, WifiOff, Info } from 'lucide-react'

export default function Settings() {
  const { user, logout } = useAuthStore()
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected'>('connected')
  const [modules, _setModules] = useState<any[]>([])

  useEffect(() => {
    // Check API connectivity
    fetch('/api/health')
      .then(() => setApiStatus('connected'))
      .catch(async () => {
        await reportError(new Error('API health check failed'))
        setApiStatus('disconnected')
      })
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

        {/* User info */}
        <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Account</h2>
          <div className="space-y-2">
            <p className="text-gray-300">Username: <span className="text-white">{user?.username || 'N/A'}</span></p>
            <p className="text-gray-300">Email: <span className="text-white">N/A</span></p>
          </div>
        </div>

        {/* API status */}
        <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">API Connection</h2>
          <div className="flex items-center gap-3">
            {apiStatus === 'connected' ? (
              <Wifi className="text-green-400" size={24} />
            ) : (
              <WifiOff className="text-red-400" size={24} />
            )}
            <span className="text-white">{apiStatus === 'connected' ? 'API Connected' : 'API Disconnected'}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">API is running on http://localhost:8076</p>
        </div>

        {/* Version / About */}
        <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-6 mb-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Info size={18} className="text-deepvision-400" />
            About
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              Version: <span className="text-white font-mono">{import.meta.env.VITE_APP_VERSION}</span>
            </p>
            <p className="text-gray-300">
              Build: <span className="text-white font-mono">{import.meta.env.VITE_BUILD_HASH}</span>
            </p>
            <p className="text-gray-400 text-xs mt-2">
              The build hash is set via the VITE_BUILD_HASH environment variable (defaults to 'dev'). Use it to confirm your app is up to date.
            </p>
          </div>
        </div>

        {/* Modules */}
        <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod) => (
              <div key={mod.name} className="bg-deepvision-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{mod.display_name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${mod.enabled ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {mod.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{mod.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="bg-red-900/50 hover:bg-red-900/70 text-red-300 px-4 py-2 rounded-lg border border-red-800">
          Logout
        </button>
      </div>
    </Layout>
  )
}
