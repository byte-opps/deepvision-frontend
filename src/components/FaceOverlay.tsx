import { useRef, useEffect } from 'react'
import type { FaceDetection } from '../types'

interface FaceOverlayProps {
  imageSrc: string
  imageWidth: number
  imageHeight: number
  faces: FaceDetection[]
}

export default function FaceOverlay({ imageSrc, imageWidth, imageHeight, faces }: FaceOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    faces.forEach((face) => {
      const b = face.bbox || {}
      const sx = canvas.width / imageWidth
      const sy = canvas.height / imageHeight
      const x = (b.x ?? 0) * sx
      const y = (b.y ?? 0) * sy
      const w = (b.width ?? 0) * sx
      const h = (b.height ?? 0) * sy

      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, w, h)

      ctx.fillStyle = '#38bdf8'
      ctx.font = '12px sans-serif'
      ctx.fillText(`Face ${face.id} · ${(face.confidence ?? 0).toFixed(2)}`, x, y - 4)

      if (face.gender) {
        ctx.fillText(face.gender, x + w, y - 4)
      }
    })
  }, [faces, imageSrc, imageWidth, imageHeight])

  return (
    <canvas
      ref={canvasRef}
      width={imageWidth}
      height={imageHeight}
      className="absolute top-0 left-0 pointer-events-none"
    />
  )
}
