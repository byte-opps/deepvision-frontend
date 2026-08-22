import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useParams, useNavigate } from 'react-router-dom'
import FaceOverlay from '../components/FaceOverlay'
import { api } from '../lib/api'
import { reportError } from '../lib/error'
import type { Image, Tag, FaceDetection, FaceMatch } from '../types'
import { Camera, Scan, Search } from 'lucide-react'

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
  const [faces, setFaces] = useState<FaceDetection[]>([])
  const [selectedFace, setSelectedFace] = useState<FaceDetection | null>(null)
  const [matchResults, setMatchResults] = useState<FaceMatch[]>([])
  const [faceLoading, setFaceLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      api.images.get(id!),
      api.tags.list(id!),
      api.ai.face(id!),
      api.metadata.exif(id!),
      api.metadata.fileProperties(id!),
      api.metadata.colorAnalysis(id!),
    ])
      .then(([img, tg, storedFaces, ex, fp, ca]) => {
        setImage(img)
        setTags(tg)
        setExif(ex)
        setFileProps(fp)
        setColorAnalysis(ca)
        setFaces(storedFaces)
      })
      .catch((e) => reportError(e))
      .finally(() => setLoading(false))
  }, [id])

  const runFaceDetection = async () => {
    if (!image) return
    setFaceLoading(true)
    try {
      const detected = await api.face.detect(image.file_path, {
        confidence_threshold: 0.5,
        max_faces: 50,
      })
      setFaces(detected)
      setSelectedFace(null)
      setMatchResults([])
    } catch (e) {
      reportError(e)
    } finally {
      setFaceLoading(false)
    }
  }

  const runFaceMatch = async () => {
    if (!selectedFace) return
    setFaceLoading(true)
    try {
      const matches = await api.face.search(selectedFace.embedding || [], 0.6)
      setMatchResults(matches)
    } catch (e) {
      reportError(e)
    } finally {
      setFaceLoading(false)
    }
  }

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
                <div className="relative bg-deepvision-800 overflow-auto rounded-lg p-2 mb-4">
                  <div style={{ position: 'relative', width: '100%' }} className="inline-block">
                    <img
                      src={api.images.file(image.id)}
                      alt={image.original_filename}
                      style={{ width: image.width, height: image.height }}
                    />
                    {faces.length > 0 && (
                      <FaceOverlay
                        imageSrc={api.images.file(image.id)}
                        imageWidth={image.width}
                        imageHeight={image.height}
                        faces={faces}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={runFaceDetection}
                      disabled={faceLoading}
                      className="inline-flex items-center gap-2 bg-deepvision-600 hover:bg-deepvision-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
                    >
                      <Scan size={16} /> Detect faces
                    </button>
                    <button
                      onClick={runFaceMatch}
                      disabled={!selectedFace || faceLoading}
                      className="inline-flex items-center gap-2 bg-deepvision-600 hover:bg-deepvision-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
                    >
                      <Search size={16} /> Match face
                    </button>
                  </div>
                </div>
              <h2 className="text-white text-lg font-semibold">{image.original_filename}</h2>
              <p className="text-gray-400 text-sm mt-1">
                {formatBytes(image.size_bytes)} · {image.mime_type}
              </p>

              {faces.length > 0 && (
                <div className="mt-4 bg-deepvision-900 border border-deepvision-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Scan size={16} className="text-deepvision-400" /> Detected faces ({faces.length})
                  </h3>

                  {selectedFace && (
                    <div className="mb-3 text-sm">
                      <p className="text-gray-400">Selected</p>
                      <p className="text-white">Face #{selectedFace.id}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Confidence {(selectedFace.confidence ?? 0).toFixed(2)} · Gender: {selectedFace.gender ?? 'N/A'} · Age: {selectedFace.age_estimate ?? 'N/A'}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 max-h-64 overflow-auto">
                    {faces.map((face) => (
                      <button
                        key={face.id}
                        onClick={() => { setSelectedFace(face); setMatchResults([]) }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                          selectedFace?.id === face.id
                            ? 'bg-deepvision-700 text-white'
                            : 'bg-deepvision-800 text-gray-300 hover:bg-deepvision-700'
                        }`}
                      >
                        <span>Face #{face.id}</span>
                        <span className="text-xs text-gray-400">{(face.confidence ?? 0).toFixed(2)}</span>
                      </button>
                    ))}
                  </div>

                  {matchResults.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-deepvision-700">
                      <p className="text-gray-400 text-sm mb-2">Similar faces ({matchResults.length})</p>
                      <div className="grid grid-cols-2 gap-2">
                        {matchResults.map((m) => (
                          <button
                            key={m.image_id}
                            onClick={() => navigate(`/images/${m.image_id}`)}
                            className="text-left px-2 py-2 bg-deepvision-800 hover:bg-deepvision-700 rounded-lg"
                          >
                            <p className="text-white text-sm truncate">{m.filename}</p>
                            <p className="text-green-400 text-xs">{(m.confidence ?? 0).toFixed(2)}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                {typeof image.nsfw_score === 'number' && (
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
