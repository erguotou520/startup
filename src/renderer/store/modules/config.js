import defaultConfig from '../../../shared/config'
import { merge, getUpdatedKeys } from '../../../shared/utils'
import { syncConfig } from '../../ipc'

const state = {
  appConfig: defaultConfig
}

const mutations = {
  // 更新应用配置
  updateConfig (state, [targetConfig, sync = false]) {
    const changed = getUpdatedKeys(state.appConfig, targetConfig)
    if (changed.length) {
      const extractConfig = {}
      changed.forEach(key => { extractConfig[key] = targetConfig[key] })
      merge(state.appConfig, extractConfig)
      console.log('config updated: ', extractConfig)
      if (sync) {
        syncConfig(extractConfig)
      }
    }
  },
  // 添加项目
  addProjects (state, projects) {
    state.appConfig.projects = state.appConfig.projects.concat(projects)
    syncConfig({ projects: state.appConfig.projects })
  },
  // 更新项目
  updateProject (state, [index, project]) {
    state.appConfig.projects.splice(index, 1)
    state.appConfig.projects.splice(index, 0, project)
    syncConfig({ projects: state.appConfig.projects })
  },
  // 删除项目
  removeProject (state, index) {
    state.appConfig.projects.splice(index, 1)
    syncConfig({ projects: state.appConfig.projects })
  },
  // 排序项目
  sortProjects (state, [oldIndex, newIndex]) {
    const moved = state.appConfig.projects.splice(oldIndex, 1)
    state.appConfig.projects.splice(newIndex, 0, moved[0])
    syncConfig({ projects: state.appConfig.projects })
  }
}

const actions = {
  initConfig ({ commit }, { config, meta, tasks }) {
    document.title = `${document.title} v${meta.version}`
    commit('updateConfig', [config])
    commit('setTasks', tasks)
  },
  updateConfig ({ getters, commit }, targetConfig) {
    commit('updateConfig', [targetConfig, true])
  }
}

export default {
  state,
  mutations,
  actions,
  getters: {
    appConfig: state => state.appConfig,
    projects: state => state.appConfig.projects
  }
}
