import { useEffect } from 'react'
import type { BoxPosition } from '../App'

interface Props {
  pos: BoxPosition
  onPosChange: (pos: BoxPosition) => void
  onScreenshot: () => void
  onSend: () => void
  onToggleVisible: () => void
  onSettings: () => void
  onClear: () => void
  onChat: () => void
  hasScreenshot: boolean
  loading: boolean
  chatActive: boolean
}

const BOX_WIDTH = 600

export default function NavigatorBox({
  pos,
  onPosChange,
  onScreenshot,
  onSend,
  onToggleVisible,
  onSettings,
  onClear,
  onChat,
  chatActive,
  hasScreenshot,
  loading
}: Props) {
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const STEP = 60
      const dir = e.detail
      onPosChange({
        x:
          dir === 'left'
            ? Math.max(0, pos.x - STEP)
            : dir === 'right'
              ? Math.min(window.innerWidth - BOX_WIDTH, pos.x + STEP)
              : pos.x,
        y:
          dir === 'up'
            ? Math.max(0, pos.y - STEP)
            : dir === 'down'
              ? Math.min(window.innerHeight - 60, pos.y + STEP)
              : pos.y
      })
    }
    window.addEventListener('navigate-box', handler as EventListener)
    return () => window.removeEventListener('navigate-box', handler as EventListener)
  }, [pos, onPosChange])

  const handleDragStart = (e: React.MouseEvent) => {
    const startX = e.clientX - pos.x
    const startY = e.clientY - pos.y
    const onMove = (ev: MouseEvent) =>
      onPosChange({
        x: Math.max(0, Math.min(window.innerWidth - BOX_WIDTH, ev.clientX - startX)),
        y: Math.max(0, Math.min(window.innerHeight - 60, ev.clientY - startY))
      })
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      onMouseDown={handleDragStart}
      className="fixed z-99999 p-5 pointer-events-auto flex items-center justify-between rounded-md cursor-grab select-none"
      style={{
        left: pos.x,
        top: pos.y,
        padding: '6px 12px',
        width: BOX_WIDTH,
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border-md)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.6)'
      }}
    >
      <IconBtn title="Move with Cursor">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-hand-icon lucide-hand"
        >
          <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
          <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      </IconBtn>

      <Divider />

      <NavBtn label="Start Over" hotkey="H" onClick={onScreenshot} disabled={loading} />

      <Divider />

      <NavBtn
        label={loading ? 'Analyzing...' : 'Solve'}
        hotkey="↵"
        onClick={onSend}
        disabled={!hasScreenshot || loading}
      />

      <Divider />

      <NavBtn label="Show / Hide" hotkey="Alt + B" onClick={onToggleVisible} />

      <Divider />

      <IconBtn title="Chat (Ctrl+K)" onClick={onChat} active={chatActive}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </IconBtn>

      <Divider />

      <IconBtn title="Settings (Ctrl+,)" onClick={onSettings}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-settings-icon lucide-settings"
        >
          <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </IconBtn>

      <IconBtn title="Clear (Ctrl+R)" onClick={onClear}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-trash2-icon lucide-trash-2"
        >
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </IconBtn>

      <Divider />
      
      <IconBtn title="Quit app" onClick={() => window.electronAPI.quitApp()}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </IconBtn>
    </div>
  )
}

function NavBtn({
  label,
  hotkey,
  onClick,
  disabled,
  accent
}: {
  label: string
  hotkey: string
  onClick: () => void
  disabled?: boolean
  accent?: boolean
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled}
      className="flex items-center gap-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: accent ? 'var(--color-primary-dim)' : 'transparent',
        border: accent ? '1px solid var(--color-primary-border)' : '1px solid transparent',
        color: accent ? 'var(--color-primary)' : 'var(--color-text-2)',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <span>{label}</span>
      <kbd
        className="rounded text-sm"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-3)',
          fontFamily: 'monospace',
          padding: '4px 4px'
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-command-icon lucide-command"
        >
          <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
        </svg>
      </kbd>
      <kbd
        className="rounded text-sm"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-3)',
          fontFamily: 'monospace',
          padding: '1px 5px'
        }}
      >
        {hotkey}
      </kbd>
    </button>
  )
}

function IconBtn({
  children,
  onClick,
  title,
  active
}: {
  children: React.ReactNode
  onClick?: () => void
  title: string
  active?: boolean
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer"
      style={{
        background: active ? 'var(--color-primary-dim)' : 'transparent',
        border: `1px solid ${active ? 'var(--color-primary-border)' : 'var(--color-border)'}`,
        color: active ? 'var(--color-primary)' : 'var(--color-text-3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-primary-dim)'
        e.currentTarget.style.color = 'var(--color-primary)'
        e.currentTarget.style.borderColor = 'var(--color-primary-border)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active ? 'var(--color-primary-dim)' : 'transparent'
        e.currentTarget.style.color = active ? 'var(--color-primary)' : 'var(--color-text-3)'
        e.currentTarget.style.borderColor = active
          ? 'var(--color-primary-border)'
          : 'var(--color-border)'
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />
}
