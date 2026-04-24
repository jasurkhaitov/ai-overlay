import { useState, useCallback } from 'react'

export function useGemini(language: string) {
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(
    async (base64: string) => {
      setLoading(true)
      setError(null)
      setResult(null)

      try {
        const raw = await window.electronAPI.queryGemini(base64, language)
        setResult(raw)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    },
    [language]
  )

  const clear = useCallback(() => {
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  return { result, loading, error, analyze, clear }
}
