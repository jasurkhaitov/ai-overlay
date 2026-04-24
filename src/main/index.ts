import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  screen,
  desktopCapturer,
  Tray,
  Menu,
  nativeImage
} from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { https } from 'follow-redirects'
import Store from 'electron-store'

const store = new Store()

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}

let overlayWindow: BrowserWindow | null = null
let resultWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isOverlayVisible = true

interface ChatMessage {
  role: 'user' | 'model'
  parts: [{ text: string }]
}
const chatHistory: ChatMessage[] = []

app.on('second-instance', () => {
  if (overlayWindow) {
    overlayWindow.show()
    overlayWindow.focus()
    isOverlayVisible = true
  }
})

function getApiKey(): string {
  return (store.get('geminiApiKey') as string) || process.env.GEMINI_API_KEY || ''
}

function geminiRequest(body: string, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.error) return reject(new Error(json.error.message))
          resolve(json.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response.')
        } catch {
          reject(new Error('Failed to parse: ' + data.slice(0, 200)))
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function createTray(): void {
  const icon = nativeImage.createFromPath('resources/icon.ico').resize({ width: 16, height: 16 })

  tray = new Tray(icon)

  const menu = Menu.buildFromTemplate([
    {
      label: 'Show / Hide',
      click: () => {
        if (isOverlayVisible) {
          overlayWindow?.hide()
        } else {
          overlayWindow?.show()
          overlayWindow?.focus()
          overlayWindow?.webContents.send('app-shown')
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        if (!isOverlayVisible) {
          overlayWindow?.show()
          overlayWindow?.focus()
          isOverlayVisible = true
        }
        overlayWindow?.webContents.send('open-settings')
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.exit(0)
    }
  ])

  tray.setToolTip('AI Overlay')
  tray.setContextMenu(menu)

  tray.on('click', () => {
    if (isOverlayVisible) {
      overlayWindow?.hide()
    } else {
      overlayWindow?.show()
      overlayWindow?.focus()
      overlayWindow?.webContents.send('app-shown')
    }
  })
}

function createOverlayWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    fullscreenable: false,
    show: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  overlayWindow.setContentProtection(true)
  overlayWindow.setIgnoreMouseEvents(true, { forward: true })

  if (process.platform === 'darwin') {
    app.dock?.hide()
  }

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    overlayWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    overlayWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  overlayWindow.on('hide', () => {
    isOverlayVisible = false
  })
  overlayWindow.on('show', () => {
    isOverlayVisible = true
  })
}

function createResultWindow(): void {
  resultWindow = new BrowserWindow({
    width: 520,
    height: 640,
    frame: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  resultWindow.setContentProtection(true)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    resultWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '?mode=result')
  } else {
    resultWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      query: { mode: 'result' }
    })
  }

  resultWindow.on('close', (e) => {
    e.preventDefault()
    resultWindow?.hide()
  })
}

app.setName('System Helper')

app.whenReady().then(() => {
  createOverlayWindow()
  createResultWindow()
  createTray()

  globalShortcut.register('CommandOrControl+Alt+B', () => {
    if (!overlayWindow) return
    if (isOverlayVisible) {
      overlayWindow.hide()
    } else {
      overlayWindow.show()
      overlayWindow.focus()
      overlayWindow.webContents.send('app-shown')
    }
  })

  globalShortcut.register('Escape', () => {
    overlayWindow?.webContents.send('esc-pressed')
  })

  ipcMain.on('set-ignore-mouse', (_event, ignore: boolean) => {
    overlayWindow?.setIgnoreMouseEvents(ignore, { forward: true })
  })

  ipcMain.handle('get-api-key', () => {
    const key = (store.get('geminiApiKey') as string) || ''
    return key ? key.slice(0, 8) + '••••••••••••••••' + key.slice(-4) : ''
  })

  ipcMain.handle('set-api-key', (_e, key: string) => {
    store.set('geminiApiKey', key.trim())
  })

  ipcMain.handle('delete-api-key', () => {
    store.delete('geminiApiKey')
  })

  ipcMain.handle('has-api-key', () => {
    return getApiKey().length > 0
  })

  ipcMain.handle('capture-screen', async (): Promise<string> => {
    overlayWindow?.hide()
    await new Promise((r) => setTimeout(r, 150))
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width, height }
    })
    const dataUrl = sources[0]?.thumbnail.toDataURL() ?? ''
    overlayWindow?.show()
    overlayWindow?.focus()
    return dataUrl
  })

  ipcMain.on('show-result', (_event, text: string) => {
    overlayWindow?.hide()
    resultWindow?.show()
    resultWindow?.webContents.send('display-result', text)
  })

  ipcMain.handle(
    'query-gemini',
    async (_event, base64Image: string, language?: string): Promise<string> => {
      const key = getApiKey()
      const path = `/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`

      const prompt = `You are an expert assistant analyzing a screenshot. Follow these rules strictly:

1. **Coding problem** (LeetCode, HackerRank, competitive programming, etc.):
   - Return the solution code in ${language || 'Python'} first inside a code block
   - Then explain the approach, time & space complexity clearly

2. **Quiz or multiple choice question**:
   - Give the correct answer directly
   - Then explain why it's correct in detail

3. **General question or topic**:
   - Think through it and give a clear, thorough answer with explanation

4. **No question visible**:
   - Briefly describe what you see in the screenshot

Be concise but complete. Do not add unnecessary preamble.`

      const body = JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/png', data: base64Image } }
            ]
          }
        ]
      })

      return geminiRequest(body, path)
    }
  )

  ipcMain.handle('chat-message', async (_e, userMessage: string): Promise<string> => {
    const key = getApiKey()
    const path = `/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`

    chatHistory.push({ role: 'user', parts: [{ text: userMessage }] })

    const body = JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: `You are a razor-sharp exam assistant. The user is in an active exam or test — every second counts.

RULES:
- Answer in the SAME language the user writes in (Uzbek → Uzbek, English → English, Russian → Russian)
- Be ULTRA concise — no intros, no "Great question!", no filler
- Lead with the answer FIRST, explain after only if needed
- For code: output the code block IMMEDIATELY, no preamble
- For math: show the result first, then formula if needed
- For MCQ/quiz: state the correct option letter + answer in one line, then one sentence why
- For definitions: one sharp sentence max
- For multi-step problems: numbered steps only, no prose padding
- Never say "I", "Sure", "Of course", "Certainly", "Here is", "Here's", "Let me"
- Never repeat the question back
- If something is off-topic or not study-related, reply: "Focus."

FORMAT:
- Use markdown only when it helps (code blocks, bullet points, bold key terms)
- Short answers: plain text, no markdown
- Code: always use fenced code blocks with language tag`
          }
        ]
      },
      contents: chatHistory
    })

    const reply = await geminiRequest(body, path)
    chatHistory.push({ role: 'model', parts: [{ text: reply }] })
    return reply
  })

  ipcMain.handle('clear-chat', () => {
    chatHistory.length = 0
  })

  ipcMain.handle('quit-app', () => app.exit(0))
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {})
