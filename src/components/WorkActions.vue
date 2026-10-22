<script setup lang="ts">
import type { Work } from '../../content/types'
defineProps<{ work: Work }>()
</script>
<template>
  <div class="work-actions">
    <span v-if="work.download.status === 'soon'" class="btn btn-primary is-disabled" aria-disabled="true">{{ work.download.label }}</span><a v-else class="btn btn-primary" :href="work.download.url" target="_blank" rel="noopener noreferrer">{{ work.download.label }} ↗</a>
    <a class="btn btn-ghost" :href="work.links.repo" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a v-if="work.links.demo" class="btn btn-ghost" :href="work.links.demo" target="_blank" rel="noopener noreferrer">在线原型 ↗</a>
    <p class="drawer-action-note">{{ work.download.note }}</p>
  </div>
</template>
