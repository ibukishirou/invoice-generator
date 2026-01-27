import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Disable host check for sandbox environments
function disableHostCheck(): Plugin {
  return {
    name: 'disable-host-check',
    configureServer(server) {
      const originalListen = server.listen.bind(server)
      server.listen = function(...args) {
        const result = originalListen(...args)
        // Override the host check by patching the middleware
        server.middlewares.stack.unshift({
          route: '',
          handle: (req, _res, next) => {
            // Replace any host with localhost to bypass Vite's host check
            if (req.headers.host && !req.headers.host.startsWith('localhost')) {
              req.headers.host = `localhost:${server.config.server.port || 3000}`
            }
            next()
          }
        })
        return result
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), disableHostCheck()],
  base: process.env.NODE_ENV === 'production' ? '/invoice-generator/' : '/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    hmr: {
      clientPort: 443,
      protocol: 'wss',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
})
