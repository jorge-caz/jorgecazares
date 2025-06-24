import { useRef, useState, useEffect } from 'react'
import type React from 'react'
import Draggable from 'react-draggable'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import './DesktopIcon.css'

export interface DesktopIconProps {
  id: string
  label: string
  iconSrc: string
  position: { x: number; y: number }
  onDoubleClick?: (id: string) => void
  selected?: boolean
  onSelect?: (id: string, e?: React.MouseEvent) => void
  onPositionChange?: (id: string, pos: { x: number; y: number }) => void
  /**
   * Predicate supplied by the parent grid that returns true when the supplied
   * (snapped) coordinates are already occupied by another icon. If the drag
   * finishes over an occupied slot, the icon will snap back to its original
   * location and no position change event will be emitted.
   */
  isPositionOccupied?: (pos: { x: number; y: number }) => boolean
  /** Returns folderId if given grid coordinates are occupied by a folder icon */
  getFolderAtPosition?: (pos: { x: number; y: number }) => string | null
  isFolder?: boolean
  onMoveToFolder?: (id: string, targetFolderId: string, pos?: { x: number; y: number }) => void
  editing?: boolean
  onRename?: (id: string, newName: string) => void
  allowGlobalDrag?: boolean
  gridSize?: number
  draggable?: boolean
  parentFolderId?: string // for snap-back logic in list view
}

const DesktopIcon = ({ id, label, iconSrc, position, onDoubleClick, selected = false, onSelect, onPositionChange, isPositionOccupied, getFolderAtPosition, isFolder = false, onMoveToFolder, editing = false, onRename, allowGlobalDrag = false, gridSize = 80, draggable = true, parentFolderId }: DesktopIconProps) => {
  const GRID = gridSize
  const snap = (value: number) => Math.round(value / GRID) * GRID
  const [pos, setPos] = useState({ x: snap(position.x), y: snap(position.y) })
  const originRef = useRef({ x: snap(position.x), y: snap(position.y) })

  // keep local position in sync with prop when it changes (e.g., folder list resort)
  useEffect(() => {
    const snapped = { x: snap(position.x), y: snap(position.y) }
    originRef.current = snapped
    setPos(snapped)
  }, [position.x, position.y])

  const [dragging, setDragging] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ x:number; y:number}>({x:0,y:0})
  const clickOffsetRef = useRef<{ dx:number; dy:number}>({dx:0,dy:0})
  const pointerStartRef = useRef<{ x:number; y:number}>({x:0,y:0})
  const dragDetectedRef = useRef(false)
  const overlayRef = useRef<HTMLDivElement | null>(null)

  const handleStop = (_: unknown, data: { x: number; y: number }): boolean => {
    // If movement is minimal treat it as a click, not a drag
    const dx = Math.abs(data.x - dragStartRef.current.x)
    const dy = Math.abs(data.y - dragStartRef.current.y)
    if (dx < 4 && dy < 4) {
      // revert to original pos, no position update
      setPos(originRef.current)
      return false
    }

    const snapped = { x: snap(data.x), y: snap(data.y) }

    // If the target slot is already taken, decide what to do.
    if (isPositionOccupied?.(snapped)) {
      // If a folder occupies that slot, move into it immediately.
      const folderTarget = getFolderAtPosition?.(snapped)
      if (folderTarget && folderTarget !== id && folderTarget !== parentFolderId) {
        onMoveToFolder?.(id, folderTarget)
      }
      // Regardless, revert visual position.
      setPos(originRef.current)
      return false
    }

    setPos(snapped)
    onPositionChange?.(id, snapped)
    return true
  }

  return (
    <Draggable
      nodeRef={nodeRef as any}
      {...(!allowGlobalDrag ? { bounds: 'parent' } : {})}
      disabled={!draggable}
      position={pos}
      onStart={(e, data) => {
        // Calculate pointer (cursor) position relative to parent container
        const parentRect = (nodeRef.current?.parentElement as HTMLElement | null)?.getBoundingClientRect()
        const cursorX = (e as MouseEvent).clientX - (parentRect?.left ?? 0)
        const cursorY = (e as MouseEvent).clientY - (parentRect?.top ?? 0)

        dragStartRef.current = { x: data.x, y: data.y }
        pointerStartRef.current = { x: cursorX, y: cursorY }
        dragDetectedRef.current = false

        // capture mouse offset inside the icon (to preserve relative position)
        const el = nodeRef.current
        if (el && e instanceof MouseEvent) {
          const rect = el.getBoundingClientRect()
          clickOffsetRef.current = {
            dx: e.clientX - rect.left,
            dy: e.clientY - rect.top,
          }
        }
        
        // If we're dragging globally (from inside a window), allow overflow
        if (allowGlobalDrag) {
          const windowContent = nodeRef.current?.closest('.window-content') as HTMLElement | null
          const windowEl = nodeRef.current?.closest('.window') as HTMLElement | null
          windowContent?.classList.add('dragging-active')
          windowEl?.classList.add('dragging-active')
        }
      }}
      onDrag={(e, data) => {
        const parentRect = (nodeRef.current?.parentElement as HTMLElement | null)?.getBoundingClientRect()
        const cursorX = (e as MouseEvent).clientX - (parentRect?.left ?? 0)
        const cursorY = (e as MouseEvent).clientY - (parentRect?.top ?? 0)

        // Determine if movement exceeds click tolerance to start drag
        if (!dragDetectedRef.current) {
          const dx = Math.abs(cursorX - pointerStartRef.current.x)
          const dy = Math.abs(cursorY - pointerStartRef.current.y)
          if (dx >= 4 || dy >= 4) {
            dragDetectedRef.current = true
            setDragging(true)
            if (allowGlobalDrag) {
              const windowContent = nodeRef.current?.closest('.window-content') as HTMLElement | null
              const windowEl = nodeRef.current?.closest('.window') as HTMLElement | null
              windowContent?.classList.add('dragging-active')
              windowEl?.classList.add('dragging-active')

              // Create overlay now
              const overlay = document.createElement('div')
              overlay.style.position = 'fixed'
              overlay.style.pointerEvents = 'none'
              overlay.style.zIndex = '999999'
              overlay.style.margin = '0'
              overlay.style.width = `${GRID}px`
              overlay.style.height = `${GRID}px`
              overlay.style.display = 'flex'
              overlay.style.flexDirection = 'column'
              overlay.style.alignItems = 'center'
              overlay.style.justifyContent = 'flex-start'
              overlay.style.padding = '0'
              overlay.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
              overlay.style.textAlign = 'center'

              // Handle both img and React icon types
              if (iconSrc === 'FaGithub' || iconSrc === 'FaLinkedin') {
                const iconDiv = document.createElement('div')
                iconDiv.style.width = '48px'
                iconDiv.style.height = '48px'
                iconDiv.style.display = 'flex'
                iconDiv.style.alignItems = 'center'
                iconDiv.style.justifyContent = 'center'
                
                if (iconSrc === 'FaLinkedin') {
                  iconDiv.style.background = 'white'
                  iconDiv.style.borderRadius = '6px'
                  iconDiv.innerHTML = '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="48" width="48" xmlns="http://www.w3.org/2000/svg" color="#0A66C2"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" fill="#0A66C2"></path></svg>'
                } else {
                  iconDiv.innerHTML = '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 496 512" height="48" width="48" xmlns="http://www.w3.org/2000/svg" color="#181717"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.3-1.3 1.3-3.9 0-6.2-1.3-2.3-4-3.3-5.6-2z" fill="#181717"></path></svg>'
                }
                overlay.appendChild(iconDiv)
              } else {
                const img = document.createElement('img')
                img.src = iconSrc
                img.style.width = '48px'
                img.style.height = '48px'
                overlay.appendChild(img)
              }

              const labelSpan = document.createElement('span')
              labelSpan.textContent = label
              labelSpan.style.marginTop = '4px'
              labelSpan.style.fontFamily = 'var(--font-ui)'
              labelSpan.style.fontSize = '12px'
              labelSpan.style.color = '#fff'
              labelSpan.style.textAlign = 'center'
              labelSpan.style.display = 'block'
              labelSpan.style.width = 'auto'
              labelSpan.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)'
              overlay.appendChild(labelSpan)

              document.body.appendChild(overlay)
              overlayRef.current = overlay

              overlay.style.left = `${(e as MouseEvent).clientX - GRID / 2}px`
              overlay.style.top = `${(e as MouseEvent).clientY - GRID / 2}px`

              // hide original icon
              if (nodeRef.current) nodeRef.current.style.visibility = 'hidden'
            }
          } else {
            return // still considered a click; ignore minor moves
          }
        }

        if (overlayRef.current) {
          overlayRef.current.style.left = `${(e as MouseEvent).clientX - GRID / 2}px`
          overlayRef.current.style.top = `${(e as MouseEvent).clientY - GRID / 2}px`
        } else {
          // Regular in-window drag: move the actual icon
          const newX = cursorX - GRID / 2
          const newY = cursorY - GRID / 2
          setPos({ x: newX, y: newY })
        }
      }}
      onStop={(e, data) => {
        // Only perform drag-ending logic if a drag was actually detected
        if (dragDetectedRef.current) {
          setDragging(false)
          if (allowGlobalDrag) {
            const windowContent = nodeRef.current?.closest('.window-content') as HTMLElement | null
            const windowEl = nodeRef.current?.closest('.window') as HTMLElement | null
            windowContent?.classList.remove('dragging-active')
            windowEl?.classList.remove('dragging-active')

            // Remove overlay clone
            if (overlayRef.current) {
              overlayRef.current.remove()
              overlayRef.current = null
            }

            // restore icon visibility
            if (nodeRef.current) nodeRef.current.style.visibility = ''
          }
        }

        const parentRect = (nodeRef.current?.parentElement as HTMLElement | null)?.getBoundingClientRect()
        const cursorEndX = (e as MouseEvent).clientX - (parentRect?.left ?? 0)
        const cursorEndY = (e as MouseEvent).clientY - (parentRect?.top ?? 0)
        const dxCursor = Math.abs(cursorEndX - pointerStartRef.current.x)
        const dyCursor = Math.abs(cursorEndY - pointerStartRef.current.y)
        const consideredClick = dxCursor < 4 && dyCursor < 4

        if (!consideredClick) {
          handleStop(e, data)
        } else {
          // revert to original position on simple click
          setPos(originRef.current)
        }

        if (consideredClick) return

        const clientX = (e as MouseEvent).clientX
        const clientY = (e as MouseEvent).clientY
        const dragWrap = nodeRef.current?.parentElement as HTMLElement | null

        // Temporarily hide wrapper and icon to detect underlying element
        if (dragWrap) dragWrap.style.display = 'none'
        if (nodeRef.current) nodeRef.current.style.display = 'none'

        const stack = (document.elementsFromPoint(clientX, clientY) as HTMLElement[])
        let targetId: string | null = null
        let dropContainer: HTMLElement | null = null // element representing the container we drop into
        
        for (const el of stack) {
          // 1) Are we over a folder *icon*? (ignore the desktop background itself)
          const folderIcon = el.closest('.desktop-icon[data-folder-id]') as HTMLElement | null
          if (folderIcon && folderIcon.dataset.folderId !== 'desktop-folder') {
            targetId = folderIcon.dataset.folderId!
            dropContainer = folderIcon.parentElement as HTMLElement | null
            break
          }

          // 2) Are we inside an open Explorer window? (drop into that folder)
          const windowAttr = el.closest('[data-window-folder-id]') as HTMLElement | null
          if (windowAttr) {
            targetId = windowAttr.dataset.windowFolderId!
            dropContainer = windowAttr as HTMLElement
            break
          }

          // 3) Fallback: the desktop background itself (desktop folder)
          if (el.classList.contains('desktop-container')) {
            targetId = el.dataset.folderId || 'desktop-folder'  // Use the folder ID from the container
            dropContainer = el as HTMLElement
            break
          }
        }
        if (targetId && targetId !== id && targetId !== parentFolderId) {
          // compute position relative to dropContainer if available
          let relativePos: { x: number; y: number } | undefined
          if (dropContainer) {
            // For desktop drops, use the desktop IconGrid for accurate position (accounts for padding)
            let targetEl = dropContainer
            if (targetId === 'desktop-folder') {
              const desktopGrid = document.querySelector('.desktop-container .icon-grid:not(.list-mode)') as HTMLElement | null
              if (desktopGrid) {
                targetEl = desktopGrid
              }
            }

            const rect = targetEl.getBoundingClientRect()

            // Subtract padding so coordinates are relative to the icon positioning context
            const style = window.getComputedStyle(targetEl)
            const padLeft = parseFloat(style.paddingLeft || '0')
            const padTop = parseFloat(style.paddingTop || '0')

            // Snap based directly on drop cursor location
            const gx = clientX - rect.left - padLeft
            const gy = clientY - rect.top - padTop

            relativePos = {
              x: Math.floor(gx / GRID) * GRID,
              y: Math.floor(gy / GRID) * GRID,
            }

            // (debug visuals removed)
          }
          onMoveToFolder?.(id, targetId, relativePos)
        } else {
          // Dropped inside the same folder list → snap back to original row coordinate
          setPos(originRef.current)
        }

        // Restore visibility
        if (dragWrap) dragWrap.style.display = ''
        if (nodeRef.current) nodeRef.current.style.display = ''
      }}
    >
      <div
        ref={nodeRef}
        className={"desktop-icon" + (selected ? " selected" : "") + (dragging ? " dragging" : "")}
        style={{ zIndex: dragging ? 10000 : undefined }}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onSelect?.(id, e as unknown as React.MouseEvent);
        }}
        onDoubleClick={() => {
          if (!dragging) onDoubleClick?.(id)
        }}
        onContextMenu={(e: React.MouseEvent) => {
          onSelect?.(id, e as unknown as React.MouseEvent);
        }}
        data-icon-id={id}
        {...(isFolder ? { 'data-folder-id': id } : {})}
      >
        {iconSrc === 'FaGithub' ? (
          <div className="react-icon-wrapper github-icon">
            <FaGithub size={58} color="#181717" />
          </div>
        ) : iconSrc === 'FaLinkedin' ? (
          <div className="react-icon-wrapper linkedin-icon">
            <FaLinkedin size={58} color="#0A66C2" />
          </div>
        ) : (
          <img src={iconSrc} alt={label} />
        )}
        {editing ? (
          <input
            autoFocus
            defaultValue={label}
            className="icon-edit-input"
            onBlur={(e) => onRename?.(id, e.target.value || label)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur()
              }
            }}
          />
        ) : (
          <span>{label}</span>
        )}
      </div>
    </Draggable>
  )
}

export default DesktopIcon 