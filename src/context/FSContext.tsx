import { createContext, useContext, useEffect, useState } from 'react'
import { initialFS, type FSFolder, type FSNode, addNode, moveNode, removeNode, updateNode } from '../data/fs'

interface FSContextValue {
  fs: FSFolder
  add: (folderId: string, node: FSNode) => void
  move: (nodeId: string, targetFolderId: string) => void
  remove: (nodeId: string) => void
  update: (node: FSNode) => void
  reset: () => void
  positions: Record<string, { x: number; y: number }>
  setPosition: (id: string, pos: { x: number; y: number }) => void
  clearPosition: (id: string) => void
}

const FSContext = createContext<FSContextValue | undefined>(undefined)

const STORAGE_KEY = 'portfolio_fs'
const POS_KEY = 'portfolio_iconPos'
const VERSION_KEY = 'portfolio_fs_version'
const CURRENT_VERSION = '5.0' // Incremented to reflect new desktop structure

export const FSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fs, setFs] = useState<FSFolder>(() => {
    try {
      const savedVersion = localStorage.getItem(VERSION_KEY)
      const saved = localStorage.getItem(STORAGE_KEY)
      
      // If version doesn't match or no version exists, reset to initial
      if (savedVersion !== CURRENT_VERSION || !saved) {
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
        return initialFS
      }
      
      return JSON.parse(saved)
    } catch {
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
      return initialFS
    }
  })

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const savedVersion = localStorage.getItem(VERSION_KEY)
      const saved = localStorage.getItem(POS_KEY)
      
      // If version doesn't match, reset positions too
      if (savedVersion !== CURRENT_VERSION || !saved) {
        return {}
      }
      
      return JSON.parse(saved)
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fs))
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
    } catch {}
  }, [fs])

  useEffect(() => {
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(positions))
    } catch {}
  }, [positions])

  const add = (folderId: string, node: FSNode) => setFs((prev) => addNode(prev, folderId, node))
  const move = (nodeId: string, targetFolderId: string) => setFs((prev) => moveNode(prev, nodeId, targetFolderId))
  const remove = (nodeId: string) => setFs((prev) => removeNode(prev, nodeId)[0])
  const update = (node: FSNode) => setFs((prev) => updateNode(prev, node))
  const reset = () => {
    setFs(initialFS)
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
  }

  const setPosition = (id: string, pos: { x: number; y: number }) => setPositions((prev) => ({ ...prev, [id]: pos }))
  const clearPosition = (id: string) => setPositions((prev) => {
    const { [id]: _, ...rest } = prev
    return rest
  })

  return <FSContext.Provider value={{ fs, add, move, remove, update, reset, positions, setPosition, clearPosition }}>{children}</FSContext.Provider>
}

export const useFS = () => {
  const ctx = useContext(FSContext)
  if (!ctx) throw new Error('useFS must be used within FSProvider')
  return ctx
} 