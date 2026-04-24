import { useState, useCallback, useEffect } from 'react'
import SnipOverlay from './components/SnipOverlay'
import NavigatorBox from './components/NavigatorBox'
import ResultOverlay from './components/ResultOverlay'
import SettingsPanel from './components/SettingsPanel'
import ChatPanel from './components/ChatPanel'
import { useGemini } from './hooks/useGemini'
import { useKeyboard } from './hooks/useKeyboard'
import ApiKeyGate from './components/ApiKeyGate'

type AppMode = 'idle' | 'snipping'

export interface BoxPosition {
  x: number
  y: number
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('idle')
  const [visible, setVisible] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [language, setLanguage] = useState('Python')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [hasKey, setHasKey] = useState<boolean | null>(null)
  const [boxPos, setBoxPos] = useState<BoxPosition>({
    x: window.innerWidth / 2 - 160,
    y: 16
  })

  const { result, loading, error, analyze, clear } = useGemini(language)

  const handleScreenshot = useCallback(async () => {
    try {
      const dataUrl = await window.electronAPI.captureScreen()
      setScreenshot(dataUrl)
      setMode('snipping')
    } catch (err) {
      console.error('Screenshot failed:', err)
    }
  }, [])

  const handleCropped = useCallback((cropped: string) => {
    setCroppedImage(cropped)
    setMode('idle')
  }, [])

  const handleSendToAI = useCallback(async () => {
    if (!croppedImage) return
    const base64 = croppedImage.split(',')[1]
    await analyze(base64)
  }, [croppedImage, analyze])

  const handleClear = useCallback(() => {
    clear()
    setCroppedImage(null)
    setScreenshot(null)
  }, [clear])

  const handleCancel = useCallback(() => {
    setMode('idle')
    setScreenshot(null)
    window.electronAPI.hideOverlay()
  }, [])

  const handleToggleChat = useCallback(() => {
    setShowChat((v) => !v)
    setShowSettings(false)
  }, [])

  const handleToggleSettings = useCallback(() => {
    setShowSettings((v) => !v)
    setShowChat(false)
  }, [])

  useKeyboard(
    {
      onScreenshot: handleScreenshot,
      onToggleVisible: () => setVisible((v) => !v),
      onSendToAI: handleSendToAI,
      onClear: handleClear,
      onSettings: handleToggleSettings,
      onNavigate: (dir) => {
        const STEP = 60
        setBoxPos((p) => ({
          x:
            dir === 'left'
              ? Math.max(0, p.x - STEP)
              : dir === 'right'
                ? Math.min(window.innerWidth - 320, p.x + STEP)
                : p.x,
          y:
            dir === 'up'
              ? Math.max(0, p.y - STEP)
              : dir === 'down'
                ? Math.min(window.innerHeight - 60, p.y + STEP)
                : p.y
        }))
      }
    },
    mode !== 'snipping'
  )

  useEffect(() => {
    if (result) {
      setShowChat(false)
      setShowSettings(false)
    }
  }, [result])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        handleToggleChat()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleToggleChat])

  useEffect(() => {
    if (loading) {
      setShowChat(false)
    }
  }, [loading])

  useEffect(() => {
    let last = true

    const onMouseMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const isInteractive =
        el !== null &&
        el !== document.documentElement &&
        el !== document.body &&
        el !== document.getElementById('root')

      if (isInteractive !== !last) {
        last = !isInteractive
        window.electronAPI.setIgnoreMouseEvents(last)
      }
    }

    window.addEventListener('mousemove', onMouseMove)

    window.electronAPI.onEscPressed(() => {
      if (mode === 'snipping') {
        setMode('idle')
        setScreenshot(null)
      } else if (showChat) {
        setShowChat(false)
      } else if (showSettings) {
        setShowSettings(false)
      } else {
        setVisible((v) => !v)
      }
    })

    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [mode, showChat, showSettings])

  useEffect(() => {
    window.electronAPI.hasApiKey().then(setHasKey)
    window.electronAPI.onAppShown(() => {
      setVisible(true)
    })
  }, [])

  if (hasKey === null) return null

  if (!hasKey) {
    return (
      <ApiKeyGate
        onKeySet={() => setHasKey(true)}
        onSkip={() => setHasKey(true)}
      />
    )
  }

  if (mode === 'snipping' && screenshot) {
    return (
      <SnipOverlay screenshotUrl={screenshot} onCapture={handleCropped} onCancel={handleCancel} />
    )
  }

  if (!visible) return null

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99990 }}>
      <NavigatorBox
        pos={boxPos}
        onPosChange={setBoxPos}
        onScreenshot={handleScreenshot}
        onSend={handleSendToAI}
        onToggleVisible={() => setVisible(false)}
        onSettings={handleToggleSettings}
        onClear={handleClear}
        onChat={handleToggleChat}
        hasScreenshot={!!croppedImage}
        loading={loading}
        chatActive={showChat}
      />

      {!showChat && (
        <ResultOverlay result={result} loading={loading} error={error} boxPos={boxPos} />
      )}

      {showSettings && (
        <SettingsPanel
          language={language}
          onLanguageChange={setLanguage}
          onClose={() => setShowSettings(false)}
          boxPos={boxPos}
        />
      )}

      {showChat && <ChatPanel boxPos={boxPos} onClose={() => setShowChat(false)} />}
    </div>
  )
}
