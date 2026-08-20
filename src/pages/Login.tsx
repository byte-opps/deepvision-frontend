import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { Lock, User } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login: doLogin } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await doLogin({ username, password })
      navigate('/')
    } catch (err: any) {
      setError(err.detail || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-deepvision-950">
      <div className="w-full max-w-md p-8 bg-deepvision-900 border border-deepvision-700 rounded-xl">
        <h1 className="text-2xl font-bold text-white mb-1">DeepVision</h1>
        <p className="text-gray-400 mb-6">Login to continue</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          <div className="flex items-center gap-2">
            <User size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 bg-deepvision-800 border border-deepvision-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-deepvision-500"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-deepvision-800 border border-deepvision-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-deepvision-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-deepvision-600 hover:bg-deepvision-500 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          No account?{' '}
          <a href="/register" className="text-deepvision-400 hover:text-deepvision-300">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}
