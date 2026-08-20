import { useState } from 'react'
import Layout from '../components/Layout'
import { Sparkles, Eye, Search } from 'lucide-react'

export default function AIServices() {
  const [caption, setCaption] = useState('')
  const [faces, _setFaces] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('caption')

  const handleCaption = async () => {
    setLoading(true)
    try {
      // Placeholder - actual implementation would need an image ID
      setCaption('AI caption generation is ready. Select an image to generate a caption.')
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
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
              <p className="text-gray-400 mb-4">Detect faces in images with bounding boxes and confidence scores.</p>
              <div className="space-y-2">
                {faces.map((face, i) => (
                  <div key={i} className="bg-deepvision-800 rounded-lg px-3 py-2 flex justify-between">
                    <span className="text-white">Face #{i + 1}</span>
                    <span className="text-gray-400">{(face.confidence || 0).toFixed(2)}</span>
                  </div>
                ))}
                {faces.length === 0 && <p className="text-gray-400">Select an image to detect faces.</p>}
              </div>
            </div>
          )}

          {activeTab === 'face-match' && (
            <div>
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Search size={20} className="text-deepvision-400" />
                Face Matching
              </h2>
              <p className="text-gray-400 mb-4">Match a face against the database using an embedding vector.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-deepvision-800 rounded-lg px-3 py-2">
                  <Search size={18} className="text-gray-400" />
                  <input type="text" placeholder="Paste embedding vector..." className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none" />
                </div>
                <button className="bg-deepvision-600 hover:bg-deepvision-500 text-white px-4 py-2 rounded-lg">
                  Search
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
