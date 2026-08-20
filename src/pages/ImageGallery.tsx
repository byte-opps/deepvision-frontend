import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import type { Image } from '../types'
import { Search, Upload, Filter } from 'lucide-react'

export default function ImageGallery() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.images.list({ search: search || undefined })
      .then(setImages)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search])

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Image Gallery</h1>
          <button className="flex items-center gap-2 bg-deepvision-600 hover:bg-deepvision-500 text-white px-4 py-2 rounded-lg">
            <Upload size={18} />
            <span>Upload</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-deepvision-900 border border-deepvision-700 rounded-lg px-4 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 focus:outline-none w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-deepvision-800 hover:bg-deepvision-700 text-gray-300 px-4 py-2 rounded-lg border border-deepvision-700">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((img) => (
              <a
                key={img.id}
                href={`/images/${img.id}`}
                className="group block bg-deepvision-900 border border-deepvision-700 rounded-lg overflow-hidden hover:border-deepvision-500 transition-colors"
              >
                <div className="aspect-square bg-deepvision-800 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">Image</span>
                </div>
                <div className="p-2">
                  <p className="text-sm text-white truncate">{img.original_filename}</p>
                  <p className="text-xs text-gray-500">{new Date(img.uploaded_at).toLocaleDateString()}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
