import type { FSFolder, FSNode } from '../data/fs'
import { addNode, moveNode, removeNode } from '../data/fs'
import { resolvePath } from './pathUtils'

/**
 * Change directory. Returns the id of the target folder if successful, otherwise returns the original id.
 */
export const cd = (root: FSFolder, currentFolderId: string, path: string): string => {
  const target = resolvePath(root, currentFolderId, path)
  if (target && target.type === 'folder') {
    return target.id
  }
  return currentFolderId
}

/**
 * Make directory at the given path. Path may be absolute or relative. Creates the final segment as a new folder inside its parent.
 * Returns updated root tree.
 */
export const mkdir = (root: FSFolder, currentFolderId: string, path: string): FSFolder => {
  // Split into parent path and new folder name
  const normalised = path.replace(/\\/g, '/').trim()
  const segments = normalised.split('/').filter(Boolean)
  const newName = segments.pop()
  if (!newName) return root
  const parentPath = segments.join('/')
  const parentNode = segments.length === 0 ? resolvePath(root, currentFolderId, '.') : resolvePath(root, currentFolderId, parentPath)
  if (!parentNode || parentNode.type !== 'folder') return root
  const newFolder: FSFolder = { id: crypto.randomUUID(), name: newName, type: 'folder', children: [] }
  return addNode(root, parentNode.id, newFolder)
}

/**
 * Move a node from sourcePath to destPath. Destination must be a folder. Returns updated root tree.
 */
export const mv = (root: FSFolder, currentFolderId: string, sourcePath: string, destPath: string): FSFolder => {
  const sourceNode = resolvePath(root, currentFolderId, sourcePath)
  const destNode = resolvePath(root, currentFolderId, destPath)
  if (!sourceNode || !destNode || destNode.type !== 'folder') return root
  return moveNode(root, sourceNode.id, destNode.id)
}

/**
 * Remove (delete) the node at the given path. Returns updated root tree.
 */
export const rm = (root: FSFolder, currentFolderId: string, path: string): FSFolder => {
  const targetNode = resolvePath(root, currentFolderId, path)
  if (!targetNode) return root
  const [newRoot] = removeNode(root, targetNode.id)
  return newRoot
}

/**
 * List directory contents. If path is omitted, uses current directory.
 * Returns array of FSNode children (empty array if path not found or not a folder).
 */
export const ls = (root: FSFolder, currentFolderId: string, path: string = '.'): FSNode[] => {
  const target = resolvePath(root, currentFolderId, path)
  if (target && target.type === 'folder') {
    return target.children
  }
  return []
} 