import Vue from 'vue'
import { startTask, stopTask } from '../../ipc'
import { isArray } from '../../../shared/utils'
const state = {
  /**
   * {
   *  project: {
   *    script: {
   *      closed: false,
   *      pid,
   *      logs: []
   *    }
   *  }
   * }
   */
  tasks: {},
  /**
   * { pid: task }
   */
  pidMap: {}
}

const mutations = {
  // 初始化设置
  setTasks (state, tasks) {
    Object.assign(state.tasks, tasks)
    Object.keys(state.tasks).forEach(project => {
      Object.keys(state.tasks[project]).forEach(script => {
        Vue.set(state.pidMap, state.tasks[project][script].pid, state.tasks[project][script])
      })
    })
  },
  // 添加任务
  addTask (state, { projectPath, script, pid }) {
    if (!state.tasks[projectPath]) {
      Vue.set(state.tasks, projectPath, { [script]: { pid, logs: [], closed: false }})
    } else {
      if (state.tasks[projectPath][script] && state.tasks[projectPath][script].pid) {
        // 已有相同的任务存在
        return
      } else {
        Vue.set(state.tasks[projectPath], script, { pid, logs: [], closed: false })
      }
    }
    Vue.set(state.pidMap, pid, state.tasks[projectPath][script])
  },
  // 移除任务
  removeTask (state, { projectPath, script }) {
    if (state.tasks[projectPath] && state.tasks[projectPath][script]) {
      Vue.delete(state.pidMap, state.tasks[projectPath][script].pid)
      Vue.delete(state.tasks[projectPath], script)
    }
  },
  // 添加运行日志
  addLog (state, { pid, type, content }) {
    if (type === 'close') {
      state.pidMap[pid].closed = true
    } else {
      state.pidMap[pid].logs.push({ type, content })
    }
  }
}

const actions = {
  // 开启任务，支持多任务
  startTask ({ state, commit }, { projectPath, script }) {
    if (projectPath && script) {
      const scripts = isArray(script) ? script : [script]
      // ipc
      const pids = startTask(projectPath, scripts)
      // commit
      scripts.forEach((s, index) => {
        if (pids[index]) {
          commit('addTask', { projectPath, script: s, pid: pids[index] })
        }
      })
      return pids
    }
    return []
  },
  // 结束任务，支持多任务
  stopTask ({ commit }, { projectPath, script }) {
    if (state.tasks[projectPath] && state.tasks[projectPath][script]) {
      const scripts = isArray(script) ? script : [script]
      scripts.forEach(s => {
        // ipc
        stopTask(state.tasks[projectPath][s].pid)
        // commit
        commit('removeTask', { projectPath, script: s })
      })
    }
  }
}

export default {
  state, mutations, actions,
  getters: {
    tasks: state => state.tasks
  }
}
