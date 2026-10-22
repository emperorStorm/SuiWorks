import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { works } from '../content/works'
const seen = new Set<string>()
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message) }
for (const work of works) {
  const label = `[${work.slug}]`
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(work.slug) && !seen.has(work.slug), `${label} slug 格式错误或重复`)
  seen.add(work.slug)
  for (const key of ['nameZh', 'nameEn', 'version', 'tagline', 'summary', 'logoAlt'] as const) assert(work[key].trim(), `${label} ${key} 不能为空`)
  assert(['desktop', 'mobile', 'service'].includes(work.category), `${label} category 无效`)
  assert(['available', 'source', 'soon'].includes(work.download.status), `${label} download.status 无效`)
  assert(work.features.length && work.platforms.length && work.stack.length, `${label} 功能、平台和技术栈不能为空`)
  for (const [key, value] of Object.entries({ ...work.links, download: work.download.url })) {
    if (value === null) continue
    const url = new URL(value)
    assert(url.protocol === 'https:' && !url.username && !url.password, `${label} ${key} 必须是无凭据 HTTPS 地址`)
  }
  for (const color of [work.accent, work.accentSoft]) assert(/^#[a-f0-9]{6}$/i.test(color), `${label} 颜色无效`)
  for (const image of [work.logo, ...work.shots.map(shot => shot.src)]) {
    assert(/^\/(brand|shots)\/[^.][^\s]*$/.test(image) && !image.includes('..'), `${label} 图片路径无效 ${image}`)
    assert(existsSync(resolve('public', image.slice(1))), `${label} 图片不存在 ${image}`)
  }
  for (const shot of work.shots) assert(shot.alt.trim() && shot.width > 0 && shot.height > 0, `${label} 截图说明或尺寸无效`)
}
console.log(`内容校验通过：${works.length} 件作品`)
