import Desktop from './desktop/Desktop'
import { FSProvider } from './context/FSContext'

function App() {
  return (
    <FSProvider>
      <Desktop />
    </FSProvider>
  )
}

export default App
