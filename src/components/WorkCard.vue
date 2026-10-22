<script setup lang="ts">
import type { Work } from '../../content/types'
defineProps<{ work: Work; index: number }>()
defineEmits<{ preview: [work: Work] }>()
</script>
<template>
  <article class="work-card" :data-slug="work.slug" :data-category="work.category" :style="{ '--accent': work.accent, '--accent-soft': work.accentSoft }">
    <RouterLink class="card-hit" :to="`/work/${work.slug}/`" tabindex="-1" aria-hidden="true" />
    <div class="card-inner"><div class="card-top"><span class="card-logo"><img :src="work.logo" :alt="work.logoAlt" width="40" height="40" loading="lazy"></span><span class="card-index">{{ String(index + 1).padStart(2, '0') }}</span></div><div class="card-heading"><h3><RouterLink :to="`/work/${work.slug}/`">{{ work.nameZh }}</RouterLink></h3><p class="card-en">{{ work.nameEn }} <span>v{{ work.version }}</span></p></div><p class="card-tagline">{{ work.tagline }}</p><ul class="card-tags"><li v-for="tag in work.featureTags" :key="tag">{{ tag }}</li></ul><p class="card-platforms"><span class="card-category">{{ work.categoryLabel }}</span><span class="card-sep">/</span><span>{{ work.platforms.join(' · ') }}</span></p><div class="card-actions"><RouterLink class="card-detail" :to="`/work/${work.slug}/`">详情</RouterLink><button class="card-detail preview-button" type="button" :aria-label="`快速预览${work.nameZh}`" @click="$emit('preview', work)">预览</button><span v-if="work.download.status === 'soon'" class="card-download is-disabled" aria-disabled="true">{{ work.download.label }}</span><a v-else class="card-download" :href="work.download.url" target="_blank" rel="noopener noreferrer">{{ work.download.label }} ↗</a></div></div>
  </article>
</template>
