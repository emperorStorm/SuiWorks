<script setup lang="ts">
import AboutSection from '../components/AboutSection.vue'
import { useSeo } from '../seo'
useSeo('关于工坊', '一个人的软件工坊，偏爱本地优先、一物一用和长期维护。', '/about/')
</script>
<template><div class="about-page"><div class="container"><h1 class="page-title">关于岁序工坊</h1></div><AboutSection /></div></template>
