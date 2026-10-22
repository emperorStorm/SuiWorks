<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount } from 'vue'
import type { Work } from '../../content/types'
import WorkContent from './WorkContent.vue'
import WorkActions from './WorkActions.vue'
const dialog = ref<HTMLDialogElement>()
const selected = ref<Work>()
const title = ref<HTMLElement>()
let trigger: HTMLElement | null = null
let oldOverflow = ''
async function open(work: Work) {
  trigger = document.activeElement as HTMLElement
  selected.value = work
  await nextTick()
  oldOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  dialog.value?.showModal()
  title.value?.focus()
}
function restore() {
  document.body.style.overflow = oldOverflow
  trigger?.focus()
}
function close() { dialog.value?.close() }
onBeforeUnmount(() => { if (dialog.value?.open) { dialog.value.close(); restore() } })
defineExpose({ open })
</script>
<template>
  <dialog ref="dialog" class="drawer" aria-labelledby="preview-title" @close="restore" @click="event => { if (event.target === dialog) close() }">
    <div v-if="selected" class="drawer-panel" :style="{ '--accent': selected.accent, '--accent-soft': selected.accentSoft }"><header class="drawer-head"><button class="drawer-close" type="button" aria-label="关闭预览" @click="close">×</button><div class="drawer-id"><img class="drawer-logo" :src="selected.logo" :alt="selected.logoAlt" width="60" height="60"><div class="drawer-id-text"><p class="drawer-kicker">{{ selected.categoryLabel }} · v{{ selected.version }}</p><h2 id="preview-title" ref="title" class="drawer-title" tabindex="-1">{{ selected.nameZh }}</h2><p class="drawer-sub">{{ selected.nameEn }} · {{ selected.tagline }}</p></div></div></header><div class="drawer-body"><WorkContent :work="selected" /><RouterLink :to="`/work/${selected.slug}/`" class="card-detail">打开完整详情页 →</RouterLink></div><footer class="drawer-actions"><WorkActions :work="selected" /></footer></div>
  </dialog>
</template>
