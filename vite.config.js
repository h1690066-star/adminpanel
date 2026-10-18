import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

const localGitPushPlugin = () => ({
  name: 'local-git-push',
  configureServer(server) {
    server.middlewares.use('/api/local-git-push', (req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const rootDir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : process.cwd();
            const fullDir = path.resolve(rootDir, '..', 'Full');
            if (fs.existsSync(fullDir)) {
              if (data.content) {
                const jsonPath = path.join(fullDir, 'xon-bozor', 'lib', 'siteContent.json');
                fs.writeFileSync(jsonPath, JSON.stringify(data.content, null, 2), 'utf-8');
              }
              exec('git add . && git commit -m "Auto-update site content from admin panel" && git push origin main', { cwd: fullDir, timeout: 30000 }, (err, stdout, stderr) => {
                res.setHeader('Content-Type', 'application/json');
                if (err) {
                  res.end(JSON.stringify({ success: false, error: stderr || err.message }));
                } else {
                  res.end(JSON.stringify({ success: true, output: stdout }));
                }
              });
              return;
            }
          } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e.message }));
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Full directory not found' }));
        });
      } else {
        res.statusCode = 404;
        res.end();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localGitPushPlugin()],
  server: {
    proxy: {
      '/api/site-content': {
        target: 'https://full-nbal.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://full-nbal.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://full-nbal.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
