export type DesktopNodeType = 'folder' | 'exe' | 'html'

export interface DesktopNode {
  id: string
  label: string
  icon: string // path in public or imported asset
  position: { x: number; y: number }
  type: DesktopNodeType
  /** For exe type */
  url?: string
  /** For html type – internal route */
  route?: string
}

export const desktopNodes: DesktopNode[] = [
  {
    id: 'projects',
    label: 'My Projects',
    icon: '/vite.svg', // TODO: replace with folder icon
    position: { x: 0, y: 0 },
    type: 'folder',
  },
  {
    id: 'about',
    label: 'About Me',
    icon: '/vite.svg',
    position: { x: 80, y: 0 },
    type: 'html',
    route: '/about',
  },
] 