<template>
    <TVChartContainer />
  </template>

<script>
import TVChartContainer from './components/TVChartContainer.vue'
import { version } from '../public/charting_library'

export default {
  name: 'app',
  components: {
    TVChartContainer
  },
  data() {
    return { version: version() }
  }
}
</script>

<style lang="scss" scoped>
</style>
