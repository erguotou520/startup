<template>
  <div class="m-overview">
    <p v-if="!projects.length" class="mt-4 text-center">
      还没有添加任何项目，<router-link :to="{name: 'project-add'}">点击前往添加</router-link>
    </p>
    <template v-else>
      <div class="toolbox">
        <i-button shape="circle" type="primary" icon="play">全部启动</i-button>
        <i-button shape="circle" type="primary" icon="stop">全部关闭</i-button>
      </div>
      <div class="projects mt-1">
        <overview-project v-for="project in projects" :key="project.path" :project="project" class="mb-1"></overview-project>
      </div>
    </template>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import OverviewProject from '../components/OverviewProject'
export default {
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['projects'])
  },
  components: {
    OverviewProject
  }
}
</script>
<style lang="stylus">
@import '../assets/styles/variable'
.m-overview
  .project
    border 1px solid #e4e4e4
    border-radius 4px
    box-shadow 1px 1px 4px rgba(0, 0, 0, .1)
    .status-dot
      display inline-block
      width 8px
      height @width
      margin-left 4px
      border-radius 50%
      &.status-active
        background-color $color-success
</style>
