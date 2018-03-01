import { app, shell } from 'electron'
import bootstrapPromise, { logPath, appConfigPath } from './bootstrap'
import { showWindow, sendData } from './window'
export { openDevtool } from './window'
import { EVENT_TASK_START_SCRIPT, EVENT_TASK_STOP_SCRIPT } from '../shared/events'
// 打开配置文件
export async function openConfigFile () {
  await bootstrapPromise
  shell.openItem(appConfigPath)
}

// 打开日志文件
export async function openLog () {
  await bootstrapPromise
  shell.openItem(logPath)
}

// 打开窗口
export function showMainWindow () {
  showWindow()
}

// 启动任务
export function startScript (project, script) {
  sendData(EVENT_TASK_START_SCRIPT, project, script)
}

// 结束任务
export function stopScript (project, script) {
  sendData(EVENT_TASK_STOP_SCRIPT, project, script)
}

// 打开指定的url
export function openURL (url) {
  return shell.openExternal(url)
}

// 退出
export function exitApp () {
  app.quit()
}
