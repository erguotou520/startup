<template>
  <div class="project px-1 py-1">
    <div class="flex flex-jc-between flex-ai-center">
      <div class="project-name flex-1">
        <p class="font-16">{{project.name}}</p>
        <p class="font-12">{{project.path}}</p>
        <div class="mt-1">
          <selectable-btn icon="ios-play-outline" label="启动" :scripts="startableScripts" @click="v => start(project.path, v)"></selectable-btn>
          <selectable-btn class="ml-2" icon="ios-pause-outline" label="结束" :scripts="stopableScripts" @click="v => stop(project.path, v)"></selectable-btn>
          <i-button class="ml-2 process-btn" icon="ios-folder-outline" size="small" type="text" @click="openFolder(project.path)">打开本地目录</i-button>
          <i-button class="ml-2 process-btn" icon="ios-compose-outline" size="small" type="text" @click="openIDE(project.path)">在IDE中打开</i-button>
          <i-button class="ml-2 process-btn" icon="ios-information-outline" size="small" type="text"
            @click="$router.push({ name: 'project-log', query: project })">运行日志</i-button>
        </div>
      </div>
      <div v-show="status.text" class="flex flex-ai-center">
        状态:&nbsp;{{status.text}}
        <span class="status-dot" :class="[`status-${status.value}`]"></span>
      </div>
    </div>
  </div>
</template>
<script>
import { shell } from 'electron'
import { mapGetters, mapActions } from 'vuex'
import SelectableBtn from '../components/SelectableBtn'
import { openInIDE } from '../ipc'
export default {
  props: {
    project: Object
  },
  computed: {
    ...mapGetters(['tasks']),
    // 可启动的脚本
    startableScripts () {
      if (this.tasks[this.project.path]) {
        return this.project.scripts.map(script => {
          const _script = this.tasks[this.project.path][script]
          if (_script && _script.pid && !_script.closed) {
            return { script, disabled: true }
          } else {
            return { script }
          }
        })
      } else {
        return this.project.scripts.map(script => { return { script } })
      }
    },
    // 可结束的脚本
    stopableScripts () {
      if (this.tasks[this.project.path]) {
        const scripts = []
        Object.keys(this.tasks[this.project.path]).forEach(script => {
          const _script = this.tasks[this.project.path][script]
          if (_script && !_script.closed) {
            scripts.push({ script })
          }
        })
        return scripts
      }
      return []
    },
    status () {
      const activeS = { value: 'active', text: '运行中' }
      const noneS = { value: 'none', text: '' }
      if (this.tasks[this.project.path]) {
        return Object.keys(this.tasks[this.project.path]).some(script => {
          const _script = this.tasks[this.project.path][script]
          return _script && _script.pid && !_script.closed
        }) ? activeS : noneS
      }
      return noneS
    }
  },
  components: {
    SelectableBtn
  },
  methods: {
    ...mapActions(['startTask', 'stopTask']),
    start (projectPath, script) {
      this.startTask({ projectPath, script }).then(pids => {
        if (!pids.length) {
          this.$Message.error('命令执行出错')
        } else {
          pids.forEach(pid => {
            if (pid) {
              this.$Message.success(`线程${pids[0]}正在运行`)
            } else {
              this.$Message.error('命令执行出错')
            }
          })
        }
      })
    },
    stop (projectPath, script) {
      this.stopTask({ projectPath, script })
    },
    openFolder (projectPath) {
      shell.openExternal(projectPath)
    },
    openIDE (projectPath) {
      openInIDE(projectPath)
    }
  }
}
</script>
