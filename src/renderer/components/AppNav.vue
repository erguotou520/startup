<template>
  <div class="app-nav flex flex-column flex-ai-center pb-2">
    <div class="logo flex flex-ai-center px-1 py-1">
      <img src="../assets/logo.png" width="40">
    </div>
    <i-menu theme="dark" :active-name="routerName"
      width="56px" @on-select="go">
      <i-menu-item name="overview">概览</i-menu-item>
      <i-menu-item name="projects">项目</i-menu-item>
      <i-menu-item name="git">Git</i-menu-item>
      <i-menu-item name="settings">设置</i-menu-item>
    </i-menu>
    <div class="nav-bottom mt-auto flex flex-column flex-ai-center">
      <i-avatar icon="person"></i-avatar>
      <external-link href="https://github.com/erguotou520/startup">
        <i-icon class="mt-1" type="help" size="14" color="#e4e4e4"></i-icon>
      </external-link>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      routerName: 'overview'
    }
  },
  watch: {
    '$route.name': {
      immediate: true,
      handler (v) {
        if (/^project/.test(v)) {
          this.routerName = 'projects'
        } else {
          this.routerName = v
        }
      }
    }
  },
  methods: {
    go (name) {
      this.$router.push({ name })
    }
  }
}
</script>
<style lang="stylus">
@import '../assets/styles/variable'
.app-nav
  background-color #495060
  .ivu-menu-item
    padding-left 0
    padding-right 0
    text-align center
    &.ivu-menu-item-active
    &.ivu-menu-item-selected
      color #fff !important
      background-color $color-logo !important
      border-right none !important
</style>
