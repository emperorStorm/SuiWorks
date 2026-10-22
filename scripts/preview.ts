import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
const root = resolve('dist')
const types: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' }
const port = Number(process.env.PORT || 4173)
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url!, 'http://localhost').pathname)
    let file = resolve(root, `.${path}`)
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return }
    let status = 200
    try {
      if ((await stat(file)).isDirectory()) {
        if (!path.endsWith('/')) { res.writeHead(301, { Location: `${path}/` }).end(); return }
        file = resolve(file, 'index.html')
      }
      await stat(file)
    } catch { status = 404; file = resolve(root, '404.html') }
    const body = await readFile(file)
    res.writeHead(status, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' })
    res.end(body)
  } catch { res.writeHead(400).end('请求无效') }
}).listen(port, '127.0.0.1', () => console.log(`静态产物预览：http://127.0.0.1:${port}`))
