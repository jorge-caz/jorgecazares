import DesktopIcon from '../desktop/DesktopIcon'
import { useFS } from '../context'
import type { FSNode } from '../data/fs'
import { useMemo, useRef, useState, useEffect } from 'react'
import { getIconForNode } from '../utils/iconUtils'

// Clipboard helpers
import { setClipboard, getClipboard } from '../utils/clipboard'
import { showBlueScreen } from '../utils/blueScreen'

interface IconGridProps {
  folderId: string
  onOpen: (node: FSNode) => void
  unbounded?: boolean
  mode?: 'grid' | 'list'
  nodes?: FSNode[] // Optional: provide nodes directly instead of using FS context
}

const IconGrid: React.FC<IconGridProps> = ({ folderId, onOpen, unbounded = false, mode = 'grid', nodes }) => {
  const { fs, positions, setPosition, move, add, update, clearPosition, remove } = useFS()

  const GRID = mode === 'list' ? 40 : 80 // 40px row height for list view

  const gridRef = useRef<HTMLDivElement>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [menu, setMenu] = useState<{ x: number; y: number; visible: boolean; targetId: string | null }>({
    x: 0,
    y: 0,
    visible: false,
    targetId: null,
  })
  const [wallpaperInput, setWallpaperInput] = useState<HTMLInputElement | null>(null)

  // --- Marquee selection state ---
  const [selectRect, setSelectRect] = useState<{ x: number; y: number; width: number; height: number; visible: boolean }>({ x: 0, y: 0, width: 0, height: 0, visible: false })
  const selectingRef = useRef<{ startX: number; startY: number; additive: boolean } | null>(null)
  const skipClickClearRef = useRef(false)

  const updateSelectionByRect = (rect: { x: number; y: number; width: number; height: number }, additive: boolean) => {
    if (!gridRef.current) return
    const gridBounds = gridRef.current.getBoundingClientRect()
    const icons = Array.from(gridRef.current.querySelectorAll('.desktop-icon')) as HTMLElement[]
    const newly: string[] = []
    icons.forEach(icon => {
      const b = icon.getBoundingClientRect()
      const relLeft = b.left - gridBounds.left
      const relTop = b.top - gridBounds.top
      const relRight = relLeft + b.width
      const relBottom = relTop + b.height
      const overlap = !(relRight < rect.x || relLeft > rect.x + rect.width || relBottom < rect.y || relTop > rect.y + rect.height)
      if (overlap) {
        const id = icon.dataset.iconId
        if (id) newly.push(id)
      }
    })
    setSelectedIds(prev => additive ? Array.from(new Set([...prev, ...newly])) : newly)
  }

  const cloneNodeDeep = (node: FSNode): FSNode => {
    const newId = crypto.randomUUID()
    if (node.type === 'folder') {
      return {
        ...node,
        id: newId,
        name: generateCopyName(node.name),
        children: node.children.map(cloneNodeDeep),
      }
    }
    return { ...node, id: newId, name: generateCopyName(node.name) }
  }

  const generateCopyName = (base: string): string => {
    // Ensure the new name is unique in this folder
    let name = `${base} - Copy`
    const existingNames = folder.children.map((n) => n.name)
    let idx = 2
    while (existingNames.includes(name)) {
      name = `${base} - Copy (${idx++})`
    }
    return name
  }

  const handleCopy = (ids: string[]) => {
    if (!ids.length) return
    setClipboard({ nodeIds: ids, mode: 'copy' })
  }

  const handleCut = (ids: string[]) => {
    if (!ids.length) return
    // For protected nodes, deny cut similar to delete
    const blocked = ids.some((id) => {
      const node = folder.children.find((n) => n.id === id)
      return node?.protected
    })
    if (blocked) {
      // If any protected node, fallback to delete logic for first blocked node
      const firstProtected = ids.find((id) => {
        const node = folder.children.find((n) => n.id === id)
        return node?.protected
      })
      if (firstProtected) handleDelete(firstProtected)
      return
    }
    setClipboard({ nodeIds: ids, mode: 'cut' })
  }

  const handlePaste = () => {
    const clip = getClipboard()
    if (!clip) return
    const sourceNodes: FSNode[] = []

    const collectSource = (id: string) => {
      const stack: FSNode[] = [fs]
      while (stack.length) {
        const n = stack.pop() as FSNode
        if (n.id === id) return n
        if (n.type === 'folder') stack.push(...n.children)
      }
      return null
    }

    for (const id of clip.nodeIds) {
      const found = collectSource(id)
      if (found) sourceNodes.push(found)
    }
    if (sourceNodes.length === 0) return

    // Prevent pasting a folder into itself or its own descendant
    const isDescendant = (parent: FSNode, targetId: string): boolean => {
      if (parent.type !== 'folder') return false
      const stack: FSNode[] = [...parent.children]
      while (stack.length) {
        const n = stack.pop() as FSNode
        if (n.id === targetId) return true
        if (n.type === 'folder') stack.push(...n.children)
      }
      return false
    }

    const invalidPaste = sourceNodes.some((sourceNode) => {
      return (
        sourceNode.type === 'folder' &&
        (folder.id === sourceNode.id || isDescendant(sourceNode, folder.id))
      )
    })

    if (invalidPaste) {
      // Trigger a funny blue screen of death 🟦💀
      showBlueScreen(`
        <div style="text-align: center; max-width: 600px;">
          <div style="font-size: 26px; font-weight: bold; margin-bottom: 24px;">JorgeOS</div>
          <div>😱  A fatal exception has occurred.</div>
          <div>ERROR&nbsp;CODE: <span style="color:#4ade80">0xC0P1-PA5TE</span></div>
          <br>
          <div>You attempted to paste a folder <i>inside itself</i>.</div>
          <div>The universe started folding in on itself and we panicked.</div>
          <br>
          <div>* Reboot your computer to unfry reality.</div>
        </div>
      `)
      return
    }

    if (clip.mode === 'copy') {
      sourceNodes.forEach((sn) => {
        const duplicate = cloneNodeDeep(sn)
        add(folder.id, duplicate)
      })
    } else if (clip.mode === 'cut') {
      sourceNodes.forEach((sn) => move(sn.id, folder.id))
      // Clear clipboard after move
      setClipboard(null)
    }
  }

  const folder = useMemo(() => {
    // If nodes are provided directly, create a virtual folder
    if (nodes) {
      return { id: folderId, name: '', type: 'folder' as const, children: nodes }
    }
    
    // Otherwise, find folder in FS context
    const stack: FSNode[] = [fs]
    while (stack.length) {
      const n = stack.pop() as FSNode
      if (n.id === folderId && n.type === 'folder') return n
      if (n.type === 'folder') stack.push(...n.children)
    }
    return fs // fallback root
  }, [fs, folderId, nodes])

  const items = useMemo(() => {
    if (mode === 'list') {
      return [...folder.children].sort((a, b) => a.name.localeCompare(b.name))
    }
    return folder.children
  }, [folder, mode])

  // helper to find next free slot
  const calcNextSlot = (startX: number, startY: number): { x: number; y: number } => {
    const taken = folder.children.map((n, idx) => positions[n.id] ?? { x: (idx % 10) * GRID, y: Math.floor(idx / 10) * GRID })
    let x = startX,
      y = startY
    let found = false
    while (!found) {
      found = !taken.some((p) => p.x === x && p.y === y)
      if (!found) {
        y += GRID
        if (y > 800) {
          y = 0
          x += GRID
        }
      }
    }
    return { x, y }
  }

  // Group drag handler
  const handleIconPositionChange = (id: string, newPos: { x: number; y: number }) => {
    // Helper to get current position for an item
    const getCurrentPos = (nodeId: string, index: number): { x: number; y: number } => {
      if (mode === 'list') return { x: 0, y: index * GRID }
      return positions[nodeId] ?? { x: (index % 10) * GRID, y: Math.floor(index / 10) * GRID }
    }

    const draggedIdx = items.findIndex(n => n.id === id)
    if (draggedIdx === -1) return setPosition(id, newPos)

    const oldPos = getCurrentPos(id, draggedIdx)
    const dx = newPos.x - oldPos.x
    const dy = newPos.y - oldPos.y

    if (selectedIds.length > 1 && selectedIds.includes(id)) {
      selectedIds.forEach(selId => {
        const idx = items.findIndex(n => n.id === selId)
        if (idx === -1) return
        const basePos = getCurrentPos(selId, idx)
        const targetPos = selId === id ? newPos : { x: basePos.x + dx, y: basePos.y + dy }
        setPosition(selId, targetPos)
      })
    } else {
      setPosition(id, newPos)
    }
  }

  // context menu handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // Close any other open context menus globally
    window.dispatchEvent(new Event('hideAllMenus'))
    const iconEl = (e.target as HTMLElement).closest('.desktop-icon') as HTMLElement | null
    const iconId = iconEl?.dataset.iconId ?? null
    const rect = gridRef.current?.getBoundingClientRect()
    const x = rect ? e.clientX - rect.left : e.clientX
    const y = rect ? e.clientY - rect.top : e.clientY
    setMenu({ x, y, visible: true, targetId: iconId })
  }

  // Listen for global hide event to close this menu
  useEffect(() => {
    const handler = () => setMenu((m) => ({ ...m, visible: false, targetId: null }))
    window.addEventListener('hideAllMenus', handler)
    // Also hide on any click outside
    const clickHandler = () => handler()
    window.addEventListener('click', clickHandler)
    return () => {
      window.removeEventListener('hideAllMenus', handler)
      window.removeEventListener('click', clickHandler)
    }
  }, [])

  const closeMenu = () => setMenu((m) => ({ ...m, visible: false, targetId: null }))

  const createFolder = () => {
    // Don't allow folder creation when nodes are provided directly
    if (nodes) return
    
    closeMenu()
    const base = 'New Folder'
    let name = base
    let idx = 1
    const existing = folder.children.map((c) => c.name)
    while (existing.includes(name)) name = `${base} (${idx++})`
    const id = crypto.randomUUID()
    add(folder.id, { id, name, type: 'folder', children: [] })
    let startX = 0,
      startY = 0
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect()
      startX = Math.floor((menu.x - rect.left) / GRID) * GRID
      startY = Math.floor((menu.y - rect.top) / GRID) * GRID
    }

    const slot = calcNextSlot(startX, startY)
    setPosition(id, slot)
    setEditingId(id)
  }

  const handleRename = (id: string, newName: string) => {
    // Don't allow rename when nodes are provided directly
    if (nodes) return
    
    if (newName && newName !== '') update({ ...(folder.children.find((n) => n.id === id) as any), name: newName })
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    // Don't allow delete when nodes are provided directly
    if (nodes) return
    
    if (!id) return;
    
    const node = folder.children.find(n => n.id === id);
    if (!node) return;

    // Check if the node is marked as protected
    if (node.protected) {
      // For system executables and critical applications, show specific error messages
      if (node.id.includes('exe') || ['internet-explorer', 'windows-defender', 'adobe-reader'].includes(node.id)) {
        let errorMessage = 'Cannot delete system file.';
        
        if (node.id.includes('exe')) {
          errorMessage = `Cannot delete "${node.name}". This file is required for system operation.`;
        } else if (node.id === 'internet-explorer') {
          errorMessage = 'Internet Explorer cannot be deleted. It is integrated into Windows. (Unfortunately 😔)';
        } else if (node.id === 'windows-defender') {
          errorMessage = 'Windows Defender is protecting your system and cannot be removed. (It\'s doing its best!)';
        } else if (node.id === 'adobe-reader') {
          errorMessage = 'Adobe Reader cannot be deleted. It will find another way to exist on your computer anyway.';
        }

        onOpen({
          id: 'system-error-' + node.id,
          name: 'System Protection',
          type: 'file',
          payload: { content: 'system-error', message: errorMessage }
        });
      } else {
        // For protected folders, require admin authentication
        onOpen({
          id: 'password-dialog',
          name: 'Administrator Authentication Required',
          type: 'file',
          payload: { content: 'password-dialog' }
        });
      }
      return;
    }

         // For unprotected items, show confirmation dialog window
     onOpen({
       id: 'delete-confirm-' + node.id,
       name: 'Confirm Delete',
       type: 'file',
       payload: { 
         content: 'delete-confirm', 
         targetId: node.id,
         targetName: node.name,
         onConfirm: () => {
           // Prevent deleting if its window is open
           if (document.querySelector(`[data-window-folder-id="${id}"]`)) {
             onOpen({
               id: 'window-open-error',
               name: 'Cannot Delete',
               type: 'file',
               payload: { content: 'system-error', message: 'Close the folder window before deleting.' }
             });
             return
           }
           // If we are currently viewing the Recycle Bin, delete permanently; otherwise move to recycle bin
           if (folder.id === 'recycle') {
             // Permanently remove the node
             remove(id)
           } else {
             // Do not move the recycle bin itself
             if (id !== 'recycle') {
               move(id, 'recycle')
             }
           }
           // Clear any saved custom position for the item (whether moved or deleted)
           clearPosition(id)
           if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((i) => i !== id))
         }
       }
     });
  }

  const handleOpenTerminal = () => {
    let targetFolderId = folderId // default to current folder
    if (menu.targetId) {
      const targetNode = items.find((n) => n.id === menu.targetId)
      if (targetNode && targetNode.type === 'folder') {
        targetFolderId = targetNode.id
      }
    }
    onOpen({
      id: 'terminal-' + targetFolderId + '-' + Date.now(),
      name: 'Terminal',
      type: 'file',
      payload: { content: 'terminal', cwd: targetFolderId }
    })
    closeMenu()
  }

  // Keyboard shortcuts: F2 rename, Delete remove
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const lower = e.key.toLowerCase()
      if (lower === 'f2' && selectedIds.length > 0 && !editingId) setEditingId(selectedIds[0])
      if (lower === 'delete' && selectedIds.length > 0) {
        selectedIds.forEach(id => handleDelete(id))
      }

      // Open with Enter
      if (lower === 'enter' && selectedIds.length > 0) {
        const node = folder.children.find((n) => n.id === selectedIds[0])
        if (node) onOpen(node)
      }

      // Copy (Ctrl/Cmd + C)
      if ((e.ctrlKey || e.metaKey) && lower === 'c' && selectedIds.length > 0) {
        handleCopy(selectedIds)
      }

      // Cut (Ctrl/Cmd + X)
      if ((e.ctrlKey || e.metaKey) && lower === 'x' && selectedIds.length > 0) {
        handleCut(selectedIds)
      }

      // Paste (Ctrl/Cmd + V)
      if ((e.ctrlKey || e.metaKey) && lower === 'v') {
        handlePaste()
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [selectedIds, editingId])

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Wallpaper handling
  const handleChangeWallpaper = () => {
    closeMenu()
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string
          // Cache in localStorage
          localStorage.setItem('desktop-wallpaper', imageUrl)
          // Apply to desktop
          const desktop = document.querySelector('.desktop-container') as HTMLElement
          if (desktop) {
            desktop.style.backgroundImage = `url(${imageUrl})`
            desktop.style.backgroundSize = 'cover'
            desktop.style.backgroundPosition = 'center'
            desktop.style.backgroundRepeat = 'no-repeat'
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  // Load cached wallpaper on mount
  useEffect(() => {
    const cachedWallpaper = localStorage.getItem('desktop-wallpaper')
    if (cachedWallpaper && folderId === 'desktop-folder') {
      const desktop = document.querySelector('.desktop-container') as HTMLElement
      if (desktop) {
        desktop.style.backgroundImage = `url(${cachedWallpaper})`
        desktop.style.backgroundSize = 'cover'
        desktop.style.backgroundPosition = 'center'
        desktop.style.backgroundRepeat = 'no-repeat'
      }
    }
  }, [folderId])

  // Listen for global clearSelection events
  useEffect(() => {
    const handler = () => {
      setSelectedIds([])
      setEditingId(null)
    }
    window.addEventListener('clearSelection', handler)
    return () => window.removeEventListener('clearSelection', handler)
  }, [])

  return (
    <div
      ref={gridRef}
      className={`icon-grid ${mode === 'list' ? 'list-mode' : ''}`}
      onContextMenu={handleContextMenu}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('.desktop-icon')) return // ignore icons
        if (e.button !== 0) return
        if (!gridRef.current) return
        const rect = gridRef.current.getBoundingClientRect()
        const startX = e.clientX - rect.left
        const startY = e.clientY - rect.top
        selectingRef.current = { startX, startY, additive: e.ctrlKey || e.metaKey }
        setSelectRect({ x: startX, y: startY, width: 0, height: 0, visible: true })

        document.body.style.userSelect = 'none'

        const move = (ev: MouseEvent) => {
          if (!selectingRef.current) return
          const currentX = ev.clientX - rect.left
          const currentY = ev.clientY - rect.top
          const x = Math.min(currentX, selectingRef.current.startX)
          const y = Math.min(currentY, selectingRef.current.startY)
          const width = Math.abs(currentX - selectingRef.current.startX)
          const height = Math.abs(currentY - selectingRef.current.startY)
          setSelectRect({ x, y, width, height, visible: true })
          updateSelectionByRect({ x, y, width, height }, selectingRef.current.additive)
        }

        const up = () => {
          if (selectingRef.current) {
            updateSelectionByRect(selectRect, selectingRef.current.additive)
          }
          selectingRef.current = null
          setSelectRect(r => ({ ...r, visible: false }))
          skipClickClearRef.current = true
          document.removeEventListener('mousemove', move)
          document.removeEventListener('mouseup', up)
          document.body.style.userSelect = ''
        }

        document.addEventListener('mousemove', move)
        document.addEventListener('mouseup', up)
      }}
      onClick={(e) => {
        if (skipClickClearRef.current) {
          skipClickClearRef.current = false
          return
        }
        const target = (e.target as HTMLElement).closest('.desktop-icon') as HTMLElement | null
        if (!target) {
          setSelectedIds([])
          setEditingId(null)
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        padding: mode === 'list' ? '12px 0' : '16px',
        background: mode === 'list' ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
        borderRadius: mode === 'list' ? '0' : '8px',
        minHeight: '100%'
      }}
    >
      {/* Icons */}
      {items.map((node, idx) => (
        <DesktopIcon
          key={node.id}
          id={node.id}
          label={node.name}
          iconSrc={getIconForNode(node)}
          position={
            mode === 'list'
              ? { x: 0, y: idx * GRID }
              : positions[node.id] ?? { x: (idx % 10) * GRID, y: Math.floor(idx / 10) * GRID }
          }
          onPositionChange={handleIconPositionChange}
          isPositionOccupied={(candidate) => {
            return items.some((other, otherIdx) => {
              if (other.id === node.id) return false
              const otherPos = mode === 'list'
                ? { x: 0, y: otherIdx * GRID }
                : positions[other.id] ?? { x: (otherIdx % 10) * GRID, y: Math.floor(otherIdx / 10) * GRID }
              return otherPos.x === candidate.x && otherPos.y === candidate.y
            })
          }}
          getFolderAtPosition={(candidate) => {
            for (let i = 0; i < items.length; i++) {
              const other = items[i]
              if (other.id === node.id || other.type !== 'folder') continue
              const otherPos = mode === 'list' ? { x: 0, y: i * GRID } : positions[other.id] ?? { x: (i % 10) * GRID, y: Math.floor(i / 10) * GRID }
              if (otherPos.x === candidate.x && otherPos.y === candidate.y) {
                return other.id
              }
            }
            return null
          }}
          onDoubleClick={() => onOpen(node)}
          isFolder={node.type === 'folder'}
          onMoveToFolder={(childId, toFolderId, newPos) => {
            const idsToMove = selectedIds.includes(childId) ? selectedIds : [childId]
            idsToMove.forEach((id) => {
              move(id, toFolderId)
              if (newPos && toFolderId === 'desktop-folder') {
                setPosition(id, newPos)
              } else {
                clearPosition(id)
              }
            })
          }}
          selected={selectedIds.includes(node.id)}
          onSelect={(id, ev) => {
            // If right-click on already-selected icon, keep current selection
            if (ev?.type === 'contextmenu' && selectedIds.includes(id)) return

            const multi = ev?.ctrlKey || ev?.metaKey
            if (multi) {
              // toggle selection
              if (selectedIds.includes(id)) {
                setSelectedIds(selectedIds.filter((i) => i !== id))
              } else {
                setSelectedIds([...selectedIds, id])
              }
            } else {
              setSelectedIds([id])
            }
          }}
          editing={editingId === node.id}
          onRename={handleRename}
          allowGlobalDrag={unbounded}
          draggable={true}
          parentFolderId={folderId}
          gridSize={GRID}
        />
      ))}

      {/* Selection rectangle overlay */}
      {selectRect.visible && (
        <div
          style={{
            position: 'absolute',
            left: selectRect.x,
            top: selectRect.y,
            width: selectRect.width,
            height: selectRect.height,
            background: 'rgba(102, 153, 255, 0.3)',
            border: '1px solid rgba(102, 153, 255, 0.8)',
            pointerEvents: 'none',
            zIndex: 4500,
          }}
        />
      )}

      {menu.visible && (
        <ul
          style={{
            position: 'absolute',
            top: menu.y,
            left: menu.x,
            listStyle: 'none',
            margin: 0,
            padding: '8px 0',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(200, 200, 200, 0.8)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            zIndex: 4000,
            minWidth: '120px',
            color: '#333'
          }}
        >
          {/* Show wallpaper option only on desktop (desktop-folder) and when no icon is targeted and not using provided nodes */}
          {folderId === 'desktop-folder' && !menu.targetId && !nodes && (
            <li 
              style={{ 
                padding: '8px 16px', 
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                borderRadius: '4px',
                margin: '0 4px'
              }} 
              onClick={handleChangeWallpaper}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Change Background
            </li>
          )}
          {/* Separator line if both wallpaper and folder options are shown */}
          {folderId === 'desktop-folder' && !menu.targetId && !nodes && (
            <li style={{ 
              height: '1px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              margin: '4px 8px' 
            }} />
          )}
          {/* Only show New Folder for main FS, not provided nodes */}
          {!nodes && (
            <li 
              style={{ 
                padding: '8px 16px', 
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                borderRadius: '4px',
                margin: '0 4px'
              }} 
              onClick={createFolder}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              New Folder
            </li>
          )}
          {/* Clipboard operations */}
          {menu.targetId && !nodes && (
            <>
              <li
                style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s ease', borderRadius: '4px', margin: '0 4px' }}
                onClick={() => {
                  handleCopy(selectedIds)
                  closeMenu()
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Copy
              </li>
              <li
                style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s ease', borderRadius: '4px', margin: '0 4px' }}
                onClick={() => {
                  handleCut(selectedIds)
                  closeMenu()
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Cut
              </li>
            </>
          )}
          {/* Paste always available if clipboard has data */}
          {getClipboard() && !nodes && (
            <li
              style={{ padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s ease', borderRadius: '4px', margin: '0 4px' }}
              onClick={() => {
                handlePaste()
                closeMenu()
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Paste
            </li>
          )}
          {/* Open in Terminal (always available) */}
          <li
            style={{ 
              padding: '8px 16px', 
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              borderRadius: '4px',
              margin: '0 4px'
            }}
            onClick={handleOpenTerminal}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Open in Terminal
          </li>
          {/* Only show Rename and Delete for main FS, not provided nodes */}
          {menu.targetId && !nodes && (() => {
            const targetNode = folder.children.find(n => n.id === menu.targetId);
            const isProtected = targetNode?.protected === true;
            
            return (
              <li
                style={{ 
                  padding: '8px 16px', 
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  borderRadius: '4px',
                  margin: '0 4px',
                  ...(isProtected ? {
                    color: '#dc2626', 
                    fontWeight: '500',
                    background: 'rgba(239, 68, 68, 0.05)'
                  } : {})
                }}
                onClick={() => {
                  handleDelete(menu.targetId!)
                  closeMenu()
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isProtected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 99, 71, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = isProtected ? 'rgba(239, 68, 68, 0.05)' : 'transparent'}
                title={isProtected ? "Protected system item - requires admin privileges" : "Delete this item"}
              >
                {'Delete'}
              </li>
            );
          })()}
          {!nodes && menu.targetId && (
            <li
              style={{ 
                padding: '8px 16px', 
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                borderRadius: '4px',
                margin: '0 4px'
              }}
              onClick={() => {
                setEditingId(menu.targetId!)
                closeMenu()
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Rename
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default IconGrid 