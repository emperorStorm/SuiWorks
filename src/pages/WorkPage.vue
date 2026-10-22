<script setup lang="ts">
import { works } from '../../content/works'
import WorkContent from '../components/WorkContent.vue'
import WorkActions from '../components/WorkActions.vue'
import { useSeo } from '../seo'
const props = defineProps<{ slug: string }>()
const work = works.find(work => work.slug === props.slug)!
useSeo(work.nameZh, work.summary, `/work/${work.slug}/`)
</script>
<template>
  <article class="container work-page" :style="{ '--accent': work.accent, '--accent-soft': work.accentSoft }"><RouterLink class="back-link" to="/#works">← 返回全部作品</RouterLink><header class="work-page-head"><img :src="work.logo" :alt="work.logoAlt" width="84" height="84"><div><p class="section-kicker">{{ work.categoryLabel }} · v{{ work.version }}</p><h1>{{ work.nameZh }}</h1><p class="work-subtitle">{{ work.nameEn }} · {{ work.tagline }}</p></div></header><WorkContent :work="work" /><WorkActions :work="work" /></article>
</template>
