import './Desktop.css'
import Taskbar from './Taskbar'
import { useState, useRef, useEffect } from 'react'
import { useFS } from '../context'
import type { FSNode } from '../data/fs'
import { findNode, thisPcStructure } from '../data/fs'
import Window from './Window'
import Explorer from './Explorer'
import IconGrid from '../components/IconGrid'
import BrowserFrame from './BrowserFrame'
import AboutMe from '../pages/AboutMe'
import Resume from '../pages/Resume'
import PasswordDialog from './PasswordDialog'
import ErrorDialog from './ErrorDialog'
import ConfirmDeleteDialog from './ConfirmDeleteDialog'
import Terminal from './Terminal'

const Desktop = () => {
  const { fs } = useFS() // Get the file system to search for nodes

  const [windows, setWindows] = useState<{ 
    windowId: string; 
    node: FSNode; 
    z: number; 
    minimized: boolean;
    initialPos: { x: number; y: number; width: number; height: number }
  }[]>([])

  const desktopRef = useRef<HTMLDivElement>(null)

  // Listen to openNode events from Taskbar start menu
  useEffect(() => {
    const handler = (e: Event) => {
      const node = (e as CustomEvent).detail as FSNode
      if (node) openWindow(node)
    }
    window.addEventListener('openNode', handler as EventListener)
    return () => window.removeEventListener('openNode', handler as EventListener)
  }, [fs])

  const bringToFront = (windowId: string) => {
    setWindows((prev) => {
      const maxZ = prev.reduce((m, w) => Math.max(m, w.z), 0)
      return prev.map((w) => (w.windowId === windowId ? { ...w, z: maxZ + 1 } : w))
    })
  }

  const openWindow = (node: FSNode) => {
    // For executables, launch external link instead of opening a window
    if (node.type === 'exe' && (node as any).payload?.url) {
      window.open((node as any).payload.url, '_blank')
      return
    }
    
    setWindows((prev) => {
      // If already open, just bring to front
      const existing = prev.find((w) => w.node.id === node.id)
      if (existing) {
        bringToFront(existing.windowId)
        return prev
      }
      const maxZ = prev.reduce((m, w) => Math.max(m, w.z), 0)
      const windowId = crypto.randomUUID()
      
      // Calculate centered position with offset for multiple windows
      const windowWidth = 500
      const windowHeight = 400
      const baseX = (window.innerWidth - windowWidth) / 2
      const baseY = (window.innerHeight - windowHeight) / 2
      
      // Add offset based on number of existing windows
      const offset = prev.length * 30
      const centerX = baseX + offset
      const centerY = baseY + offset
      
      return [...prev, { 
        windowId, 
        node, 
        z: maxZ + 1, 
        minimized: false,
        initialPos: { x: centerX, y: centerY, width: windowWidth, height: windowHeight }
      }]
    })
  }

  const navigateWindow = (windowId: string, newFolderId: string) => {
    setWindows((prev) => prev.map((w) => {
      if (w.windowId === windowId) {
        // First try to find the node in the main file system
        let actualNode = findNode(fs, newFolderId)
        
        // If not found in main FS, try This PC structure
        if (!actualNode) {
          actualNode = findNode(thisPcStructure, newFolderId)
        }
        
        if (actualNode) {
          return { ...w, node: actualNode }
        } else {
          // Fallback for special cases like 'root' or 'desktop-folder'
          const fallbackNode: FSNode = {
            id: newFolderId,
            name: newFolderId === 'root' ? 'JorgeOS' : newFolderId === 'desktop-folder' ? 'Desktop' : newFolderId,
            type: 'folder',
            children: []
          }
          return { ...w, node: fallbackNode }
        }
      }
      return w
    }))
  }

  const closeWindow = (windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.windowId !== windowId))
  }

  const minimizeWindow = (windowId: string) => {
    setWindows((prev) => prev.map((w) => (w.windowId === windowId ? { ...w, minimized: true } : w)))
  }

  const toggleMinimize = (windowId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.windowId === windowId
          ? { ...w, minimized: !w.minimized, z: w.minimized ? prev.reduce((m, ww) => Math.max(m, ww.z), 0) + 1 : w.z }
          : w,
      ),
    )
  }

  return (
    <div
      className="desktop-container"
      data-folder-id="desktop-folder"
      ref={desktopRef}
    >
      <IconGrid folderId="desktop-folder" onOpen={openWindow} />

      {windows.filter(w => !w.minimized).map(({ windowId, node, z, initialPos }) => (
        <Window
          key={windowId}
          id={windowId}
          title={node.name}
          node={node}
          initial={initialPos}
          zIndex={z}
          onFocus={bringToFront}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
        >
          {node.type === 'folder' ? (
            <Explorer 
              initialNodeId={node.id} 
              onOpen={openWindow} 
              onNavigate={(folderId) => navigateWindow(windowId, folderId)}
            />
          ) : node.id === 'about' ? (
            <div className="needs-scroll">
              <AboutMe />
            </div>
          ) : node.id === 'resume' ? (
            <div className="needs-scroll">
              <Resume />
            </div>
          ) : node.type === 'html' ? (
            <BrowserFrame route={(node as any).payload?.route ?? '/'} />
          ) : (node as any).payload?.content === 'password-dialog' ? (
            <PasswordDialog onClose={() => closeWindow(windowId)} />
          ) : (node as any).payload?.content === 'system-error' ? (
            <ErrorDialog 
              title="System Protection"
              message={(node as any).payload?.message || "System file is protected and cannot be deleted."}
              onClose={() => closeWindow(windowId)} 
            />
          ) : (node as any).payload?.content === 'desktop-error' ? (
            <ErrorDialog 
              title="System Error"
              message="Cannot delete system folder 'Desktop'. This folder is required for system operation."
              onClose={() => closeWindow(windowId)} 
            />
          ) : (node as any).payload?.content === 'delete-confirm' ? (
            <ConfirmDeleteDialog 
              targetName={(node as any).payload?.targetName || "item"}
              onConfirm={(node as any).payload?.onConfirm || (() => {})}
              onClose={() => closeWindow(windowId)}
            />
          ) : (node as any).payload?.content === 'terminal' ? (
            <Terminal cwd={(node as any).payload?.cwd || 'root'} onOpen={openWindow} />
          ) : typeof (node as any).payload?.content === 'string' ? (
            <div className="needs-scroll">
              <p style={{ fontFamily: 'var(--font-ui)', whiteSpace: 'pre-wrap', padding: '12px', color: '#000' }}>
                {(node as any).payload.content}
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-ui)' }}>Content for {node.name}</p>
          )}
        </Window>
      ))}
      <Taskbar windows={windows} activeId={windows.filter(w=>!w.minimized).sort((a,b)=>a.z-b.z).pop()?.windowId ?? null} onTaskClick={toggleMinimize} />
    </div>
  )
}

export default Desktop 