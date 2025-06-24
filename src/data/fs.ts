/*
 * In-memory pseudo file system model for the portfolio desktop.
 * Phase 3.1 – provides types + pure helpers (no React yet).
 */

export type FSItemType = 'folder' | 'file' | 'exe' | 'html'

export interface FSNodeBase<T extends FSItemType = FSItemType> {
  id: string
  name: string
  type: T
  protected?: boolean // Mark system-critical items as protected
}

export interface FSFile extends FSNodeBase<'file' | 'exe' | 'html'> {
  payload?: any // url, route, etc.
}

export interface FSFolder extends FSNodeBase<'folder'> {
  children: FSNode[]
}

export type FSNode = FSFolder | FSFile

// -------------------- Initial seed --------------------

export const initialFS: FSFolder = {
  id: 'root',
  name: 'JorgeOS',
  type: 'folder',
  protected: true,
  children: [
    {
      id: 'program-files',
      name: 'Program Files',
      type: 'folder',
      protected: true,
      children: [
        {
          id: 'internet-explorer',
          name: 'Internet Explorer',
          type: 'folder',
          protected: true,
          children: [
            {
              id: 'ie-exe',
              name: 'iexplore.exe',
              type: 'file',
              protected: true,
              payload: { content: 'This browser is so old it belongs in a museum 🦕' }
            }
          ]
        },
        {
          id: 'windows-defender',
          name: 'Windows Defender',
          type: 'folder',
          protected: true,
          children: [
            {
              id: 'defender-exe',
              name: 'MSASCuiL.exe',
              type: 'file',
              protected: true,
              payload: { content: 'Virus detected: Your sense of humor 😄' }
            }
          ]
        },
        {
          id: 'adobe-reader',
          name: 'Adobe Reader',
          type: 'folder',
          protected: true,
          children: [
            {
              id: 'adobe-exe',
              name: 'AcroRd32.exe',
              type: 'file',
              protected: true,
              payload: { content: 'Please update Adobe Reader to continue breathing 💀' }
            }
          ]
        }
      ]
    },
    {
      id: 'users',
      name: 'Users',
      type: 'folder',
      protected: true,
      children: [
        {
          id: 'admin',
          name: 'Admin',
          type: 'folder',
          protected: true,
          children: [
            {
              id: 'login-credentials',
              name: 'login_credentials.txt',
              type: 'html',
              protected: true,
              payload: { route: '/credentials' }
            },
            {
              id: 'desktop-folder',
              name: 'Desktop',
              type: 'folder',
              protected: true,
              children: [
                {
                  id: 'projects',
                  name: 'My Projects',
                  type: 'folder',
                  children: [
                    {
                      id: 'trade-a-pixel',
                      name: 'Trade a pixel',
                      type: 'html',
                      payload: { route: '/tradeapixel.html' },
                    },
                    {
                      id: 'scholarseed',
                      name: 'Scholarseed',
                      type: 'html',
                      payload: { route: '/scholarseed.html' },
                    },
                  ],
                },
                {
                  id: 'about',
                  name: 'About Me',
                  type: 'folder',
                  children: [
                    {
                      id: 'my-education',
                      name: 'My education',
                      type: 'html',
                      payload: { route: '/my-education.html' },
                    },
                    {
                      id: 'my-hobbies',
                      name: 'My hobbies',
                      type: 'html',
                      payload: { route: '/my-hobbies.html' },
                    },
                    {
                      id: 'my-stack',
                      name: 'My stack',
                      type: 'html',
                      payload: { route: '/my-stack.html' },
                    },
                  ],
                },
                {
                  id: 'recycle',
                  name: 'Recycle Bin',
                  type: 'folder',
                  children: [],
                },
                {
                  id: 'github',
                  name: 'GitHub Profile',
                  type: 'exe',
                  payload: { url: 'https://github.com/jorge-caz' },
                },
                {
                  id: 'linkedin',
                  name: 'LinkedIn Profile',
                  type: 'exe',
                  payload: { url: 'https://linkedin.com/in/jorge-luis-cazares' },
                }
              ]
            },
            {
              id: 'documents-folder',
              name: 'Documents',
              type: 'folder',
              protected: true,
              children: [
                {
                  id: 'todo-list',
                  name: 'TODO.txt',
                  type: 'file',
                  payload: { content: '1. Build portfolio ✓\n2. Get hired\n3. Buy more coffee ☕' }
                }
              ]
            }
          ]
        },
        {
          id: 'guest',
          name: 'Guest',
          type: 'folder',
          protected: true,
          children: [
            {
              id: 'guest-readme',
              name: 'README.txt',
              type: 'file',
              payload: { content: 'Welcome guest! Please don\'t break anything 🙏' }
            }
          ]
        }
      ]
    },
    {
      id: 'windows',
      name: 'Windows',
      type: 'folder',
      protected: true,
      children: [
        {
          id: 'system32',
          name: 'System32',
          type: 'folder',
          protected: true,
          children: [
            {
              id: 'calc-exe',
              name: 'calc.exe',
              type: 'file',
              protected: true,
              payload: { content: '2+2=5 (for very large values of 2) 🤔' }
            },
            {
              id: 'notepad-exe',
              name: 'notepad.exe',
              type: 'file',
              protected: true,
              payload: { content: 'Hello World!\n\n...that\'s all I know how to do 📝' }
            },
            {
              id: 'paint-exe',
              name: 'mspaint.exe',
              type: 'file',
              protected: true,
              payload: { content: 'MS Paint: Where artistic dreams come to die 🎨💀' }
            },
            // --- Dummy system files ---
            ...Array.from({ length: 100 }).map(() => {
              const hex = Math.floor(Math.random()*0xffffffff).toString(16).padStart(8,'0')
              return {
                id: `sysfile-${hex}`,
                name: `${hex}.dll`,
                type: 'file' as const,
                protected: true,
                payload: { content: 'system-error', message: 'File is not executable!' }
              }
            }),
          ]
        }
      ]
    }
  ],
}

// Create This PC as a reference structure for Explorer navigation
export const thisPcStructure: FSFolder = {
  id: 'this-pc',
  name: 'This PC',
  type: 'folder',
  protected: true,
  children: [
    {
      id: 'jorgeos-c',
      name: 'JorgeOS (C:)',
      type: 'folder',
      protected: true,
      children: [] // This references the main FS structure
    }
  ]
}

// -------------------- Helper functions --------------------

/** Depth-first search for a node with matching id */
export const findNode = (root: FSFolder, id: string): FSNode | null => {
  if (root.id === id) return root
  for (const child of root.children) {
    if (child.id === id) return child
    if (child.type === 'folder') {
      const found = findNode(child, id)
      if (found) return found
    }
  }
  
  // If not found in main tree, search in thisPcStructure
  if (root.id === 'root') {
    const thisPcResult = findNodeInThisPC(id)
    if (thisPcResult) return thisPcResult
  }
  
  return null
}

/** Helper function to search specifically in This PC structure */
const findNodeInThisPC = (id: string): FSNode | null => {
  if (thisPcStructure.id === id) return thisPcStructure
  
  // Special handling for jorgeos-c to redirect to main FS root
  if (id === 'jorgeos-c') {
    return initialFS
  }
  
  for (const child of thisPcStructure.children) {
    if (child.id === id) return child
    if (child.type === 'folder') {
      const found = findNode(child, id)
      if (found) return found
    }
  }
  return null
}

/** Immutable update: replace target node */
export const updateNode = (root: FSFolder, updated: FSNode): FSFolder => {
  if (root.id === updated.id) return updated as FSFolder // root replacement (rare)
  return {
    ...root,
    children: root.children.map((c) => {
      if (c.id === updated.id) return updated
      return c.type === 'folder' ? updateNode(c, updated) : c
    }),
  }
}

/** Add new node to target folder (returns new tree) */
export const addNode = (root: FSFolder, folderId: string, node: FSNode): FSFolder => {
  if (root.id === folderId) {
    if (root.type !== 'folder') throw new Error('Target is not a folder')
    return { ...root, children: [...root.children, node] }
  }
  return {
    ...root,
    children: root.children.map((c) => (c.type === 'folder' ? addNode(c, folderId, node) : c)),
  }
}

/** Remove node by id (returns tuple of [newRoot, removedNode]) */
export const removeNode = (root: FSFolder, id: string): [FSFolder, FSNode | null] => {
  const idx = root.children.findIndex((c) => c.id === id)
  if (idx !== -1) {
    const removed = root.children[idx]
    return [{ ...root, children: [...root.children.slice(0, idx), ...root.children.slice(idx + 1)] }, removed]
  }
  let removed: FSNode | null = null
  const newChildren = root.children.map((c) => {
    if (c.type !== 'folder') return c
    const [newChild, rem] = removeNode(c, id)
    if (rem) removed = rem
    return newChild
  })
  return [{ ...root, children: newChildren }, removed]
}

/** Move node into another folder */
export const moveNode = (root: FSFolder, nodeId: string, targetFolderId: string): FSFolder => {
  const [without, node] = removeNode(root, nodeId)
  if (!node) return root
  return addNode(without, targetFolderId, node)
} 