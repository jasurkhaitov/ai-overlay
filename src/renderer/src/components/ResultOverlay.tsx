import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { BoxPosition } from '../App'

interface Props {
  result: string | null
  loading: boolean
  error: string | null
  boxPos: BoxPosition
}

const BOX_HEIGHT = 46
const GAP = 8

export default function ResultOverlay({ result, loading, error, boxPos }: Props) {
  const [copied, setCopied] = useState(false)

  if (!loading && !result && !error) return null

  return (
    <div
      className="fixed z-99998 pointer-events-auto flex flex-col rounded-md overflow-hidden"
      style={{
        left: boxPos.x,
        top: boxPos.y + BOX_HEIGHT + GAP,
        width: 620,
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
            AI Answer
          </span>
        </div>

        {result && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(result)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className="text-xs rounded-md transition-all cursor-pointer"
            style={{
              background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.05)',
              padding: '4px 12px',
              border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'var(--color-border)'}`,
              color: copied ? 'var(--color-green)' : 'var(--color-text-1)',
              fontFamily: 'var(--font-sans)'
            }}
          >
            {copied ? '✓ Copied' : '⎘ Copy all'}
          </button>
        )}
      </div>

      <div className="overflow-y-auto chat-scroll flex-1" style={{ padding: 16 }}>
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
              Analyzing screenshot...
            </span>
            <style>{`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); opacity: 0.3; }
                50% { transform: translateY(-5px); opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {error && (
          <div
            className="text-sm p-3 rounded-lg"
            style={{
              padding: '10px 16px',
              color: 'var(--color-red)',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)'
            }}
          >
            ⚠ {error}
          </div>
        )}

        {result && (
          <>
            <style style={{ color: 'var(--color-text-1)' }}>{`
              .md h1, .md h2, .md h3 {
                color: var(--color-text-1);
                font-family: var(--font-sans);
                font-weight: 700;
                margin: 16px 0 8px;
              }
              .md h1 { font-size: 17px; }
              .md h2 {
                font-size: 15px;
                padding-bottom: 6px;
                border-bottom: 1px solid var(--color-border);
              }
              .md h3 { font-size: 13px; color: var(--color-text-1); }
              .md p { margin: 4px 0; color: var(--color-text-1); font-size: 10px; line-height: 1.8; }
              .md ul, .md ol { padding-left: 20px; margin: 6px 0; }
              .md li { color: var(--color-text-1); font-size: 14px; line-height: 1.8; margin: 2px 0; }
              .md strong { color: var(--color-text-1); font-weight: 700; }
              .md em { color: var(--color-text-1); }
              .md code {
                background: var(--color-primary-dim);
                border: 1px solid var(--color-primary-border);
                border-radius: 4px;
                padding: 1px 6px;
                font-size: 12px;
                color: var(--color-primary);
                font-family: 'JetBrains Mono', monospace;
              }
              .md blockquote {
                border-left: 3px solid var(--color-primary);
                margin: 8px 0;
                padding: 4px 12px;
                color: var(--color-text-1);
                font-style: italic;
              }
              .md a { color: var(--color-primary); text-decoration: underline; }
              .md table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 13px; }
              .md th, .md td {
                border: 1px solid var(--color-border-md);
                padding: 6px 12px;
                color: var(--color-text-1);
              }
              .md th {
                background: var(--color-primary-dim);
                color: var(--color-text-1);
                font-weight: 700;
              }
            `}</style>

            <ReactMarkdown
              components={{
                code({ className, children }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeStr = String(children).replace(/\n$/, '')
                  const isBlock = codeStr.includes('\n') || match

                  if (isBlock) {
                    const lang = match?.[1] || 'text'
                    return (
                      <div className="relative text-white my-3">
                        <div
                          className="flex items-center justify-between px-3 py-1.5 rounded-t-lg"
                          style={{
                            background: 'rgba(99,102,241,0.1)',
                            padding: '4px 12px',
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
                              const btn = e.currentTarget
                              navigator.clipboard.writeText(codeStr)
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
                            fontSize: 13,
                            lineHeight: 1.7,
                            background: 'rgba(0,0,0,0.55)',
                            border: '1px solid var(--color-border)',
                            padding: '14px 16px',
                            fontFamily: "'JetBrains Mono', monospace"
                          }}
                        >
                          {codeStr}
                        </SyntaxHighlighter>
                      </div>
                    )
                  }

                  return (
                    <code
                      style={{
                        background: 'var(--color-primary-dim)',
                        border: '1px solid var(--color-primary-border)',
                        borderRadius: 4,
                        padding: '1px 6px',
                        fontSize: 12,
                        color: 'var(--color-primary)',
                        fontFamily: "'JetBrains Mono', monospace"
                      }}
                    >
                      {children}
                    </code>
                  )
                }
              }}
            >
              {result}
            </ReactMarkdown>
          </>
        )}
      </div>
    </div>
  )
}
