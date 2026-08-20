import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import type { MpiProfile } from '../types'
import { Plus, Trash2 } from 'lucide-react'

export default function MPIProfiles() {
  const [profiles, setProfiles] = useState<MpiProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [codename, setCodename] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    api.mpi.profiles().then(setProfiles).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.mpi.createProfile({ name, codename, description })
    setName('')
    setCodename('')
    setDescription('')
    setShowForm(false)
    await api.mpi.profiles().then(setProfiles)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this profile?')) {
      await api.mpi.deleteProfile(id)
      await api.mpi.profiles().then(setProfiles)
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">MPI Profiles</h1>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-deepvision-600 hover:bg-deepvision-500 text-white px-4 py-2 rounded-lg">
            <Plus size={18} />
            <span>{showForm ? 'Cancel' : 'New Profile'}</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4 mb-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-deepvision-800 border border-deepvision-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-deepvision-500" required />
              <input placeholder="Codename" value={codename} onChange={(e) => setCodename(e.target.value)} className="w-full bg-deepvision-800 border border-deepvision-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-deepvision-500" />
              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-deepvision-800 border border-deepvision-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-deepvision-500" rows={2} />
              <button type="submit" className="bg-deepvision-600 hover:bg-deepvision-500 text-white px-4 py-2 rounded-lg">Create</button>
            </form>
          </div>
        )}

        <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-deepvision-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Name</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Codename</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Description</th>
                <th className="px-4 py-3 text-right text-sm text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deepvision-700">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-deepvision-800/50">
                  <td className="px-4 py-3 text-white">{p.name}</td>
                  <td className="px-4 py-3 text-gray-400">{p.codename || '-'}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{p.description || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
