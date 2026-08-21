import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { reportError } from '../lib/error'
import type { Image, TaskStats } from '../types'
import { Image as ImageIcon, FileText, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [recentImages, setRecentImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.tasks.stats(), api.images.list({ limit: 10 })])
      .then(([stats, images]) => {
        setStats(stats)
        setRecentImages(images)
      })
      .catch((e) => reportError(e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="text-deepvision-400" size={20} />
              <span className="text-sm text-gray-400">Images</span>
            </div>
            <p className="text-2xl font-bold text-white">{recentImages.length}</p>
          </div>
          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-deepvision-400" size={20} />
              <span className="text-sm text-gray-400">Tasks</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
          </div>
          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-yellow-500" size={20} />
              <span className="text-sm text-gray-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats?.pending || 0}</p>
          </div>
          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-green-500" size={20} />
              <span className="text-sm text-gray-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats?.completed || 0}</p>
          </div>
        </div>

        {/* Recent images */}
        <h2 className="text-lg font-semibold text-white mb-4">Recent Images</h2>
        <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg overflow-hidden">
          {recentImages.length === 0 ? (
            <p className="p-4 text-gray-400 text-center">No images yet</p>
          ) : (
            <table className="w-full">
              <thead className="bg-deepvision-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Filename</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Size</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Uploaded</th>
                  <th className="px-4 py-3 text-right text-sm text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deepvision-700">
                {recentImages.map((img) => (
                  <tr key={img.id} className="hover:bg-deepvision-800/50">
                    <td className="px-4 py-3 text-white">
                      <a href={`/images/${img.id}`} className="hover:text-deepvision-400">
                        {img.original_filename}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {(img.size_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(img.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`/images/${img.id}`}
                        className="text-deepvision-400 hover:text-deepvision-300"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}
