import { Rnd } from 'react-rnd'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import './Window.css'
import { getIconForNode } from '../utils/iconUtils'
import type { FSNode } from '../data/fs'

export interface WindowProps {
  id: string
  title: string
  node?: FSNode
  initial: { x: number; y: number; width: number; height: number }
  zIndex: number
  onFocus?: (id: string) => void
  onClose?: (id: string) => void
  onMinimize?: (id: string) => void
  children?: ReactNode
}

const Window = ({ id, title, node, initial, zIndex, onFocus, onClose, onMinimize, children }: WindowProps) => {
  const [pos, setPos] = useState<{ x: number; y: number }>(() => ({ x: initial.x, y: initial.y }))
  const [size, setSize] = useState<{ width: number | string; height: number | string }>(() => ({ width: initial.width, height: initial.height }))
  const [maximized, setMaximized] = useState(false)
  const prevRect = useRef<{ pos: { x: number; y: number }; size: { width: number; height: number } } | null>(null)

  const handleMaximizeToggle = () => {
    if (!maximized) {
      // store current rect
      prevRect.current = { pos: { ...pos }, size: { width: size.width as number, height: size.height as number } }
      setPos({ x: 0, y: 0 })
      setSize({ width: window.innerWidth, height: window.innerHeight - 40 })
      setMaximized(true)
    } else if (prevRect.current) {
      setPos(prevRect.current.pos)
      setSize(prevRect.current.size)
      setMaximized(false)
    }
  }

  return (
    <Rnd
      position={pos}
      size={size}
      minWidth={200}
      minHeight={150}
      dragHandleClassName="window-titlebar"
      bounds="parent"
      style={{ zIndex, position: 'absolute' }}
      onMouseDown={() => onFocus?.(id)}
      onDragStop={(_, d) => setPos({ x: d.x, y: d.y })}
      onResizeStop={(_, __, ___, delta, newPos) => {
        setSize({ width: (size.width as number) + delta.width, height: (size.height as number) + delta.height })
        setPos({ x: newPos.x, y: newPos.y })
      }}
      enableResizing={!maximized}
      disableDragging={maximized}
    >
      <div 
        className="window"
        {...(node?.type === 'folder' ? { 'data-window-folder-id': node.id } : {})}
      >
        <div className="window-titlebar" onDoubleClick={handleMaximizeToggle}>
          <span className="window-title">
            {node && <img src={getIconForNode(node)} alt="" className="window-title-icon" style={{filter: 'none', mixBlendMode: 'normal'}} />}
            {title}
          </span>
          <div className="window-controls">
            <button
              className="window-btn"
              title="Minimize"
              onClick={() => onMinimize?.(id)}
            >
              _
            </button>
            <button
              className="window-btn"
              title={maximized ? 'Restore' : 'Maximize'}
              onClick={handleMaximizeToggle}
            >
              {maximized ? '❐' : '□'}
            </button>
            <button className="window-btn" title="Close" onClick={() => onClose?.(id)}>
              ×
            </button>
          </div>
        </div>
        <div
          className={"window-content" + (node?.type === 'folder' ? ' folder-view' : '')}
          onMouseDown={(e) => {
            // Only left mouse button clears selection
            if (e.button === 0) {
              window.dispatchEvent(new Event('clearSelection'))
            }
          }}
        >
          {children}
        </div>
      </div>
    </Rnd>
  )
}

export default Window 