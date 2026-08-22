export interface User {
  id: string
  username: string
  email?: string
}

export interface TokenPair {
  access_token: string
  token_type: 'bearer'
}

export interface Image {
  id: string
  original_filename: string
  folder_name: string
  file_path: string
  width: number
  height: number
  size_bytes: number
  mime_type: string
  uploaded_at: string
  nsfw_score?: number
  severity_level?: string
  face_count?: number
  caption?: string
  tags?: string[]
}

export interface Tag {
  tag_name: string
  is_ai_generated: boolean
  created_at: string
}

export interface FaceDetection {
  id: string
  bbox: { x: number; y: number; width: number; height: number }
  confidence: number
  landmarks?: Record<string, any>
  age_estimate?: string | null
  gender?: string
  embedding?: number[]
}

export interface FaceMatch {
  id: string
  image_id: string
  filename: string
  confidence: number
  bbox: { x: number; y: number; width: number; height: number }
  age_estimate?: string | null
  gender?: string
}

export interface CaptionResult {
  caption: string
  nsfw_analysis?: {
    is_adult: boolean
    nsfw_score: number
    severity_level: string
    categories: Record<string, { score: number }>
  }
}

export interface MpiProfile {
  id: string
  name: string
  codename?: string
  description?: string
  confidence_score?: number
}

export interface MpiCase {
  id: string
  name: string
  description?: string
  members: MpiProfile[]
}

export interface MpiBodyPart {
  id: string
  body_part: string
  description?: string
}

export interface MpiIntelligence {
  id: string
  date: string
  source: string
  summary: string
  confidence_score?: number
}

export interface Task {
  id: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  data: Record<string, any>
  progress: number
  created_at: string
  updated_at: string
}

export interface TaskStats {
  total: number
  pending: number
  running: number
  completed: number
  failed: number
}

export interface ModuleInfo {
  name: string
  display_name: string
  description: string
  type: string
  icon: string
  color: string
  version: string
  enabled: boolean
  is_async: boolean
  supports_batch: boolean
}

export interface ApiError extends Error {
  status: number
  detail: string
}

export interface ErrorReport {
  id: number
  type: string
  message: string
  stack: string
  component: string | null
  action: string | null
  endpoint: string | null
  payload: string | null
  created_at: string
}
