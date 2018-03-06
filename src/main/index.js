import { app } from 'electron'
import bootstrap from './bootstrap'
import { isQuiting, appConfig$ } from './data'
import { destroyTray } from './tray'
import { checkUpdate } from './updater'
import './menu'
import './ipc'
import { stopAll } from './task'
import { createWindow, showWindow, getWindow, destroyWindow } from './window'
import './launch'
import logger from './logger'

const isSecondInstance = app.makeSingleInstance((argv, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  const _window = getWindow()
  if (_window) {
    if (_window.isMinimized()) {
      _window.restore()
    }
    _window.focus()
  }
})

if (isSecondInstance) {
  app.quit()
}

bootstrap.then(() => {
  createWindow()

  if (process.env.NODE_ENV !== 'development') {
    checkUpdate()
  }

  appConfig$.subscribe(data => {
    const [appConfig, changed] = data
    if (!changed.length) {
      // 初始化时没有配置则打开页面，有配置则不显示主页面
      if (!appConfig.projects.length) {
        showWindow()
      }
    }
  })
})

app.on('window-all-closed', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('window-all-closed')
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 由main进程发起的退出
app.on('before-quit', () => { isQuiting(true) })

app.on('will-quit', e => {
  if (process.env.NODE_ENV === 'development') {
    console.log('will-quit')
  }
  e.preventDefault()
  stopAll(true).then(() => {
    destroyWindow()
    destroyTray()
    app.exit(0)
  })
})

app.on('activate', () => {
  if (getWindow() === null) {
    createWindow()
  }
})

// 未捕获的rejections
process.on('unhandledRejection', (reason, p) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  } else {
    logger.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  }
})
