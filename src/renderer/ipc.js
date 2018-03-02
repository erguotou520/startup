import { ipcRenderer } from 'electron'
import store from './store'
import { showHtmlNotification } from './notification'
import * as events from '../shared/events'
/**
 * ipc-render事件
 */
ipcRenderer.on(events.EVENT_APP_NOTIFY_MAIN, (e, { title, body }) => {
  // 显示main进程的通知
  showHtmlNotification(body, title)
}).on(events.EVENT_APP_SHOW_PAGE, (e, targetView) => {
  // 显示具体某页面
  console.log('received view update: ', targetView.page, targetView.tab)
  store.commit('updateView', { ...targetView, fromMain: true })
}).on(events.EVENT_APP_ERROR_MAIN, (e, err) => {
  // 弹框显示main进程报错内容
  alert(err)
}).on(events.EVENT_RX_SYNC_MAIN, (e, appConfig) => {
  // 同步数据
  console.log('received sync data: %o', appConfig)
  store.commit('updateConfig', [appConfig])
}).on(events.EVENT_APP_LOG_CONSOLE, (e, data) => {
  // 任务执行日志
  store.commit('addLog', data)
}).on(events.EVENT_TASK_START_SCRIPT, (e, project, script) => {
  // 启动任务，支持多任务
}).on(events.EVENT_TASK_STOP_SCRIPT, (e, project, script) => {
  // 结束任务，支持多任务
})

/**
 * 与main进程同步配置项
 * @param {Object} appConfig 用于更新的应用配置
 */
export function syncConfig (appConfig) {
  console.log('start sync data: %o', appConfig)
  ipcRenderer.send(events.EVENT_RX_SYNC_RENDERER, appConfig)
}

/**
 * 主动获取初始化数据
 */
export function getInitConfig () {
  console.log('get init config data')
  const res = ipcRenderer.sendSync(events.EVENT_APP_WEB_INIT)
  store.dispatch('initConfig', res)
}

/**
 * 隐藏窗口
 */
export function hideWindow () {
  ipcRenderer.send(events.EVENT_APP_HIDE_WINDOW)
}

/**
 * 启动任务
*/
export function startTask (projectPath, scripts) {
  return ipcRenderer.sendSync(events.EVENT_APP_SCRIPT_RUN, projectPath, scripts)
}

/**
 * 结束任务
*/
export function stopTask (pid) {
  ipcRenderer.send(events.EVENT_APP_SCRIPT_STOP, pid)
}
