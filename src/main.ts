import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import WorkPage from './pages/WorkPage.vue'
import NotFound from './pages/NotFound.vue'
import { works } from '../content/works'
import './styles/prototype.css'
import './styles/app.css'

export const createApp = ViteSSG(App, {
  routes: [
    { path: '/', component: Home },
    { path: '/about/', component: About },
    ...works.map(work => ({ path: `/work/${work.slug}/`, component: WorkPage, props: { slug: work.slug } })),
    { path: '/404', component: NotFound },
    { path: '/:pathMatch(.*)*', component: NotFound },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash && !to.hash.startsWith('#product=')) return { el: to.hash, top: 90 }
    if (to.path === from.path) return false
    return { top: 0 }
  },
}, ({ router, isClient }) => {
  if (isClient) router.isReady().then(() => {
    const hash = router.currentRoute.value.hash
    if (hash.startsWith('#product=')) {
      const slug = hash.slice('#product='.length)
      if (works.some(work => work.slug === slug)) router.replace(`/work/${slug}/`)
    }
  })
})
