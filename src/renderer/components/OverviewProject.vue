<template>
  <div class="project px-1 py-1">
    <div class="flex flex-jc-between flex-ai-center">
      <div class="project-name flex-1">
        <p class="font-16">{{project.name}}</p>
        <p class="font-12">{{project.path}}</p>
        <div class="mt-1">
          <selectable-btn icon="ios-play-outline" label="启动" :scripts="startScripts" @click="v => start(project, v)"></selectable-btn>
          <selectable-btn class="ml-2" icon="ios-pause-outline" label="结束" :scripts="stopScripts" @click="v => stop(project, v)"></selectable-btn>
          <i-button class="ml-2 process-btn" icon="ios-folder-outline" size="small" type="text">打开本地目录</i-button>
          <i-button class="ml-2 process-btn" icon="ios-compose-outline" size="small" type="text">在IDE中打开</i-button>
          <i-button class="ml-2 process-btn" icon="ios-information-outline" size="small" type="text"
            @click="$router.push({ name: 'project-log', query: project })">运行日志</i-button>
        </div>
      </div>
      <div class="flex flex-ai-center">
        <!-- 状态:&nbsp;运行中
        <span class="status-dot status-active"></span> -->
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import SelectableBtn from '../components/SelectableBtn'
import { startTask } from '../ipc'
export default {
  props: {
    project: Object
  },
  computed: {
    ...mapGetters(['tasks']),
    startScripts () {
      if (this.tasks[this.project.path]) {
        return this.project.scripts.map(script => {
          if (this.tasks[this.project.path][script] && this.tasks[this.project.path][script].pid) {
            return { script, disabled: true }
          } else {
            return { script }
          }
        })
      } else {
        return this.project.scripts.map(script => { return { script } })
      }
    },
    stopScripts () {
      if (this.tasks[this.project.path]) {
        return Object.keys(this.tasks[this.project.path]).map(script => { return { script } })
      }
      return []
    }
  },
  components: {
    SelectableBtn
  },
  methods: {
    ...mapMutations(['addTask', 'stopTask']),
    start (project, script) {
      const pids = startTask(project.path, [script])
      if (pids && pids[0]) {
        this.addTask({ projectPath: project.path, script, pid: pids[0] })
        this.$Message.success(`线程${pids[0]}正在运行`)
      } else {
        this.$Message.error('Something error')
      }
    },
    stop (projectPath, script) {
      this.stopTask({ projectPath, script })
    }
  }
}
</script>
