import { readFile, writeFile, copyFile, access, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { loadEnv } from 'vite'
import { works } from '../content/works'
const env = loadEnv('production', process.cwd(), '')
const site = (process.env.SITE_URL || env.SITE_URL || '').replace(/\/$/, '')
const routes = ['/', '/about/', ...works.map(work => `/work/${work.slug}/`)]
for (const route of routes) {
  const html = await readFile(join('dist', route, 'index.html'), 'utf8')
  if (!html.includes('<h1') || !html.includes('name="description"')) throw new Error(`预渲染内容或元数据缺失：${route}`)
  if (site && !html.includes(`${site}${route}`)) throw new Error(`正式域名元数据缺失：${route}`)
}
await copyFile('dist/404/index.html', 'dist/404.html')
const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]!)
await writeFile('dist/robots.txt', site ? `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n')
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${site ? routes.map(route => `<url><loc>${escapeXml(site + route)}</loc></url>`).join('') : ''}</urlset>\n`)
async function checkAssets(dir: string) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name)
    if (entry.isDirectory()) await checkAssets(file)
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(file, 'utf8')
      for (const match of html.matchAll(/(?:src|href)="(\/(?:assets|brand|shots)\/[^"?#]+)(?:[?#][^"]*)?"/g)) await access(join('dist', match[1]))
    }
  }
}
await checkAssets('dist')
await rm('dist/.vite', { recursive: true, force: true })
console.log(`静态产物校验通过：${routes.length} 个页面 + 404，资源完整`)
if (!site) console.warn('未设置 SITE_URL：可本地预览和打包，robots 禁止收录；正式上线前请设置 HTTPS 域名重新构建。')
