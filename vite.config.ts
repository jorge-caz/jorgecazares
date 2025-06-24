import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to alias friendly routes to their static HTML files during dev
const htmlAliasPlugin = () => ({
  name: 'html-friendly-routes',
  configureServer(server: any) {
    server.middlewares.use((req: any, _res: any, next: any) => {
      if (req.url === '/credentials') {
        req.url = '/credentials.html'
      }
      next()
    })
  }
})

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), htmlAliasPlugin()],
  base: command === 'serve' ? '/' : '/jorgecazares/'
}))
