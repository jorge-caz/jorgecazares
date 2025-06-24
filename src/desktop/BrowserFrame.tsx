import React from 'react'

interface BrowserFrameProps {
  route: string
}

const BrowserFrame: React.FC<BrowserFrameProps> = ({ route }) => {
  return (
    <iframe
      src={route}
      style={{ border: 'none', width: '100%', height: '100%' }}
      title={route}
    />
  )
}

export default BrowserFrame 