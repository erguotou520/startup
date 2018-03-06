import { appConfig$ } from './data'
import AutoLaunch from 'auto-launch'
import logger from './logger'

// 开机自启动
const AutoLauncher = new AutoLaunch({
  name: 'startup',
  isHidden: true,
  mac: {
    useLaunchAgent: true
  }
})

appConfig$.subscribe(data => {
  const [appConfig, changed] = data
  // if (!changed.length) {
  //   // 初始化
  // }
  if (!changed.length || changed.indexOf('autoLaunch') > -1) {
    // 初始化或者选项变更时
    AutoLauncher.isEnabled().then(enabled => {
      // 状态不相同时
      if (appConfig.autoLaunch !== enabled) {
        return AutoLauncher[appConfig.autoLaunch ? 'enable' : 'disable']().catch(() => {
          logger.error(`${appConfig.autoLaunch ? '执行' : '取消'}开机自启动失败`)
        })
      }
    }).catch(() => {
      logger.error('获取开机自启状态失败')
    })
  }
})
