import type {
  User,
  TokenPair,
  Image,
  CaptionResult,
  FaceDetection,
  FaceMatch,
  MpiProfile,
  MpiBodyPart,
  MpiIntelligence,
  MpiCase,
  Tag,
  Task,
  TaskStats,
  ModuleInfo,
  ErrorReport,
} from '../types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8076'

import { reportError, callerFromStack } from './error'

type RequestOptions = RequestInit & { contentType?: string }

async function request<T>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const contentType = options?.contentType
  const headers: Record<string, string> = contentType
    ? { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    : { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }))
    const apiErr = new ApiError(
      extractDetail(error) || 'Request failed',
      res.status
    )
    // Relay API failures to the backend for investigation.
    reportError(apiErr, { endpoint: path, component: callerFromStack(apiErr.stack || '') })
    throw apiErr
  }
  try {
    const data = await res.json()
    return data
  } catch {
    // Empty body (e.g. 204 No Content) — nothing to parse.
    return undefined as unknown as T
  }
}

export const api = {
  auth: {
    login: (data: { username: string; password: string }) =>
      request<TokenPair>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    register: (data: { username: string; password: string; email: string }) =>
      request<TokenPair>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<User>('/api/v1/auth/me'),
  },
  images: {
    list: (_params?: Record<string, any>) =>
      request<Image[]>('/api/v1/images', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    get: (id: string) => request<Image>(`/api/v1/images/${id}`),
    delete: (id: string) =>
      request<void>(`/api/v1/images/${id}`, { method: 'DELETE' }),
    file: (id: string) => `${API_BASE}/api/v1/images/${id}/file`,
    upload: (file: File) =>
      request<Image>(`/api/v1/images/`, {
        method: 'POST',
        contentType: 'multipart/form-data',
        body: file,
      }),
  },
  ai: {
    caption: (id: string) =>
      request<CaptionResult>(`/api/v1/ai/caption/${id}`),
    face: (id: string) =>
      request<FaceDetection[]>(`/api/v1/ai/face/${id}`),
    faceMatch: (data: { embedding: string }) =>
      request<{ matches: any[] }>(`/api/v1/ai/face-match`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  face: {
    detect: (
      imagePath: string,
      opts?: { confidence_threshold?: number; max_faces?: number }
    ) =>
      request<FaceDetection[]>("/api/v1/modules/face_detection/detect", {
        method: "POST",
        body: JSON.stringify({ image_path: imagePath, ...opts }),
      }),
    search: (embedding: number[], threshold?: number) =>
      request<FaceMatch[]>("/api/v1/modules/face_detection/search", {
        method: "POST",
        body: JSON.stringify({ reference_embedding: embedding, confidence_threshold: threshold }),
      }),
  },
  mpi: {
    profiles: () => request<MpiProfile[]>('/api/v1/mpi/profiles'),
    profile: (id: string) => request<MpiProfile>(`/api/v1/mpi/profiles/${id}`),
    createProfile: (data: Partial<MpiProfile>) =>
      request<MpiProfile>('/api/v1/mpi/profiles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteProfile: (id: string) =>
      request<void>(`/api/v1/mpi/profiles/${id}`, { method: 'DELETE' }),
    updateProfile: (id: string, data: Partial<MpiProfile>) =>
      request<MpiProfile>(`/api/v1/mpi/profiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    bodyParts: (mpiId: string) =>
      request<MpiBodyPart[]>(`/api/v1/mpi/profiles/${mpiId}/bp`),
    intelligence: (mpiId: string) =>
      request<MpiIntelligence[]>(`/api/v1/mpi/profiles/${mpiId}/intel`),
    faces: (mpiId: string) =>
      request<FaceDetection[]>(`/api/v1/mpi/profiles/${mpiId}/faces`),
    cases: () => request<MpiCase[]>('/api/v1/mpi/cases'),
    case: (id: string) => request<MpiCase>(`/api/v1/mpi/cases/${id}`),
    createCase: (data: { name: string; description?: string }) =>
      request<MpiCase>('/api/v1/mpi/cases', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteCase: (id: string) =>
      request<void>(`/api/v1/mpi/cases/${id}`, { method: 'DELETE' }),
    caseMembers: (caseId: string) =>
      request<MpiProfile[]>(`/api/v1/mpi/cases/${caseId}/members`),
    addMember: (caseId: string, mpiId: string) =>
      request<void>(`/api/v1/mpi/cases/${caseId}/members/${mpiId}`, {
        method: 'POST',
      }),
    removeMember: (caseId: string, mpiId: string) =>
      request<void>(`/api/v1/mpi/cases/${caseId}/members/${mpiId}`, {
        method: 'DELETE',
      }),
  },
  tags: {
    list: (imageId: string) =>
      request<Tag[]>(`/api/v1/tags/${imageId}/tags`),
    addTag: (imageId: string, tagName: string) =>
      request<Tag>(`/api/v1/tags/${imageId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tag_name: tagName }),
      }),
    deleteTag: (imageId: string, tagName: string) =>
      request<void>(`/api/v1/tags/${imageId}/tags/${tagName}`, {
        method: 'DELETE',
      }),
  },
  metadata: {
    exif: (id: string) =>
      request<Record<string, any>>(`/api/v1/metadata/${id}/exif`),
    fileProperties: (id: string) =>
      request<Record<string, any>>(`/api/v1/metadata/${id}/file_properties`),
    colorAnalysis: (id: string) =>
      request<Record<string, any>>(`/api/v1/metadata/${id}/color_analysis`),
    filenameAnalysis: (id: string) =>
      request<Record<string, any>>(`/api/v1/metadata/${id}/filename_analysis`),
  },
  tasks: {
    list: () => request<Task[]>('/api/v1/tasks'),
    stats: () => request<TaskStats>('/api/v1/tasks/stats'),
    get: (id: string) => request<Task>(`/api/v1/tasks/${id}`),
    run: () =>
      request<Task>('/api/v1/tasks/run', { method: 'POST' }),
    delete: (id: string) =>
      request<void>(`/api/v1/tasks/${id}`, { method: 'DELETE' }),
  },
  services: {
    status: () =>
      request<Record<string, { status: string; active: boolean }>>('/api/v1/services/status'),
    start: (service?: string) =>
      request<Record<string, { ok: boolean; error: string }>>(
        '/api/v1/services/start' + (service ? '?service=' + service : ''),
        { method: 'POST' }
      ),
    stop: (service?: string) =>
      request<Record<string, { ok: boolean; error: string }>>(
        '/api/v1/services/stop' + (service ? '?service=' + service : ''),
        { method: 'POST' }
      ),
    restart: (service?: string) =>
      request<Record<string, { ok: boolean; error: string }>>(
        '/api/v1/services/restart' + (service ? '?service=' + service : ''),
        { method: 'POST' }
      ),
  },
  modules: {
    list: () => request<ModuleInfo[]>('/api/v1/modules'),
    schema: () => request<ModuleInfo[]>('/api/v1/modules/schema'),
    enable: (name: string) =>
      request<{ status: string }>(`/api/v1/modules/${name}/enable`, {
        method: 'POST',
      }),
    disable: (name: string) =>
      request<{ status: string }>(`/api/v1/modules/${name}/disable`, {
        method: 'POST',
      }),
    run: (name: string, data: Record<string, any>) =>
      request<any>(`/api/v1/modules/${name}/run`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    stop: (name: string) =>
      request<{ status: string }>(`/api/v1/modules/${name}/stop`, {
        method: 'POST',
      }),
    jobs: (name: string) =>
      request<Record<string, any>[]>(`/api/v1/modules/${name}/jobs`),
  },
  feedback: {
    errors: {
      list: (limit = 100, offset = 0) =>
        request<{ count: number; reports: ErrorReport[] }>(
          `/api/v1/feedback/errors?limit=${limit}&offset=${offset}`
        ),
    },
  },
}

function extractDetail(error: any): string {
  if (!error) return 'Request failed'
  if (Array.isArray(error.detail)) {
    return error.detail
      .map((e: any) => e.msg || e.message || 'Request failed')
      .join('; ')
  }
  if (typeof error.detail === 'string') return error.detail
  if (typeof error.message === 'string') return error.message
  return 'Request failed'
}

export class ApiError extends Error {
  status: number
  detail: string
  constructor(detail: string, status: number) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}
