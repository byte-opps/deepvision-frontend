import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { reportError } from '../lib/error'
import type { Tag } from '../types'
import { Plus, Trash2, Search } from 'lucide-react'

export default function Tagging() {
  const [tags, setTags] = useState<Tag[]>([])
  const [newTag, setNewTag] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    // Load tags for first image (placeholder)
    api.tags.list('1')
      .then(setTags)
      .catch((e) => reportError(e))
  }, [])

  const handleAdd = async () => {
    if (!newTag.trim()) return
    await api.tags.addTag('1', newTag.trim())
    setNewTag('')
    await api.tags.list('1').then(setTags)
  }

  const handleDelete = async (tagName: string) => {
    await api.tags.deleteTag('1', tagName)
    await api.tags.list('1').then(setTags)
  }

  const filteredTags = tags.filter(t => t.tag_name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Tag Manager</h1>

        {/* Add tag */}
        <div className="flex items-center gap-2 mb-6 bg-deepvision-900 border border-deepvision-700 rounded-lg px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Add new tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
          />
          <button onClick={handleAdd} className="bg-deepvision-600 hover:bg-deepvision-500 text-white px-4 py-2 rounded-lg">
            <Plus size={18} />
          </button>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Filter tags..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-sm bg-deepvision-900 border border-deepvision-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-deepvision-500"
          />
        </div>

        {/* Tags list */}
        <div className="flex flex-wrap gap-2">
          {filteredTags.map((tag) => (
            <span key={tag.tag_name} className="flex items-center gap-2 px-3 py-1.5 bg-deepvision-700 rounded-lg">
              <span className="text-white">{tag.tag_name}</span>
              <button onClick={() => handleDelete(tag.tag_name)} className="text-gray-400 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </span>
          ))}
          {tags.length === 0 && <p className="text-gray-400">No tags yet. Add one above.</p>}
        </div>
      </div>
    </Layout>
  )
}
