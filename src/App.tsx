import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './stores/auth'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ImageGallery from './pages/ImageGallery'
import ImageDetail from './pages/ImageDetail'
import MPIProfiles from './pages/MPIMain'
import MPIDetail from './pages/MPIDetail'
import MPICases from './pages/MPICases'
import AIServices from './pages/AIServices'
import Tagging from './pages/Tagging'
import MetadataBrowser from './pages/MetadataBrowser'
import TaskQueue from './pages/TaskQueue'
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/images"
            element={
              <ProtectedRoute>
                <ImageGallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/images/:id"
            element={
              <ProtectedRoute>
                <ImageDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mpi"
            element={
              <ProtectedRoute>
                <MPIProfiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mpi/:id"
            element={
              <ProtectedRoute>
                <MPIDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mpi/cases"
            element={
              <ProtectedRoute>
                <MPICases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AIServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tags"
            element={
              <ProtectedRoute>
                <Tagging />
              </ProtectedRoute>
            }
          />
          <Route
            path="/metadata"
            element={
              <ProtectedRoute>
                <MetadataBrowser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TaskQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
