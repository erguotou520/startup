import { app, ipcMain } from 'electron'
import { readJsonSync } from 'fs-extra'
import * as events from '../shared/events'
import { appConfigPath } from './bootstrap'
import { updateAppConfig } from './data'
import { startTask, stopTask, getTasks } from './task'
import { hideWindow } from './window'
import { showNotification } from './notification'
import { openIDE } from './ide'
import defaultConfig, { mergeConfig } from '../shared/config'
import logger from './logger'

/**
 * ipc-main事件
 */
ipcMain.on(events.EVENT_APP_ERROR_RENDER, e => {
  // 渲染进程报错
  logger.error(e)
}).on(events.EVENT_APP_HIDE_WINDOW, () => {
  // 隐藏窗口
  hideWindow()
}).on(events.EVENT_APP_WEB_INIT, e => {
  // 页面初始化
  let stored
  try {
    stored = readJsonSync(appConfigPath)
    mergeConfig(stored)
  } catch (e) {
    stored = defaultConfig
  }
  const tasks = getTasks()
  const sendTasks = {}
  Object.keys(tasks).forEach(project => {
    sendTasks[project] = {}
    Object.keys(tasks[project]).forEach(script => {
      sendTasks[project][script] = tasks[project][script]
    })
  })
  e.returnValue = {
    config: stored,
    meta: {
      version: app.getVersion()
    },
    tasks: sendTasks
  }
}).on(events.EVENT_RX_SYNC_RENDERER, (e, data) => {
  // 同步数据
  if (process.env.NODE_ENV === 'development') {
    console.log('received sync data: ', data)
  }
  updateAppConfig(data, true)
}).on(events.EVENT_APP_NOTIFY_RENDERER, (e, body, title) => {
  // 显示来自renderer进程的通知
  showNotification(body, title)
}).on(events.EVENT_APP_SCRIPT_RUN, (e, projectPath, scripts) => {
  // 执行任务
  e.returnValue = startTask(projectPath, scripts)
}).on(events.EVENT_APP_SCRIPT_STOP, (e, pid) => {
  // 结束任务
  stopTask(pid)
}).on(events.EVENT_APP_OPEN_IDE, (e, projectPath) => {
  openIDE(projectPath)
})
