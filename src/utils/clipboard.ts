export type ClipMode = 'copy' | 'cut'

export interface ClipData {
  nodeIds: string[]
  mode: ClipMode
}

let clipboard: ClipData | null = null

export const setClipboard = (data: ClipData | null) => {
  clipboard = data
}

export const getClipboard = (): ClipData | null => clipboard 