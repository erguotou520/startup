<template>
  <div class="m-project-log">
    <module-header>
      {{$route.query.name}}
    </module-header>
    <i-tabs type="card" @on-click="onTabClick">
      <i-tab-pane class="pos-r" v-for="(task,script) in currentTasks" :key="script" :label="script">
        <div class="action-btns">
          <i-button shape="circle" size="small" icon="ios-reload"
            @click="restart(script)">restart</i-button>
          <i-button class="ml-1" shape="circle" size="small"
            :disabled="tasks[$route.query.path][script].closed"
            icon="ios-close-empty" @click="cancel(script)">cancel</i-button>
        </div>
        <div class="log-contents px-1 py-1 scroll-y" :ref="`log-${script}`">
          <span v-for="(log,index) in task.logs" :key="index" class="log" v-html="convert2html(log.content)"></span>
          <div class="cursor">&nbsp;</div>
        </div>
      </i-tab-pane>
      <i-tab-pane name="__add__" :disabled="!restScripts.length"
        :label="h=>h('i-icon', { props: { type: 'plus' }, staticClass: 'text-center', style: { 'margin-right': 0}})"></i-tab-pane>
    </i-tabs>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import ansi2html from '../ansi2html'
export default {
  computed: {
    ...mapGetters(['tasks']),
    currentTasks () {
      return this.tasks[this.$route.query.path]
    },
    restScripts () {
      if (!this.currentTasks) {
        return this.$route.query.scripts.slice()
      }
      return this.$route.query.scripts.filter(script => !this.currentTasks[script])
    }
  },
  methods: {
    ...mapActions(['stopTask']),
    onTabClick (name) {
      if (name === '__add__') {
        console.log('add')
      }
    },
    convert2html (logContent) {
      return ansi2html(`${logContent}`)
    },
    cancel (script) {
      this.stopTask({ projectPath: this.$route.query.path, script })
    }
  }
}
</script>
<style lang="stylus">
@import '../assets/styles/variable.styl'
.m-project-log
  @keyframes blink {
    50% {
      visibility hidden
    }
    100% {
      visibility visible
    }
  }
  .action-btns
    position absolute
    top 8px
    right @top
    .ivu-btn
      opacity .5
      transition all .3s
      &:hover
        color $color-content
        opacity .9
        border 1px solid transparent
  .log-contents
    max-height 318px
    background-color #383838
    color #f1f1f1
    font-family Consolas, Monaco, monospace
    font-size 12px
    letter-spacing .5px
    white-space pre-wrap
    .log
      user-select text
    .cursor
      width 4px
      line-height 1
      background-color #fff
      visibility hidden
      animation blink 2s linear infinite
</style>

