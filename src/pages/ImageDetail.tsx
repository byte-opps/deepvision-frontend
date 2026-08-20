import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { Image, Tag } from '../types'
import { Camera, ExternalLink } from 'lucide-react'

export default function ImageDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [image, setImage] = useState<Image | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [exif, setExif] = useState<Record<string, any>>({})
  const [fileProps, setFileProps] = useState<Record<string, any>>({})
  const [colorAnalysis, setColorAnalysis] = useState<Record<string, any>>({})

  useEffect(() => {
    Promise.all([
      api.images.get(id!),
      api.tags.list(id!),
      api.ai.face(id!),
      api.metadata.exif(id!),
      api.metadata.fileProperties(id!),
      api.metadata.colorAnalysis(id!),
    ])
      .then(([img, tg, ex, fp, ca]) => {
        setImage(img)
        setTags(tg)
        setExif(ex)
        setFileProps(fp)
        setColorAnalysis(ca)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>
  if (!image) return <div className="p-8 text-gray-400">Image not found</div>

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <Layout>
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-4">
          ← Back
        </button>

        <div className="grid grid-cols-3 gap-6">
          {/* Image viewer */}
          <div className="col-span-2">
            <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4">
              <div className="aspect-video bg-deepvision-800 flex items-center justify-center mb-4">
                <ExternalLink size={48} className="text-gray-600" />
              </div>
              <h2 className="text-white text-lg font-semibold">{image.original_filename}</h2>
              <p className="text-gray-400 text-sm mt-1">
                {formatBytes(image.size_bytes)} · {image.mime_type}
              </p>
            </div>

            {/* Metadata tabs */}
            <div className="mt-4 bg-deepvision-900 border border-deepvision-700 rounded-lg">
              <div className="flex border-b border-deepvision-700">
                {['overview', 'exif', 'tags', 'file', 'color'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-deepvision-800 transition-colors"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="p-4">
                {activeTab === 'overview' && (
                  <div className="space-y-2">
                    <p className="text-gray-300">Image uploaded successfully. Use the metadata tabs to view detailed information.</p>
                  </div>
                )}
                {activeTab === 'exif' && (
                  <pre className="text-sm text-gray-300 bg-deepvision-800 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(exif, null, 2)}
                  </pre>
                )}
                {activeTab === 'tags' && (
                  <div>
                    <p className="text-gray-300 mb-2">Tags ({tags.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag.tag_name} className="px-2 py-1 bg-deepvision-700 text-gray-300 rounded text-sm">
                          {tag.tag_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'file' && (
                  <pre className="text-sm text-gray-300 bg-deepvision-800 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(fileProps, null, 2)}
                  </pre>
                )}
                {activeTab === 'color' && (
                  <pre className="text-sm text-gray-300 bg-deepvision-800 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(colorAnalysis, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Camera size={16} /> Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-400">Folder</p>
                  <p className="text-white">{image.folder_name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Dimensions</p>
                  <p className="text-white">{image.width} × {image.height}</p>
                </div>
                <div>
                  <p className="text-gray-400">Uploaded</p>
                  <p className="text-white">{new Date(image.uploaded_at).toLocaleString()}</p>
                </div>
                {image.nsfw_score !== undefined && (
                  <div>
                    <p className="text-gray-400">NSFW Score</p>
                    <p className="text-white">{image.nsfw_score.toFixed(2)}</p>
                  </div>
                )}
                {image.face_count !== undefined && (
                  <div>
                    <p className="text-gray-400">Faces Detected</p>
                    <p className="text-white">{image.face_count}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
