import { useEffect, useState, useCallback } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { reportError } from '../lib/error'
import type { ErrorReport } from '../types'
import { AlertTriangle, Trash2, ChevronLeft, ChevronRight, ServerCrash } from 'lucide-react'

export default function ErrorReports() {
  const [reports, setReports] = useState<ErrorReport[]>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { reports: rows } = await api.feedback.errors.list(limit, offset)
      setReports(rows)
    } catch (e: any) {
      reportError(e)
    } finally {
      setLoading(false)
    }
  }, [limit, offset])

  useEffect(() => {
    load()
  }, [load])

  const clearAll = async () => {
    if (!confirm('Delete all captured error reports?')) return
    try {
      await fetch('/api/v1/feedback/errors/clear', { method: 'POST' })
      setReports([])
      setOffset(0)
    } catch (e: any) {
      reportError(e)
    }
  }

  const typeColor: Record<string, string> = {
    ApiError: 'text-red-400',
    Error: 'text-yellow-400',
    TypeError: 'text-orange-400',
    ReferenceError: 'text-orange-400',
    RangeError: 'text-orange-400',
    SyntaxError: 'text-orange-400',
  }

  if (loading) return <div className="p-8 text-gray-400">Loading errors...</div>

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ServerCrash className="text-deepvision-400" size={24} />
            <h1 className="text-2xl font-bold text-white">Error Reports</h1>
          </div>
          <button
            onClick={clearAll}
            disabled={reports.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/40 border border-red-800 text-red-300 hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={16} />
            <span>Clear all</span>
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Errors captured from the frontend (API failures, uncaught exceptions, render errors).
          Most recent first.
        </p>

        <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="mx-auto text-deepvision-600 mb-3" size={40} />
              <p className="text-gray-400">No errors captured yet.</p>
              <p className="text-gray-500 text-sm mt-1">
                Errors you trigger in the app will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-deepvision-700">
              {reports.map((r) => (
                <div key={r.id} className="p-4 hover:bg-deepvision-800/40">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold ${typeColor[r.type] || 'text-white'}`}>
                          {r.type || 'Error'}
                        </span>
                        {r.component && (
                          <span className="text-xs px-2 py-0.5 rounded bg-deepvision-800 text-deepvision-300">
                            {r.component}
                          </span>
                        )}
                      </div>
                      <p className="text-white mt-1">{r.message || 'No message'}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        {r.action && <span>action: {r.action}</span>}
                        {r.endpoint && <span>endpoint: {r.endpoint}</span>}
                        <span>{new Date(r.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {r.stack && (
                    <pre className="mt-2 text-xs text-gray-400 bg-deepvision-950 border border-deepvision-800 rounded p-3 overflow-x-auto whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                      {r.stack}
                    </pre>
                  )}
                  {r.payload && (
                    <pre className="mt-2 text-xs text-gray-400 bg-deepvision-950 border border-deepvision-800 rounded p-3 overflow-x-auto whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                      {r.payload}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          <span>Showing {offset + 1}–{Math.min(offset + limit, reports.length)} of {reports.length}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLimit((l) => Math.max(10, l - 10))}
              disabled={limit <= 10}
              className="px-2 py-1 rounded bg-deepvision-800 hover:bg-deepvision-700 disabled:opacity-40 transition-colors"
            >
              -10
            </button>
            <button
              onClick={() => setOffset((o) => Math.max(0, o - limit))}
              disabled={offset <= 0}
              className="px-2 py-1 rounded bg-deepvision-800 hover:bg-deepvision-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => { setOffset((o) => o + limit); setLimit((l) => l + 50) }}
              className="px-2 py-1 rounded bg-deepvision-800 hover:bg-deepvision-700 transition-colors"
            >
              +50
            </button>
            <button
              onClick={() => { setOffset(0); setLimit(50) }}
              className="px-2 py-1 rounded bg-deepvision-800 hover:bg-deepvision-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setOffset((o) => o + limit)}
              disabled={offset + limit >= reports.length}
              className="px-2 py-1 rounded bg-deepvision-800 hover:bg-deepvision-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
