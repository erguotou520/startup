<template>
  <div id="app" class="flex over-hide">
    <app-nav/>
    <div class="flex-1 px-1 py-1">
      <div class="px-1 py-1 bg-white scroll-y" style="height:calc(100vh - 16px);">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import AppNav from './components/AppNav'
export default {
  computed: {
    ...mapGetters(['appConfig'])
  },
  components: {
    AppNav
  }
}
</script>
<style lang="stylus">
@import './assets/styles/variable'
@import './assets/base.styl'
</style>
