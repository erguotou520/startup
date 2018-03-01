<template>
  <div class="m-projects">
    <div ref="projects" class="project-cards">
      <i-card v-for="(project,index) in projects" :key="project.path">
        <p slot="title" class="t-ellipsis pr-4" :title="project.name">{{project.name}}</p>
        <div slot="extra">
          <router-link :to="{ name: 'project-edit', query: project }">
            <i-icon type="edit" size="12"/>
          </router-link>
          <a class="ml-1" href="javascript:void(0)">
            <i-poptip confirm title="确认要移除该项目？" width="200" placement="left"
              @on-ok="removeProject(index)">
              <i-icon type="trash-b" size="12"/>
            </i-poptip>
          </a>
        </div>
        <div class="t-ellipsis font-12" :title="project.path">{{project.path}}</div>
        <div class="mt-1 script font-12 t-ellipsis" :title="project.scripts">
          $ {{project.scripts.join(' && ')}}
        </div>
      </i-card>
    </div>
    <i-card class="add-card flex flex-ai-center flex-jc-center"
      @click.native="$router.push({ name: 'project-add' })">
      <i-icon type="ios-plus-empty" size="48"></i-icon>
    </i-card>
  </div>
</template>
<script>
import Sortable from 'sortablejs'
import { mapGetters, mapMutations } from 'vuex'
export default {
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['projects'])
  },
  methods: {
    ...mapMutations(['removeProject', 'sortProjects'])
  },
  mounted () {
    const _this = this
    this.$nextTick(() => {
      Sortable.create(this.$refs.projects, {
        group: 'projects',
        animation: 300,
        onSort ({ oldIndex, newIndex }) {
          _this.sortProjects([oldIndex, newIndex])
        }
      })
    })
  }
}
</script>
<style lang="stylus">
@import '../assets/styles/variable.styl'
.m-projects
  .ivu-card
    width 31.3%
    margin 1%
    float left
    cursor move
    .ivu-card-body
      height 74px
      *
        user-select initial
    .script
      display inline-block
      max-width 100%
      border-bottom 1px solid $color-logo
  .add-card
    height 127px
    border-style dashed
    border-width 2px
    cursor pointer
</style>
