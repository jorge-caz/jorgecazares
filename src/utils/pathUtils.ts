import type { FSFolder, FSNode } from '../data/fs'

/**
 * Find the path from the root to the node with the given id, expressed as an array of node names.
 * Returns null if the node cannot be found.
 */
const findPathNames = (root: FSFolder, targetId: string, path: string[] = []): string[] | null => {
  if (root.id === targetId) return [...path, root.name]

  for (const child of root.children) {
    if (child.id === targetId) {
      return [...path, root.name, child.name]
    }
    if (child.type === 'folder') {
      const found = findPathNames(child, targetId, [...path, root.name])
      if (found) return found
    }
  }
  return null
}

/**
 * Convert a node id to an absolute Windows-style path (e.g. C:\\Users\\Admin). The drive root is assumed to be the
 * JorgeOS folder (id: 'root').
 */
export const getAbsolutePath = (root: FSFolder, nodeId: string): string => {
  const names = findPathNames(root, nodeId)
  if (!names) return 'C:/'
  // Drop the root name to start paths at drive root
  const trimmed = names.slice(1)
  if (trimmed.length === 0) return 'C:/'
  return 'C:/' + trimmed.join('/')
}

/**
 * Resolve a path (absolute or relative) to a node within the FS. Returns the node if found, otherwise null.
 * Relative paths are resolved with respect to the folder identified by currentFolderId.
 */
export const resolvePath = (root: FSFolder, currentFolderId: string, path: string): FSNode | null => {
  // Normalise path separators
  const normalised = path.replace(/\\/g, '/').trim()

  // Determine starting point
  let segments: string[]
  let cursor: FSNode | null = null
  if (normalised.startsWith('C:/') || normalised.startsWith('C:')) {
    segments = normalised.replace(/^C:\//, '').replace(/^C:/, '').split('/').filter(Boolean)
    cursor = root
  } else if (normalised.startsWith('/')) {
    segments = normalised.slice(1).split('/').filter(Boolean)
    cursor = root
  } else {
    segments = normalised.split('/').filter(Boolean)
    // start at current folder
    cursor = findNodeById(root, currentFolderId)
  }

  if (!cursor) return null
  let current: FSNode = cursor

  // Walk through each path segment
  for (const seg of segments) {
    if (seg === '.') continue
    if (seg === '..') {
      const parent = findParent(root, (current as FSNode).id)
      if (!parent) return null
      current = parent
      continue
    }

    if (current.type !== 'folder') return null
    const folderCurrent = current as FSFolder
    const next = folderCurrent.children.find((c: FSNode) => c.name === seg)
    if (!next) return null
    current = next
  }
  return current
}

// ---------------- internal helpers ----------------

const findNodeById = (root: FSFolder, id: string): FSNode | null => {
  if (root.id === id) return root
  for (const child of root.children) {
    if (child.id === id) return child
    if (child.type === 'folder') {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }
  return null
}

const findParent = (root: FSFolder, childId: string): FSFolder | null => {
  for (const child of root.children) {
    if (child.id === childId) return root
    if (child.type === 'folder') {
      const found = findParent(child, childId)
      if (found) return found
    }
  }
  return null
} 