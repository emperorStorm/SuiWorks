<script setup lang="ts">
import type { Work } from '../../content/types'
defineProps<{ work: Work; compact?: boolean }>()
</script>
<template>
  <div class="work-content">
    <section class="drawer-section"><p class="drawer-summary">{{ work.summary }}</p></section>
    <section class="drawer-section"><h2 class="drawer-label">能力清单 <span>CAPABILITIES</span></h2><ol class="capability-list"><li v-for="(feature, index) in work.features" :key="feature"><span>{{ String(index + 1).padStart(2, '0') }}</span><p>{{ feature }}</p></li></ol></section>
    <div class="drawer-meta-grid"><section><h2 class="drawer-label">平台与形态 <span>PLATFORMS</span></h2><ul class="chip-list"><li v-for="platform in work.platforms" :key="platform">{{ platform }}</li></ul><p class="drawer-local">{{ work.localFirst ? '本地优先：核心数据默认保存在自己的设备上。' : '需要服务端支持：数据与能力由作品自身的服务提供。' }}</p></section><section><h2 class="drawer-label">技术栈 <span>STACK</span></h2><p class="stack-line">{{ work.stack.join(' · ') }}</p></section></div>
    <section class="drawer-section"><h2 class="drawer-label">界面一览 <span>PREVIEW</span></h2><div v-if="work.shots.length" class="shot-list"><figure v-for="shot in work.shots" :key="shot.src"><img :src="shot.src" :alt="shot.alt" :width="shot.width" :height="shot.height" loading="lazy" decoding="async"><figcaption>{{ shot.alt }}</figcaption></figure></div><div v-else class="shot-empty"><span>NO PREVIEW YET</span><p>暂无界面截图</p><small>可前往仓库查看项目说明。</small></div></section>
  </div>
</template>
