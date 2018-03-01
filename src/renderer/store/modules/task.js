import { stopTask } from '../../ipc'
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
  pidMap: {}
}

const mutations = {
  setTasks (state, tasks) {
    Object.assign(state.tasks, tasks)
    Object.keys(state.tasks).forEach(project => {
      Object.keys(state.tasks[project]).forEach(script => {
        state.pidMap[state.tasks[project][script].pid] = state.tasks[project][script]
      })
    })
  },
  addTask (state, { projectPath, script, pid }) {
    if (!state.tasks[projectPath]) {
      state.tasks[projectPath] = { [script]: { pid, logs: [], closed: false }}
    } else {
      if (state.tasks[projectPath][script] && state.tasks[projectPath][script].pid) {
        // 已有相同的任务存在
        return false
      } else {
        state.tasks[projectPath][script] = { pid, logs: [], closed: false }
      }
    }
    state.pidMap[pid] = state.tasks[projectPath][script]
  },
  removeTask (state, { projectPath, script }) {
    if (state.tasks[projectPath] && state.tasks[projectPath][script]) {
      delete state.tasks[projectPath][script]
    }
  },
  addLog (state, { pid, type, content }) {
    if (type === 'close') {
      state.pidMap[pid].closed = true
    } else {
      state.pidMap[pid].logs.push({ type, content })
    }
  }
}

const actions = {
  stopTask ({ commit }, { projectPath, script }) {
    if (state.tasks[projectPath] && state.tasks[projectPath][script]) {
      stopTask(state.tasks[projectPath][script].pid)
    }
  }
}

export default {
  state, mutations, actions,
  getters: {
    tasks: state => state.tasks
  }
}
