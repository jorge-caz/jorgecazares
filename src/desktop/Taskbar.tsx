import { useEffect, useState, useRef } from 'react'
import type { FSNode } from '../data/fs'
import './Taskbar.css'
import { getIconForNode } from '../utils/iconUtils'
import { useFS } from '../context'
import { showBlueScreen } from '../utils/blueScreen'

export interface TaskbarProps {
  windows: { 
    windowId: string; 
    node: FSNode; 
    minimized: boolean; 
    z: number;
    initialPos: { x: number; y: number; width: number; height: number }
  }[]
  activeId: string | null
  onTaskClick: (windowId: string) => void
}

interface StartResult {
  id: string
  name: string
  node: FSNode
}

const Taskbar = ({ windows, activeId, onTaskClick }: TaskbarProps) => {
  const { fs } = useFS()
  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const getDate = () => {
    const d = new Date()
    const mm = d.getMonth() + 1 // 1-12
    const dd = d.getDate() // 1-31
    const yy = d.getFullYear()
    return `${mm}/${dd}/${yy}`
  }

  const [time, setTime] = useState<string>(getTime())
  const [dateStr, setDateStr] = useState<string>(getDate())
  const [startOpen, setStartOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Small toast message for status icons
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const searchResults: StartResult[] = (() => {
    if (!query.trim()) return []
    const results: StartResult[] = []
    const stack: FSNode[] = [fs]
    while (stack.length) {
      const node = stack.pop() as FSNode
      if (node.name.toLowerCase().includes(query.toLowerCase())) {
        results.push({ id: node.id, name: node.name, node })
      }
      if (node.type === 'folder') stack.push(...node.children)
    }
    return results.slice(0, 20) // limit
  })()

  useEffect(() => {
    const id = setInterval(() => {
      setTime(getTime())
      setDateStr(getDate())
    }, 60_000) // update every minute
    return () => clearInterval(id)
  }, [])

  // Close start menu on outside click
  useEffect(() => {
    if (!startOpen) return
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element)?.closest('.start-menu') && !(e.target as Element)?.closest('.start-button')) {
        setStartOpen(false)
      }
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [startOpen])

  // Close search dropdown on outside click
  useEffect(() => {
    if (!searchOpen) return
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element)?.closest('.search-dropdown') && !(e.target as Element)?.closest('.task-search')) {
        setSearchOpen(false)
      }
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [searchOpen])

  const openNode = (node: FSNode) => {
    window.dispatchEvent(new CustomEvent('openNode', { detail: node }))
    setStartOpen(false)
    setQuery('')
  }

  // Pinned items for start menu
  const pinnedIds = ['projects', 'about', 'resume', 'github']
  const pinnedNodes: FSNode[] = []
  const collectNode = (id: string) => {
    const stack: FSNode[] = [fs]
    while (stack.length) {
      const n = stack.pop() as FSNode
      if (n.id === id) {
        pinnedNodes.push(n)
        return
      }
      if (n.type === 'folder') stack.push(...n.children)
    }
  }
  pinnedIds.forEach(collectNode)

  const wifiEgg = () => {
    showToast('Connected to: JORGE-NET (Excellent signal)')
  }

  const batteryEgg = () => {
    showToast('Battery: 100% (Plugged in)')
  }

  return (
    <div className="taskbar">
      <button className="start-button" onClick={() => setStartOpen((o) => !o)} title="Start">
        <img src="/icons/start.svg" alt="start" className="start-logo" />
      </button>

      {startOpen && (
        <div className="start-menu" ref={menuRef}>
          <div className="pinned-grid">
            {pinnedNodes.map((n) => (
              <div key={n.id} className="pinned-item" onClick={() => openNode(n)} title={n.name}>
                <img src={getIconForNode(n)} alt="icon" />
                <span>{n.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="task-search-wrapper">
        <input
          type="text"
          className="task-search"
          placeholder="Search..."
          value={query}
          ref={searchRef}
          onFocus={() => setSearchOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!searchOpen) setSearchOpen(true)
          }}
        />
        {searchOpen && query.trim() && (
          <div className="search-dropdown">
            {searchResults.length === 0 ? (
              <div className="start-noresults">No results</div>
            ) : (
              searchResults.map((r) => (
                <div key={r.id} className="start-result" onClick={() => openNode(r.node)}>
                  <img src={getIconForNode(r.node)} alt="icon" />
                  <span>{r.name}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="task-buttons">
        {windows.map((w) => (
          <button
            key={w.windowId}
            className={
              'task-btn' + (activeId === w.windowId && !w.minimized ? ' active' : '') + (w.minimized ? ' minimized' : '')
            }
            onClick={() => onTaskClick(w.windowId)}
            title={w.node.name}
          >
            <img src={getIconForNode(w.node)} alt="icon" />
          </button>
        ))}
      </div>

      <div className="taskbar-right">
        <div className="status-icons">
          <button className="status-btn" onClick={wifiEgg} title="WiFi">
            <img src="/icons/wifi.svg" alt="wifi" />
          </button>
          <button className="status-btn" onClick={batteryEgg} title="Battery">
            <img src="/icons/battery.svg" alt="battery" />
          </button>
        </div>
        <div className="clock-date">
          <span className="clock">{time}</span>
          <span className="date">{dateStr}</span>
        </div>
      </div>

      {toast && (
        <div className="status-toast">{toast}</div>
      )}
    </div>
  )
}

export default Taskbar 