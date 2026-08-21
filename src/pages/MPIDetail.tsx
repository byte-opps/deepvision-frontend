import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { reportError } from '../lib/error'
import type { MpiProfile, MpiBodyPart, MpiIntelligence } from '../types'
import { User, MapPin, Calendar, Target } from 'lucide-react'

export default function MPIDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<MpiProfile | null>(null)
  const [bodyParts, setBodyParts] = useState<MpiBodyPart[]>([])
  const [intelligence, setIntelligence] = useState<MpiIntelligence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.mpi.profile(id!), api.mpi.bodyParts(id!), api.mpi.intelligence(id!)])
      .then(([p, bp, intel]) => {
        setProfile(p)
        setBodyParts(bp)
        setIntelligence(intel)
      })
      .catch((e) => reportError(e))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>
  if (!profile) return <div className="p-8 text-gray-400">Profile not found</div>

  return (
    <Layout>
      <div className="p-8">
        <button onClick={() => navigate('/mpi')} className="text-gray-400 hover:text-white mb-4">
          ← Back to Profiles
        </button>

        <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">{profile.name}</h1>
          {profile.codename && <p className="text-deepvision-400 mb-1">Codename: {profile.codename}</p>}
          {profile.description && <p className="text-gray-400">{profile.description}</p>}
          {profile.confidence_score !== undefined && (
            <p className="text-gray-500 mt-2">Confidence: {profile.confidence_score}%</p>
          )}
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Target size={16} /> Body Parts
            </h3>
            <div className="space-y-2">
              {bodyParts.map((bp) => (
                <div key={bp.id} className="flex items-center justify-between bg-deepvision-800 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-white">{bp.body_part}</p>
                    {bp.description && <p className="text-gray-400 text-sm">{bp.description}</p>}
                  </div>
                </div>
              ))}
              {bodyParts.length === 0 && <p className="text-gray-400">No body parts recorded</p>}
            </div>
          </div>

          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Calendar size={16} /> Intelligence
            </h3>
            <div className="space-y-2">
              {intelligence.map((intel) => (
                <div key={intel.id} className="bg-deepvision-800 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <MapPin size={14} /> {intel.source}
                  </div>
                  <p className="text-white">{intel.summary}</p>
                  <p className="text-gray-500 text-xs mt-1">{intel.date}</p>
                </div>
              ))}
              {intelligence.length === 0 && <p className="text-gray-400">No intelligence records</p>}
            </div>
          </div>

          <div className="bg-deepvision-900 border border-deepvision-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <User size={16} /> Faces
            </h3>
            <p className="text-gray-400">Face detection and linking will be available in the next release.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
