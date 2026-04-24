import { useState } from 'react'

interface Props {
  onKeySet: () => void
  onSkip: () => void
}

export default function ApiKeyGate({ onKeySet, onSkip }: Props) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const handleSubmit = async () => {
    if (!key.trim().startsWith('AIza')) {
      setError('Invalid key — Gemini keys start with "AIza"')
      return
    }
    setLoading(true)
    setError('')
    try {
      await window.electronAPI.setApiKey(key.trim())
      onKeySet()
    } catch {
      setError('Failed to save key')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(20px)',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <div
        style={{
          width: 420,
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: 28,
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          position: 'relative'
        }}
      >
        <button
          onClick={onSkip}
          title="Skip for now"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            lineHeight: 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.1)'
            e.currentTarget.style.color = 'var(--color-red)'
            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-3)'
            e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
        >
          ✕
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--color-primary-dim)',
                border: '1px solid var(--color-primary-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)' }}>
              Enter your Gemini API Key
            </span>
          </div>
          <p
            style={{ fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6, marginLeft: 42 }}
          >
            Your key is stored locally and never leaves your device.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : 'var(--color-border)'}`,
              borderRadius: 8,
              padding: '10px 12px'
            }}
          >
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={(e) => {
                setKey(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="AIzaSy..."
              autoFocus
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text-1)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                letterSpacing: '0.05em'
              }}
            />
            <button
              onClick={() => setShow((v) => !v)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-3)',
                cursor: 'pointer',
                padding: 2
              }}
            >
              {show ? (
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
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {error && (
            <span style={{ fontSize: 11, color: 'var(--color-red)', paddingLeft: 4 }}>
              ⚠ {error}
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!key.trim() || loading}
          style={{
            padding: '11px 0',
            borderRadius: 8,
            border: 'none',
            background:
              key.trim() && !loading ? 'var(--color-primary)' : 'var(--color-primary-dim)',
            color: key.trim() && !loading ? '#fff' : 'var(--color-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 600,
            cursor: key.trim() && !loading ? 'pointer' : 'not-allowed',
            opacity: !key.trim() ? 0.5 : 1,
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          {loading ? 'Saving…' : 'Save & Continue →'}
        </button>

        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--color-text-3)',
            marginTop: -10
          }}
        >
          You can add your key later via{' '}
          <kbd
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--color-border)',
              borderRadius: 4,
              padding: '1px 5px',
              fontSize: 10
            }}
          >
            Ctrl+,
          </kbd>{' '}
          Settings
        </p>
      </div>
    </div>
  )
}
