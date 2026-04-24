import { Settings, X } from 'lucide-react'
import type { BoxPosition } from '../App'
import { useEffect, useState } from 'react'

interface Props {
  language: string
  onLanguageChange: (lang: string) => void
  onClose: () => void
  boxPos: BoxPosition
}

const LANGUAGES = [
  'Python',
  'TypeScript',
  'JavaScript',
  'Java',
  'C++',
  'Go',
  'Kotlin',
  'Rust',
  'C#',
  'Swift',
  'PHP',
  'C'
]
const BOX_HEIGHT = 40
const GAP = 8

const SHORTCUTS = [
  { key: 'Ctrl + H', desc: 'Take screenshot' },
  { key: 'Ctrl + Enter', desc: 'Send to AI' },
  { key: 'Ctrl + B', desc: 'Show / Hide' },
  { key: 'Ctrl + R', desc: 'Clear results' },
  { key: 'Ctrl + ,', desc: 'Settings' },
  { key: 'Ctrl + Alt + ↑/↓/←/→', desc: 'Move box' }
]

export default function SettingsPanel({ language, onLanguageChange, onClose, boxPos }: Props) {
  const [currentKey, setCurrentKey] = useState('')
  const [newKey, setNewKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.electronAPI.getApiKey().then(setCurrentKey)
  }, [])

  const handleSave = async () => {
    if (!newKey.trim()) return
    await window.electronAPI.setApiKey(newKey.trim())
    setCurrentKey(await window.electronAPI.getApiKey())
    setNewKey('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDelete = async () => {
    await window.electronAPI.deleteApiKey()
    setCurrentKey('')
  }

  return (
    <div
      className="fixed z-100000 pointer-events-auto rounded-md overflow-hidden"
      style={{
        left: boxPos.x,
        top: boxPos.y + BOX_HEIGHT + GAP,
        padding: '6px 12px',
        width: 480,
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border-md)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}
      >
        <span className="gap-2 text-sm flex items-center" style={{ color: 'var(--color-text-1)' }}>
          <Settings className="w-4 h-4" /> Settings
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-3)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div style={{ paddingTop: '5px', paddingBottom: '5px' }} className="flex flex-col gap-3">
        <div>
          <p
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: 'var(--color-text-3)' }}
          >
            Preferred Language
          </p>
          <div className="flex flex-wrap gap-2" style={{ marginTop: '5px' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className="rounded-lg text-xs font-semibold cursor-pointer transition-all"
                style={{
                  padding: '3px 8px',
                  background:
                    language === lang ? 'var(--color-primary-dim)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${language === lang ? 'var(--color-primary-border)' : 'var(--color-border)'}`,
                  color: language === lang ? 'var(--color-primary)' : 'var(--color-text-3)',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: 'var(--color-text-3)' }}
          >
            Keyboard Shortcuts
          </p>
          <div className="flex flex-col gap-1.5" style={{ marginTop: '5px' }}>
            {SHORTCUTS.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between rounded-md"
                style={{ background: 'rgba(255,255,255,0.03)', padding: '4px 8px' }}
              >
                <span className="text-xs" style={{ color: 'var(--color-text-2)' }}>
                  {s.desc}
                </span>
                <kbd
                  className="text-xs rounded-md"
                  style={{
                    padding: '2px 6px',
                    background: 'var(--color-primary-dim)',
                    border: '1px solid var(--color-primary-border)',
                    color: 'var(--color-primary)',
                    fontFamily: 'monospace'
                  }}
                >
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ paddingTop: '5px', paddingBottom: '5px' }}>
        <p
          className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: 'var(--color-text-3)', marginBottom: '5px' }}
        >
          Gemini Api Key
        </p>
        {currentKey && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              padding: '6px 10px',
              marginBottom: 8
            }}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-2)' }}>
              {currentKey}
            </span>
            <button
              onClick={handleDelete}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-red)',
                cursor: 'pointer',
                fontSize: 11
              }}
            >
              Remove
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder={currentKey ? 'Replace with new key…' : 'AIzaSy…'}
            type="password"
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              padding: '6px 10px',
              outline: 'none',
              color: 'var(--color-text-1)',
              fontFamily: 'monospace',
              fontSize: 12
            }}
          />
          <button
            onClick={handleSave}
            disabled={!newKey.trim()}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--color-primary-dim)',
              border: '1px solid var(--color-primary-border)',
              color: saved ? 'var(--color-green)' : 'var(--color-primary)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600
            }}
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
