import { useRef, useState, useCallback } from 'react'

interface Position {
  x: number
  y: number
}
interface SelectionRect {
  left: number
  top: number
  width: number
  height: number
}
interface Props {
  screenshotUrl: string
  onCapture: (croppedDataUrl: string) => void
  onCancel: () => void
}

export default function SnipOverlay({ screenshotUrl, onCapture, onCancel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [start, setStart] = useState<Position | null>(null)
  const [end, setEnd] = useState<Position | null>(null)
  const [mouse, setMouse] = useState<Position | null>(null)
  const [dragging, setDragging] = useState(false)

  const getPos = useCallback((e: React.MouseEvent): Position => {
    const rect = containerRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pos = getPos(e)
      setStart(pos)
      setEnd(pos)
      setDragging(true)
    },
    [getPos]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getPos(e)
      setMouse(pos)
      if (!dragging) return
      setEnd(pos)
    },
    [dragging, getPos]
  )

  const handleMouseLeave = useCallback(() => {
    setMouse(null)
  }, [])

  const handleMouseUp = useCallback(async () => {
    if (!dragging || !start || !end) return
    setDragging(false)

    const x = Math.min(start.x, end.x)
    const y = Math.min(start.y, end.y)
    const w = Math.abs(end.x - start.x)
    const h = Math.abs(end.y - start.y)

    if (w < 10 || h < 10) return

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.src = screenshotUrl
    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
    })
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h)
    onCapture(canvas.toDataURL('image/png'))
  }, [dragging, start, end, screenshotUrl, onCapture])

  const selectionRect: SelectionRect | null =
    start && end
      ? {
          left: Math.min(start.x, end.x),
          top: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y)
        }
      : null

  const CROSS_SIZE = 20

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        inset: 0,
        cursor: 'none',
        backgroundImage: `url(${screenshotUrl})`,
        backgroundSize: '100% 100%',
        userSelect: 'none'
      }}
    >
      {/* Dim overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          pointerEvents: 'none'
        }}
      />

      {/* Selection box */}
      {selectionRect && (
        <div
          style={{
            position: 'absolute',
            ...selectionRect,
            border: '2px solid #00d4ff',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
            background: 'transparent',
            pointerEvents: 'none'
          }}
        >
          {[
            { top: -4, left: -4 },
            { top: -4, right: -4 },
            { bottom: -4, left: -4 },
            { bottom: -4, right: -4 }
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 8,
                height: 8,
                background: '#00d4ff',
                borderRadius: '50%',
                ...pos
              }}
            />
          ))}
        </div>
      )}

      {/* Custom crosshair cursor */}
      {mouse && (
        <svg
          style={{
            position: 'absolute',
            left: mouse.x - CROSS_SIZE,
            top: mouse.y - CROSS_SIZE,
            width: CROSS_SIZE * 2,
            height: CROSS_SIZE * 2,
            pointerEvents: 'none',
            overflow: 'visible'
          }}
        >
          {/* Horizontal line */}
          <line
            x1={-9999}
            y1={CROSS_SIZE}
            x2={9999}
            y2={CROSS_SIZE}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1}
          />
          {/* Vertical line */}
          <line
            x1={CROSS_SIZE}
            y1={-9999}
            x2={CROSS_SIZE}
            y2={9999}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1}
          />
          {/* Center dot */}
          <circle cx={CROSS_SIZE} cy={CROSS_SIZE} r={3} fill="#00d4ff" />
        </svg>
      )}

      {/* Coordinates */}
      {mouse && (
        <div
          style={{
            position: 'absolute',
            left: mouse.x + 14,
            top: mouse.y + 14,
            background: 'rgba(0,0,0,0.7)',
            color: '#00d4ff',
            fontSize: 11,
            fontFamily: 'monospace',
            padding: '2px 7px',
            borderRadius: 4,
            pointerEvents: 'none'
          }}
        >
          {Math.round(mouse.x)}, {Math.round(mouse.y)}
        </div>
      )}

      {/* Hint */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)',
          color: '#00d4ff',
          padding: '6px 20px',
          borderRadius: 20,
          fontSize: 13,
          fontFamily: 'monospace',
          letterSpacing: 1,
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        ✦ Drag to select area &nbsp;•&nbsp; ESC to cancel
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        style={{
          position: 'absolute',
          top: 12,
          right: 16,
          background: 'rgba(220,50,50,0.9)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '6px 16px',
          cursor: 'none',
          fontSize: 13,
          fontFamily: 'monospace'
        }}
      >
        ✕ Cancel
      </button>
    </div>
  )
}
