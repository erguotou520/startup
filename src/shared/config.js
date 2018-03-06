const defaultConfig = {
  // 项目列表
  projects: [],
  // 开机自启动
  autoLaunch: false,
  // 自启动脚本
  autoLaunchScripts: [],
  // 默认IDE工具
  defaultIDE: 'vscode'
}

export default defaultConfig

// 合并默认配置，做好配置升级
export function mergeConfig (appConfig) {
  Object.keys(defaultConfig).forEach(key => {
    if (appConfig[key] === undefined) {
      appConfig[key] = defaultConfig[key]
    }
  })
}
