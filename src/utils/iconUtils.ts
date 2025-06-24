import type { FSNode } from '../data/fs'

export const getIconForNode = (node: FSNode): string | React.ComponentType => {
  // Special cases by ID - return React components for social media
  if (node.id === 'recycle') return '/icons/recycle-bin.svg'
  if (node.id === 'github') return 'FaGithub' // Return component identifier
  if (node.id === 'linkedin') return 'FaLinkedin' // Return component identifier
  if (node.id === 'resume') return '/icons/clipboard.svg'
  if (node.id === 'my-education') return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📚</text></svg>'
  if (node.id === 'my-hobbies') return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎹</text></svg>'
  if (node.id === 'my-stack') return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👾</text></svg>'
  if (node.id === 'scholarseed') return '/icons/document.svg'
  if (node.id === 'trade-a-pixel') return '/icons/document.svg'
  
  // General cases by type
  if (node.type === 'folder') return '/icons/folder.svg'
  if (node.type === 'exe') return '/icons/gear.svg'
  if (node.type === 'html') return '/icons/globe.svg'
  if (node.type === 'file') return '/icons/document.svg'
  
  return '/icons/document.svg' // fallback
} 