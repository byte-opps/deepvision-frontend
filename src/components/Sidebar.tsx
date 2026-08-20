

import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Image as ImageIcon,
  Target,
  Cpu,
  Tag,
  FileText,
  ListTodo,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../stores/auth'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/images', label: 'Images', icon: ImageIcon },
  { path: '/mpi', label: 'MPI', icon: Target },
  { path: '/ai', label: 'AI', icon: Cpu },
  { path: '/tags', label: 'Tags', icon: Tag },
  { path: '/metadata', label: 'Metadata', icon: FileText },
  { path: '/tasks', label: 'Tasks', icon: ListTodo },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 bg-deepvision-900 border-r border-deepvision-700 flex flex-col h-screen">
      <div className="p-4 border-b border-deepvision-700">
        <h1 className="text-xl font-bold text-white">DeepVision</h1>
        {user && (
          <p className="text-sm text-gray-400 mt-1">{user.username}</p>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-deepvision-700 hover:text-white transition-colors"
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-deepvision-700">
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-deepvision-700 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
