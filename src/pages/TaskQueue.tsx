import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import type { Task, TaskStats } from '../types'
import { Play, Trash2, ChevronRight } from 'lucide-react'

export default function TaskQueue() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    Promise.all([api.tasks.list(), api.tasks.stats(), api.modules.list()])
      .then(([t, s, m]) => {
        setTasks(t)
        setStats(s)
        setModules(m)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleRun = async () => {
    setRunning(true)
    try {
      await api.tasks.run()
      await Promise.all([api.tasks.list(), api.tasks.stats()]).then(([t, s]) => {
        setTasks(t)
        setStats(s)
      })
    } catch (err) {
      console.error(err)
    }
    setRunning(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      await api.tasks.delete(id)
      await api.tasks.list().then(setTasks)
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Task Queue</h1>
          <button onClick={handleRun} disabled={running} className="flex items-center gap-2 bg-deepvision-600 hover:bg-deepvision-500 text-white px-4 py-2 rounded-lg disabled:opacity-50">
            <Play size={18} />
            <span>{running ? 'Running...' : 'Run All'}</span>
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
            <p className="text-gray-400 text-sm">Total</p>
          </div>
          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats?.pending || 0}</p>
            <p className="text-gray-400 text-sm">Pending</p>
          </div>
          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats?.running || 0}</p>
            <p className="text-gray-400 text-sm">Running</p>
          </div>
          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats?.completed || 0}</p>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats?.failed || 0}</p>
            <p className="text-gray-400 text-sm">Failed</p>
          </div>
        </div>

        {/* Tasks table */}
        <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-deepvision-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Progress</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Created</th>
                <th className="px-4 py-3 text-right text-sm text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deepvision-700">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-deepvision-800/50">
                  <td className="px-4 py-3 text-white">{task.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.status === 'completed' ? 'bg-green-900 text-green-300' :
                      task.status === 'failed' ? 'bg-red-900 text-red-300' :
                      task.status === 'running' ? 'bg-blue-900 text-blue-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32 bg-deepvision-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'failed' ? 'bg-red-500' :
                          task.status === 'running' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{task.progress}%</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {new Date(task.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(task.id)} className="text-red-400 hover:text-red-300 mr-2">
                      <Trash2 size={16} />
                    </button>
                    <a href={`/tasks/${task.id}`} className="text-deepvision-400 hover:text-deepvision-300">
                      <ChevronRight size={16} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Module status */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Module Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod) => (
              <div key={mod.name} className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{mod.display_name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${mod.enabled ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {mod.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{mod.description}</p>
                <p className="text-gray-500 text-xs mt-1">v{mod.version}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
