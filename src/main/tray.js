import { Menu, Tray, nativeImage } from 'electron'
import { appConfig$ } from './data'
import * as handler from './tray-handler'
import { checkUpdate } from './updater'
import { getTasks } from './task'
import { isMac, isWin } from '../shared/env'
import { trayIcon } from '../shared/icon'

let tray

/**
 * 根据应用配置生成菜单
 * @param {Object} appConfig 应用配置
 */
function generateMenus (appConfig) {
  const base = [
    { label: '帮助', submenu: [
      { label: '检查更新', click: () => checkUpdate(true) },
      { label: '查看日志', click: handler.openLog },
      { label: '查看配置文件', click: handler.openConfigFile },
      { label: '项目主页', click: () => { handler.openURL('https://github.com/erguotou520/electron-ssr') } },
      { label: 'Bug反馈', click: () => { handler.openURL('https://github.com/erguotou520/electron-ssr/issues') } },
      { label: '打开开发者工具', click: handler.openDevtool }
    ] },
    { label: '退出', click: handler.exitApp }
  ]
  const projectMenus = []
  if (appConfig.projects && appConfig.projects.length) {
    appConfig.projects.forEach(project => {
      projectMenus.push({
        label: project.name, submenu: [
          { label: '启动' },
          { label: '结束' }
        ]
      })
    })
    projectMenus.push({ type: 'separator' })
  }
  return [{ label: '打开主页面', click: handler.showMainWindow }, { type: 'separator' }].concat(projectMenus).concat(base)
}

// 根据配置显示tray tooltip
function getTooltip (appConfig) {
  const tasks = getTasks()
  const projects = Object.keys(tasks)
  const scripts = projects.reduce((total, project) => {
    return total + Object.keys(tasks[project])
  }, 0)
  return `startup\n共${projects.length}个项目 ${scripts}个运行脚本`
}

/**
 * 更新任务栏菜单
 * @param {Object} appConfig 应用配置
 */
function updateTray (appConfig) {
  const menus = generateMenus(appConfig)
  const contextMenu = Menu.buildFromTemplate(menus)
  tray.setContextMenu(contextMenu)
  tray.setToolTip(getTooltip(appConfig))
}

// 根据应用状态显示不同的图标
function setTrayIcon (appConfig) {
  tray.setImage(trayIcon)
}

/**
 * 渲染托盘图标和托盘菜单
 */
export default function renderTray (appConfig) {
  // 生成tray
  tray = new Tray(nativeImage.createEmpty())
  updateTray(appConfig)
  setTrayIcon(appConfig)
  tray.on((isMac || isWin) ? 'double-click' : 'click', handler.showMainWindow)
}

/**
 * 销毁托盘
 */
export function destroyTray () {
  if (tray) {
    tray.destroy()
  }
}

// 监听数据变更
appConfig$.subscribe(data => {
  const [appConfig, changed] = data
  if (!changed.length) {
    renderTray(appConfig)
  } else {
    if (changed.indexOf('projects') > -1) {
      updateTray(appConfig)
    }
  }
})
