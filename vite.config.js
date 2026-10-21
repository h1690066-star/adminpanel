import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { exec, spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import net from 'net'

let backendProcess = null

function ensureBackendRunning() {
  const rootDir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : process.cwd()
  const backendDir = path.resolve(rootDir, '..', 'Full', 'backend')
  const serverFile = path.join(backendDir, 'server.js')

  if (!fs.existsSync(serverFile)) return

  const socket = new net.Socket()
  socket.setTimeout(800)
  socket.once('connect', () => {
    socket.destroy()
  })
  socket.once('error', () => {
    socket.destroy()
    if (!backendProcess) {
      console.log('🚀 Auto-starting Xon Bozor Backend Server on port 5000...')
      backendProcess = spawn('node', ['server.js'], {
        cwd: backendDir,
        stdio: 'ignore',
        detached: true,
      })
      backendProcess.unref()
    }
  })
  socket.connect(5000, '127.0.0.1')
}

const localGitPushPlugin = () => ({
  name: 'local-git-push',
  configureServer(server) {
    ensureBackendRunning()

    server.middlewares.use('/api/local-git-push', (req, res) => {
      if (req.method === 'POST') {
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}')
            const rootDir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : process.cwd()
            const fullDir = path.resolve(rootDir, '..', 'Full')
            const xonBozorDir = path.join(fullDir, 'xon-bozor')
            if (fs.existsSync(xonBozorDir)) {
              if (data.content) {
                const jsonPath = path.join(xonBozorDir, 'lib', 'siteContent.json')
                fs.writeFileSync(jsonPath, JSON.stringify(data.content, null, 2), 'utf-8')
              }
              exec('git add . && git commit -m "Auto-update site content from admin panel" && git push origin main', { cwd: xonBozorDir, timeout: 30000 }, (err, stdout, stderr) => {
                res.setHeader('Content-Type', 'application/json')
                if (err) {
                  res.end(JSON.stringify({ success: false, error: stderr || err.message }))
                } else {
                  res.end(JSON.stringify({ success: true, output: stdout }))
                }
              })
              return
            }
          } catch (e) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: e.message }))
            return
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: 'Full directory not found' }))
        })
      } else {
        res.statusCode = 404
        res.end()
      }
    })
  }
})

export default defineConfig({
  plugins: [react(), tailwindcss(), localGitPushPlugin()],
  server: {
    proxy: {
      '/api/site-content': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
