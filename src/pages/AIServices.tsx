import { useState, useRef } from 'react'
import Layout from '../components/Layout'
import { reportError } from '../lib/error'
import { api } from '../lib/api'
import type { FaceDetection, FaceMatch } from '../types'
import { Sparkles, Eye, Search, Upload } from 'lucide-react'

export default function AIServices() {
  const [caption, setCaption] = useState('')
  const [faces, setFaces] = useState<FaceDetection[]>([])
  const [matches, setMatches] = useState<FaceMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [detectLoading, setDetectLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('caption')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleCaption = async () => {
    setLoading(true)
    try {
      // Placeholder - actual implementation would need an image ID
      setCaption('AI caption generation is ready. Select an image to generate a caption.')
    } catch (err) {
      reportError(err)
    }
    setLoading(false)
  }

  const handleFileDetect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      reportError(new Error('Please select an image file.'))
      return
    }
    setDetectLoading(true)
    setFaces([])
    try {
      const uploaded = await api.images.upload(file)
      const imageId = uploaded?.id ?? ''
      if (!imageId) {
        reportError(new Error('Upload returned no image id.'))
        return
      }
      const detected = await api.face.detect(imageId, {
        confidence_threshold: 0.5,
        max_faces: 20,
      })
      setFaces(detected)
    } catch (err) {
      reportError(err)
    } finally {
      setDetectLoading(false)
    }
  }

  const parseEmbedding = (raw: string): number[] =>
    raw
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n))

  const handleMatch = async () => {
    const raw = (document.querySelector('input[type="text"]') as HTMLInputElement | null)?.value ?? ''
    const embedding = parseEmbedding(raw)
    if (embedding.length === 0) {
      reportError(new Error('Paste a non-empty embedding vector (comma-separated numbers).'))
      return
    }
    setMatchLoading(true)
    try {
      const result = await api.face.search(embedding, 0.6)
      setMatches(result)
    } catch (err) {
      reportError(err)
    } finally {
      setMatchLoading(false)
    }
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">AI Services</h1>

        {/* Tabs */}
        <div className="flex border-b border-deepvision-700 mb-6">
          {['caption', 'face-detect', 'face-match'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-deepvision-800 transition-colors"
            >
              {tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-6">
          {activeTab === 'caption' && (
            <div>
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-deepvision-400" />
                Caption Generation
              </h2>
              <p className="text-gray-400 mb-4">Generate AI-powered captions for images. Select an image and click generate.</p>
              <button onClick={handleCaption} disabled={loading} className="bg-deepvision-600 hover:bg-deepvision-500 text-white px-6 py-2 rounded-lg disabled:opacity-50">
                {loading ? 'Generating...' : 'Generate Caption'}
              </button>
              {caption && (
                <div className="mt-4 p-4 bg-deepvision-800 rounded-lg">
                  <p className="text-white">{caption}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'face-detect' && (
            <div>
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Eye size={20} className="text-deepvision-400" />
                Face Detection
              </h2>
              <p className="text-gray-400 mb-4">Select an image to detect faces, bounding boxes, and confidence scores.</p>
              <div className="space-y-3">
                <label className="flex items-center gap-2 bg-deepvision-800 rounded-lg px-3 py-2 cursor-pointer">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-gray-300">Select image…</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileDetect(file)
                    }}
                  />
                </label>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={detectLoading}
                  className="bg-deepvision-600 hover:bg-deepvision-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
                >
                  {detectLoading ? 'Detecting...' : 'Detect Faces'}
                </button>
                <div className="space-y-2 max-h-80 overflow-auto">
                  {faces.map((face) => (
                    <div key={face.id} className="bg-deepvision-800 rounded-lg px-3 py-2 flex justify-between">
                      <span className="text-white">Face #{face.id}</span>
                      <span className="text-gray-400">{(face.confidence || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  {faces.length === 0 && <p className="text-gray-400">No faces detected yet.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'face-match' && (
            <div>
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Search size={20} className="text-deepvision-400" />
                Face Matching
              </h2>
              <p className="text-gray-400 mb-4">Match a face against stored faces using an embedding vector (comma-separated).</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-deepvision-800 rounded-lg px-3 py-2">
                  <Search size={18} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Paste embedding vector (1,0.5,−0.2,…)..."
                    className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleMatch}
                  disabled={matchLoading}
                  className="bg-deepvision-600 hover:bg-deepvision-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
                >
                  {matchLoading ? 'Searching...' : 'Search'}
                </button>
                <div className="space-y-2 max-h-80 overflow-auto">
                  {matches.map((m) => (
                    <div key={m.image_id} className="bg-deepvision-800 rounded-lg px-3 py-2 flex justify-between">
                      <span className="text-white truncate">{m.filename}</span>
                      <span className="text-green-400">{(m.confidence ?? 0).toFixed(2)}</span>
                    </div>
                  ))}
                  {matches.length === 0 && <p className="text-gray-400">No matches found.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
