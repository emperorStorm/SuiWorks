import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const raw = process.env.SITE_URL || env.SITE_URL || ''
  if (raw) {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('SITE_URL 必须是不带凭据、路径、查询或片段的 HTTPS 站点根地址')
    }
  }
  return {
    plugins: [vue()],
    define: { __SITE_URL__: JSON.stringify(raw.replace(/\/$/, '')) },
    ssgOptions: { script: 'async', formatting: 'minify', dirStyle: 'nested' },
  }
})
