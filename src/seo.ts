import { useHead } from '@unhead/vue'
export function useSeo(title: string, description: string, path: string, noindex = false) {
  const canonical = __SITE_URL__ ? `${__SITE_URL__}${path}` : ''
  useHead({
    title: `${title} · 岁序工坊 SuiWorks`,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: `${title} · 岁序工坊 SuiWorks` },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'zh_CN' },
      ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
      ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
    ],
    link: canonical ? [{ rel: 'canonical', href: canonical }] : [],
  })
}
