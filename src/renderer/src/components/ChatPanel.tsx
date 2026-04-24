import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { BoxPosition } from '../App'
import { X } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  ts: number
}

interface Props {
  boxPos: BoxPosition
  onClose: () => void
}

const BOX_HEIGHT = 40
const GAP = 8

export default function ChatPanel({ boxPos, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text, ts: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await window.electronAPI.chatMessage(text)
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: reply,
        ts: Date.now()
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `⚠ Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        ts: Date.now()
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, loading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      className="fixed z-99998 pointer-events-auto flex flex-col rounded-md overflow-hidden"
      style={{
        left: boxPos.x,
        top: boxPos.y + BOX_HEIGHT + GAP,
        width: 620,
        minHeight: 400,
        maxHeight: 'calc(100vh - 300px)',
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        backdropFilter: 'blur(250px)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.7)',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <div
        className="flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 16px' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>
            Chat
          </span>
        </div>

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

      <div className="flex-1 chat-scroll overflow-y-auto" style={{ padding: '12px 16px' }}>
        {messages.length === 0 && !loading && (
          <div
            className="flex flex-col items-center justify-center h-full gap-3"
            style={{ margin: '60px' }}
          >
            <h2 className="text-2xl font-mono">Welcome nigga</h2>
            <div className="flex flex-col gap-1 font-mono text-green-500">
              <p>* quick assist</p>
              <p>* answer will not be stored</p>
              <p>* answers will be deleted after closing modal</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '10px',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.role === 'user' ? (
              <div
                className="text-sm rounded-md"
                style={{
                  padding: '4px 8px',
                  background: 'var(--color-primary-dim)',
                  border: '1px solid var(--color-primary-border)',
                  color: 'var(--color-text-1)',
                  maxWidth: '85%',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {msg.text}
              </div>
            ) : (
              <div style={{ maxWidth: '95%' }}>
                <MarkdownMessage content={msg.text} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 py-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: 'var(--color-primary)',
                  animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`
                }}
              />
            ))}
            <span className="text-sm" style={{ color: 'var(--color-text-1)' }}>
              Typing...
            </span>
            <style>{`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); opacity: 0.3; }
                50% { transform: translateY(-5px); opacity: 1; }
              }
            `}</style>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div
        className="shrink-0"
        style={{ borderTop: '1px solid var(--color-border)', padding: '12px' }}
      >
        <div
          className="relative flex flex-col rounded-xl overflow-hidden transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--color-border)',
            outline: 'none'
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary-border)'
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-primary-dim)'
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything…"
            rows={1}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-1)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              lineHeight: 1.6,
              resize: 'none',
              padding: '12px 14px 4px',
              maxHeight: 120,
              overflowY: 'auto',
              width: '100%'
            }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }}
          />

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between" style={{ padding: '6px 10px 8px' }}>
            {/* Left: hint */}
            <span
              className="text-xs font-mono select-none"
              style={{ color: 'var(--color-text-3)' }}
            >
              {loading ? (
                <span style={{ color: 'var(--color-primary)', opacity: 0.7 }}>● responding…</span>
              ) : input.trim() ? (
                <>
                  <kbd
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
                      padding: '1px 5px',
                      fontSize: 10,
                      marginRight: 4
                    }}
                  >
                    ↵
                  </kbd>
                  send
                  <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                  <kbd
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
                      padding: '1px 5px',
                      fontSize: 10,
                      marginRight: 4
                    }}
                  >
                    ⇧↵
                  </kbd>
                  newline
                </>
              ) : (
                'Ctrl+K to close'
              )}
            </span>

            {/* Right: send button */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                padding: '5px 12px',
                background:
                  input.trim() && !loading ? 'var(--color-primary)' : 'var(--color-primary-dim)',
                border: '1px solid var(--color-primary-border)',
                color: input.trim() && !loading ? '#fff' : 'var(--color-primary)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                if (!input.trim() || loading) return
                e.currentTarget.style.filter = 'brightness(1.15)'
                e.currentTarget.style.boxShadow = '0 0 12px var(--color-primary-dim)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = ''
                e.currentTarget.style.boxShadow = ''
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      border: '1.5px solid currentColor',
                      borderTopColor: 'transparent',
                      animation: 'spin 0.7s linear infinite'
                    }}
                  />
                  Thinking
                </>
              ) : (
                <>
                  Send
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        <style>{`
    @keyframes spin { to { transform: rotate(360deg); } }
  `}</style>
      </div>
    </div>
  )
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <>
      <style>{`
        .chat-md p { margin: 4px 0; color: var(--color-text-1); font-size: 13px; line-height: 1.75; }
        .chat-md h1,.chat-md h2,.chat-md h3 { color: var(--color-text-1); font-weight: 700; margin: 12px 0 6px; }
        .chat-md h1 { font-size: 16px; }
        .chat-md h2 { font-size: 14px; border-bottom: 1px solid var(--color-border); padding-bottom: 4px; }
        .chat-md h3 { font-size: 13px; }
        .chat-md ul,.chat-md ol { padding-left: 18px; margin: 4px 0; }
        .chat-md li { color: var(--color-text-1); font-size: 13px; line-height: 1.75; margin: 2px 0; }
        .chat-md strong { color: var(--color-text-1); font-weight: 700; }
        .chat-md em { color: var(--color-text-1); }
        .chat-md code { background: var(--color-primary-dim); border: 1px solid var(--color-primary-border); border-radius: 4px; padding: 1px 6px; font-size: 12px; color: var(--color-primary); font-family: 'JetBrains Mono', monospace; }
        .chat-md blockquote { border-left: 3px solid var(--color-primary); margin: 8px 0; padding: 4px 12px; color: var(--color-text-1); font-style: italic; }
        .chat-md a { color: var(--color-primary); text-decoration: underline; }
        .chat-md table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 12px; }
        .chat-md th,.chat-md td { border: 1px solid var(--color-border); padding: 5px 10px; color: var(--color-text-1); }
        .chat-md th { background: var(--color-primary-dim); font-weight: 700; }
      `}</style>
      <div
        className="chat-md rounded-md"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--color-border)',
          padding: '4px 8px'
        }}
      >
        <ReactMarkdown
          components={{
            code({ className, children }) {
              const match = /language-(\w+)/.exec(className || '')
              const codeStr = String(children).replace(/\n$/, '')
              const isBlock = codeStr.includes('\n') || match
              if (isBlock) {
                const lang = match?.[1] || 'text'
                return (
                  <div className="relative my-2">
                    <div
                      className="flex items-center justify-between px-3 py-1 rounded-t-lg"
                      style={{
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid var(--color-border)',
                        borderBottom: 'none'
                      }}
                    >
                      <span
                        className="text-xs font-mono font-semibold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {lang}
                      </span>
                      <button
                        className="text-xs rounded transition-all cursor-pointer"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-1)',
                          fontFamily: 'var(--font-sans)',
                          padding: '2px 8px'
                        }}
                        onClick={(e) => {
                          navigator.clipboard.writeText(codeStr)
                          const btn = e.currentTarget
                          btn.textContent = '✓ Copied'
                          btn.style.color = 'var(--color-green)'
                          setTimeout(() => {
                            btn.textContent = 'Copy'
                            btn.style.color = 'var(--color-text-1)'
                          }, 2000)
                        }}
                      >
                        Copy
                      </button>
                    </div>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={lang}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: '0 0 8px 8px',
                        fontSize: 12,
                        lineHeight: 1.65,
                        background: 'rgba(0,0,0,0.55)',
                        border: '1px solid var(--color-border)',
                        padding: '12px 14px',
                        fontFamily: "'JetBrains Mono', monospace"
                      }}
                    >
                      {codeStr}
                    </SyntaxHighlighter>
                  </div>
                )
              }
              return <code>{children}</code>
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </>
  )
}
