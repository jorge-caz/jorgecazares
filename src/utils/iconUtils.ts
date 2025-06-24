import type { FSNode } from '../data/fs'

const asset = (relativePath: string) => `${import.meta.env.BASE_URL}${relativePath.replace(/^\/+/, '')}`

export const getIconForNode = (node: FSNode): string => {
  // Special cases by ID - return React components for social media
  if (node.id === 'recycle') return asset('icons/recycle-bin.svg')
  if (node.id === 'github') return 'FaGithub' // Return component identifier
  if (node.id === 'linkedin') return 'FaLinkedin' // Return component identifier
  if (node.id === 'resume') return asset('icons/clipboard.svg')
  if (node.id === 'my-education') return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📚</text></svg>'
  if (node.id === 'my-hobbies') return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎹</text></svg>'
  if (node.id === 'my-stack') return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👾</text></svg>'
  if (node.id === 'scholarseed') return asset('icons/document.svg')
  if (node.id === 'trade-a-pixel') return asset('icons/document.svg')
  
  // General cases by type
  if (node.type === 'folder') return asset('icons/folder.svg')
  if (node.type === 'exe') return asset('icons/gear.svg')
  if (node.type === 'html') return asset('icons/globe.svg')
  if (node.type === 'file') return asset('icons/document.svg')
  
  return asset('icons/document.svg') // fallback
} 