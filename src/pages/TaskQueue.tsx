import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { reportError } from '../lib/error'
import type { Task, TaskStats } from '../types'
import { Play, Trash2, ChevronRight, CircleStop } from 'lucide-react'

export default function TaskQueue() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [importJobs, setImportJobs] = useState<Record<string, any>>({})
  const [processRunning, setProcessRunning] = useState<Record<string, boolean>>({})

  useEffect(() => {
    Promise.all([api.tasks.list(), api.tasks.stats(), api.modules.list()])
      .then(([t, s, m]) => {
        setTasks(t)
        setStats(s)
        setModules(m)
      })
      .catch((e) => reportError(e))
      .finally(() => setLoading(false))

    // Poll import-process jobs so the progress bars update live.
    const supportsProcess = modules.filter((m) => m.supports_process)
    const pollJobs = async () => {
      await Promise.all(supportsProcess.map((m) => api.modules.jobs(m.name).then((j) => setImportJobs((prev) => ({ ...prev, [m.name]: j }) ))))
    }
    const timer = setInterval(pollJobs, 2000)
    pollJobs()
    return () => clearInterval(timer)
  }, [modules])

  const handleRun = async () => {
    setRunning(true)
    try {
      await api.tasks.run()
      await Promise.all([api.tasks.list(), api.tasks.stats()]).then(([t, s]) => {
        setTasks(t)
        setStats(s)
      })
    } catch (err) {
      reportError(err)
    }
    setRunning(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      try {
        await api.tasks.delete(id)
        await api.tasks.list().then(setTasks)
      } catch (err) {
        reportError(err)
      }
    }
  }

  const handleToggleEnabled = async (name: string) => {
    try {
      if (modules.find((m) => m.name === name)?.enabled) {
        await api.modules.disable(name)
      } else {
        await api.modules.enable(name)
      }
      await api.modules.list().then(setModules)
    } catch (err) {
      reportError(err)
    }
  }

  const handleStartProcess = async (name: string) => {
    setProcessRunning((p) => ({ ...p, [name]: true }))
    try {
      const job = await api.modules.run(name, {})
      await api.modules.jobs(name).then((j) => setImportJobs((prev) => ({ ...prev, [name]: j })))
      if (job && job.id) {
        // Surface the new job in the task queue.
        await api.tasks.list().then(setTasks)
      }
    } catch (err) {
      reportError(err)
    } finally {
      setProcessRunning((p) => ({ ...p, [name]: false }))
    }
  }

  const handleStopProcess = async (name: string) => {
    try {
      await api.modules.stop(name)
      await api.modules.jobs(name).then((j) => setImportJobs((prev) => ({ ...prev, [name]: j })))
    } catch (err) {
      reportError(err)
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
                    <button onClick={() => handleDelete(task.id)} className="text-red-400 hover:text-red-300 mr-2" title="Delete task">
                      <Trash2 size={16} />
                    </button>
                    <a href={`/tasks/${task.id}`} className="text-deepvision-400 hover:text-deepvision-300" title="View task">
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
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: mod.color }} />
                    {mod.display_name}
                  </h3>
                  <button onClick={() => handleToggleEnabled(mod.name)} className={`text-xs px-2 py-1 rounded transition-colors ${
                    mod.enabled ? 'bg-green-900/70 text-green-300 hover:bg-green-800' : 'bg-red-900/70 text-red-300 hover:bg-red-800'
                  }`}>
                    {mod.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
                <p className="text-gray-400 text-sm">{mod.description}</p>
                <p className="text-gray-500 text-xs mt-1">v{mod.version}</p>

                {mod.supports_process && (
                  <div className="mt-3 pt-3 border-t border-deepvision-700">
                    <div className="flex items-center justify-between mb-1">
                      <button onClick={() => handleStartProcess(mod.name)} disabled={processRunning[mod.name]} className="text-xs px-2 py-1 rounded bg-blue-900/70 text-blue-300 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                        <Play size={12} />
                        {processRunning[mod.name] ? 'Running...' : 'Start'}
                      </button>
                      <button onClick={() => handleStopProcess(mod.name)} disabled={!processRunning[mod.name]} className="text-xs px-2 py-1 rounded bg-red-900/70 text-red-300 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                        <CircleStop size={12} />
                        Stop
                      </button>
                    </div>
                    {importJobs[mod.name] && (
                      <div>
                        <div className="w-full bg-deepvision-800 rounded-full h-2 mt-1">
                          <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${importJobs[mod.name]?.progress || 0}%`, backgroundColor: processRunning[mod.name] ? '#93c5fd' : '#3b82f6' }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {importJobs[mod.name]?.imported || 0} / {importJobs[mod.name]?.total || 0} imported
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
