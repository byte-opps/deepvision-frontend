import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { reportError } from '../lib/error'
import type { Image } from '../types'
import { Search } from 'lucide-react'

export default function MetadataBrowser() {
  const [images, setImages] = useState<Image[]>([])
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [activeTab, setActiveTab] = useState('exif')
  const [exif, setExif] = useState<Record<string, any>>({})
  const [fileProps, setFileProps] = useState<Record<string, any>>({})
  const [colorAnalysis, setColorAnalysis] = useState<Record<string, any>>({})

  useEffect(() => {
    api.images.list().then(setImages).catch((e) => reportError(e))
  }, [])

  useEffect(() => {
    if (selectedImage) {
      Promise.all([
        api.metadata.exif(selectedImage.id),
        api.metadata.fileProperties(selectedImage.id),
        api.metadata.colorAnalysis(selectedImage.id),
      ])
        .then(([ex, fp, ca]) => {
          setExif(ex)
          setFileProps(fp)
          setColorAnalysis(ca)
        })
        .catch((e) => reportError(e))
    }
  }, [selectedImage])

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Metadata Browser</h1>

        {/* Image selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 bg-deepvision-900 border border-deepvision-700 rounded-lg px-4 py-3">
            <Search size={18} className="text-gray-400" />
            <select
              value={selectedImage?.id || ''}
              onChange={(e) => {
                const img = images.find(i => i.id === e.target.value)
                setSelectedImage(img || null)
              }}
              className="flex-1 bg-transparent text-white focus:outline-none"
            >
              <option value="">Select an image...</option>
              {images.map(img => (
                <option key={img.id} value={img.id}>{img.original_filename}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedImage && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-deepvision-700">
              {['exif', 'file', 'color'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-deepvision-800 transition-colors"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-6">
              {activeTab === 'exif' && (
                <pre className="text-sm text-gray-300 bg-deepvision-800 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(exif, null, 2)}
                </pre>
              )}
              {activeTab === 'file' && (
                <pre className="text-sm text-gray-300 bg-deepvision-800 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(fileProps, null, 2)}
                </pre>
              )}
              {activeTab === 'color' && (
                <pre className="text-sm text-gray-300 bg-deepvision-800 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(colorAnalysis, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

        {!selectedImage && (
          <div className="text-center py-12">
            <p className="text-gray-400">Select an image to view its metadata</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
