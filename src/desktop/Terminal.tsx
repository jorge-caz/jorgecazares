import React, { useEffect, useRef, useState } from 'react'
import { useFS } from '../context'
import { getAbsolutePath, resolvePath } from '../utils/pathUtils'
import { cd, ls } from '../utils/fsCommands'
import type { FSNode } from '../data/fs'
import { showBlueScreen } from '../utils/blueScreen'

interface TerminalProps {
  cwd: string // initial working directory id
  onOpen?: (node: FSNode) => void
}

interface HistoryItem {
  prompt: string
  command: string
  output: string[]
}

const Terminal: React.FC<TerminalProps> = ({ cwd }) => {
  const { fs, add, move: moveNodeCtx, update: updateNodeCtx, remove: removeNodeCtx } = useFS()

  const [cwdId, setCwdId] = useState<string>(cwd)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [input, setInput] = useState('')
  const [colorPair, setColorPair] = useState('0a')
  const [historyNavIndex, setHistoryNavIndex] = useState<number | null>(null)
  const [draftBeforeNav, setDraftBeforeNav] = useState('')

  // Tab completion cycling state
  const [tabCycle, setTabCycle] = useState<{
    base: string // token base including trailing slash if any
    parentId: string // folder id we searched in
    candidates: FSNode[]
    idx: number
  } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const colorMap: Record<string, string> = {
    '0': '#000000', // Black
    '1': '#0000AA', // Blue
    '2': '#00AA00', // Green
    '3': '#00AAAA', // Aqua
    '4': '#AA0000', // Red
    '5': '#AA00AA', // Purple
    '6': '#AAAA00', // Yellow
    '7': '#AAAAAA', // White (dim)
    '8': '#555555', // Gray
    '9': '#5555FF', // Light Blue
    'a': '#55FF55', // Light Green
    'b': '#55FFFF', // Light Aqua
    'c': '#FF5555', // Light Red
    'd': '#FF55FF', // Light Purple
    'e': '#FFFF55', // Light Yellow
    'f': '#FFFFFF', // Bright White,
  }

  const bgColor = colorMap[colorPair[0]] ?? '#000000'
  const fgColor = colorMap[colorPair[1]] ?? '#55FF55'

  // Auto-scroll within the terminal pane when history updates (without affecting page scroll)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
    inputRef.current?.focus()
  }, [history])

  function getPrompt(folderId: string) {
    return `${getAbsolutePath(fs, folderId)}> `
  }

  const handleCommand = (raw: string) => {
    // reset navigation index
    setHistoryNavIndex(null)
    // reset completion state
    setTabCycle(null)
    const trimmed = raw.trim()
    if (!trimmed) return

    const args = trimmed.split(/\s+/)
    const cmd = args[0].toLowerCase()
    const rest = args.slice(1)

    let output: string[] = []

    switch (cmd) {
      case 'cd': {
        const targetPath = rest.length === 0 ? 'C:/' : rest.join(' ')
        const newCwd = rest.length === 0 ? 'root' : cd(fs, cwdId, targetPath)
        if (newCwd === cwdId) {
          output.push('The system cannot find the path specified.')
        } else {
          setCwdId(newCwd)
        }
        break
      }
      case 'ls': {
        const list = ls(fs, cwdId)
        output = list.map((n) => n.name + (n.type === 'folder' ? '/' : ''))
        if (output.length === 0) output.push('[empty]')
        break
      }
      case 'help': {
        output.push(
          'Available commands:',
          '  cd <path>      - change directory (no path = C:/)',
          '  ls <path>      - list contents',
          '  mkdir <path>   - create folder',
          '  mv <src> <dst> - move or rename',
          '  rm <path>      - delete file/folder (protected items show BSOD)',
          '  pwd            - print current directory',
          '  color <xy>     - set colors (x=background y=foreground)',
          '  help           - this message'
        )
        break
      }
      case 'mkdir': {
        if (rest.length === 0) {
          output.push('Usage: mkdir <path>')
          break
        }

        const rawPath = rest.join(' ')

        // Split into parent path and folder name
        const segments = rawPath.replace(/\\/g, '/').split('/')
        const newName = segments.pop() || ''
        const parentPath = segments.join('/') || '.'

        const parentNode = resolvePath(fs, cwdId, parentPath)
        if (!parentNode || parentNode.type !== 'folder') {
          output.push('The system cannot find the path specified.')
          break
        }

        // Ensure unique name
        let finalName = newName || 'New Folder'
        const existingNames = parentNode.children.map((c) => c.name)
        if (existingNames.includes(finalName)) {
          let idx = 2
          let candidate = `${finalName} (${idx})`
          while (existingNames.includes(candidate)) {
            idx++
            candidate = `${finalName} (${idx})`
          }
          finalName = candidate
        }

        const newFolder = {
          id: crypto.randomUUID(),
          name: finalName,
          type: 'folder' as const,
          children: []
        }

        add(parentNode.id, newFolder)
        output.push(`Directory "${finalName}" created.`)
        break
      }
      case 'mv': {
        if (rest.length < 2) {
          output.push('Usage: mv <source> <destination>')
          break
        }

        const [srcPath, destPath] = rest
        const srcNode = resolvePath(fs, cwdId, srcPath)
        if (!srcNode) {
          output.push('The system cannot find the file specified.')
          break
        }

        const destNode = resolvePath(fs, cwdId, destPath)

        if (destNode && destNode.type === 'folder') {
          // Move into existing folder
          moveNodeCtx(srcNode.id, destNode.id)
          output.push(`Moved "${srcNode.name}" into "${destNode.name}"`)
        } else {
          // Treat destPath as rename (possibly with path)
          const destSegments = destPath.replace(/\\/g, '/').split('/')
          const newName = destSegments.pop() || srcNode.name
          const parentPath = destSegments.join('/') || '.'

          const parentFolder = resolvePath(fs, cwdId, parentPath)
          if (!parentFolder || parentFolder.type !== 'folder') {
            output.push('The system cannot find the path specified.')
            break
          }

          // Move node if parent different
          if (parentFolder.id !== (resolvePath(fs, cwdId, '.') as any).id) {
            moveNodeCtx(srcNode.id, parentFolder.id)
          }

          // Rename if name changed
          if (newName && newName !== srcNode.name) {
            updateNodeCtx({ ...srcNode, name: newName })
          }

          output.push(`Moved/Renamed to "${newName}" in "${parentFolder.name}"`)
        }
        break
      }
      case 'color': {
        if (rest.length === 0) {
          setColorPair('0a')
          break
        }
        const code = rest[0].toLowerCase()
        if (/^[0-9a-f]{2}$/.test(code)) {
          setColorPair(code)
        } else {
          output.push('Usage: color XY  (each X and Y = 0-9 or A-F)')
        }
        break
      }
      case 'rm': {
        if (rest.length === 0) {
          output.push('Usage: rm <path>')
          break
        }

        const targetPath = rest.join(' ')
        const targetNode = resolvePath(fs, cwdId, targetPath)
        if (!targetNode) {
          output.push('The system cannot find the file specified.')
          break
        }

        if (targetNode.protected) {
          output.push('Cannot delete protected system item.')

          showBlueScreen(`
            <div style="text-align:center; max-width:600px;">
              <div style="font-size:64px;">:(</div>
              <br/>
              <div>Your PC ran into a problem and needs to restart.</div>
              <div>We are just collecting some error info</div>
              <br/>
              <div style="font-size:14px;">If you call tech support, give them this info:</div>
              <div style="font-size:14px; color:#4ade80;">STOP CODE: DONT_DELETE_SYSTEM32</div>
            </div>
          `)
          break
        }

        removeNodeCtx(targetNode.id)
        output.push(`Deleted "${targetNode.name}"`)        
        break
      }
      case 'pwd': {
        output.push(getAbsolutePath(fs, cwdId))
        break
      }
      default:
        output.push(`'${cmd}' is not recognized as an internal or external command.`)
    }

    setHistory((prev) => [
      ...prev,
      { prompt: getPrompt(cwdId), command: raw, output },
    ])
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    // History navigation ----------------
    if (e.key === 'ArrowUp') {
      if (history.length === 0) return
      e.preventDefault()
      if (historyNavIndex === null) {
        setDraftBeforeNav(input)
        setHistoryNavIndex(0)
        setInput(history[history.length - 1].command)
      } else if (historyNavIndex < history.length - 1) {
        const newIdx = historyNavIndex + 1
        setHistoryNavIndex(newIdx)
        setInput(history[history.length - 1 - newIdx].command)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      if (historyNavIndex === null) return
      e.preventDefault()
      if (historyNavIndex === 0) {
        setHistoryNavIndex(null)
        setInput(draftBeforeNav)
      } else {
        const newIdx = historyNavIndex - 1
        setHistoryNavIndex(newIdx)
        setInput(history[history.length - 1 - newIdx].command)
      }
      return
    }

    // Tab autocompletion -----------------
    if (e.key === 'Tab') {
      e.preventDefault()
      handleTabCompletion()
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const current = input
      setInput('')
      handleCommand(current)
    }
  }

  // ---------------- Tab completion logic ----------------

  const handleTabCompletion = () => {
    // If we have an active cycle and the input hasn't changed externally, advance.
    if (tabCycle) {
      const nextIdx = (tabCycle.idx + 1) % tabCycle.candidates.length
      const chosen = tabCycle.candidates[nextIdx]
      applyCompletion(tabCycle.base, chosen)
      setTabCycle({ ...tabCycle, idx: nextIdx })
      return
    }

    // Otherwise start a new completion session based on current input
    const tokens = input.split(/\s+/)
    if (tokens.length <= 1) return // nothing to complete

    const pathToken = tokens[tokens.length - 1]
    const lastSlash = pathToken.lastIndexOf('/')
    let base = ''
    let partial = pathToken
    if (lastSlash !== -1) {
      base = pathToken.slice(0, lastSlash + 1)
      partial = pathToken.slice(lastSlash + 1)
    }

    const baseForResolve = base === '' ? '.' : base.endsWith('/') ? base.slice(0, -1) : base
    const parent = resolvePath(fs, cwdId, baseForResolve)
    if (!parent || parent.type !== 'folder') return

    const matches = parent.children.filter((c) => c.name.toLowerCase().startsWith(partial.toLowerCase()))
    if (matches.length === 0) return

    // choose first candidate
    const chosen = matches[0]
    applyCompletion(base, chosen)
    if (matches.length > 1) {
      setTabCycle({ base, parentId: parent.id, candidates: matches, idx: 0 })
    }
  }

  const applyCompletion = (base: string, node: FSNode) => {
    const tokens = input.split(/\s+/)
    // Replace last token
    tokens[tokens.length - 1] = base + node.name + (node.type === 'folder' ? '/' : '')
    setInput(tokens.join(' '))
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => {
        e.preventDefault()
        inputRef.current?.focus()
      }}
      style={{
        background: bgColor,
        color: fgColor,
        width: '100%',
        height: '100%',
        padding: '12px',
        fontFamily: 'monospace',
        fontSize: 14,
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        cursor: 'text'
      }}
    >
      {history.map((h, idx) => (
        <div key={idx}>
          <div>
            <span>{h.prompt}</span>
            <span>{h.command}</span>
          </div>
          {h.output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      ))}
      {/* current input */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
        <span style={{ whiteSpace: 'pre' }}>{getPrompt(cwdId)}</span>
        <input
          style={{ background: 'transparent', border: 'none', color: fgColor, outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', flex: 1, minWidth: 0 }}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setTabCycle(null)
          }}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          autoFocus
        />
      </div>
    </div>
  )
}

export default Terminal 