// 由`ipc-main`发出 使用HTML5降级通知
export const EVENT_APP_NOTIFY_MAIN = 'app.notify.main'

// 由`ipc-renderer`发出 显示通知
export const EVENT_APP_NOTIFY_RENDERER = 'app.notify.renderer'

// 由`ipc-main`发出 `main`进程报错
export const EVENT_APP_ERROR_MAIN = 'app.error.main'

// 由`ipc-renderer`发出 `renderer`进程报错
export const EVENT_APP_ERROR_RENDER = 'app.error.renderer'

// 由`ipc-renderer`发出 隐藏窗口
export const EVENT_APP_HIDE_WINDOW = 'app.hide.window'

// 由`ipc-main`发出 打开并跳转到指定的页面
export const EVENT_APP_SHOW_PAGE = 'app.show.page'

// 由`ipc-renderer`发出 用于获取系统初始化数据
export const EVENT_APP_WEB_INIT = 'app.init.web'

// 由`ipc-renderer`发出 启动项目的npm脚本
export const EVENT_APP_SCRIPT_RUN = 'app.script.run'

// 由`ipc-renderer`发出 结束项目的npm脚本
export const EVENT_APP_SCRIPT_STOP = 'app.script.stop'

// 由`ipc-main`发出 项目运行的console内容
export const EVENT_APP_LOG_CONSOLE = 'app.log.console'

// 由`ipc-main`发出 同步`rx`数据
export const EVENT_RX_SYNC_MAIN = 'rx.sync.main'

// 由`ipc-renderer`发出 同步`rx`数据
export const EVENT_RX_SYNC_RENDERER = 'rx.sync.renderer'

// 由`ipc-main`发出 启动某项目某脚本任务
export const EVENT_TASK_START_SCRIPT = 'task.start.script'

// 由`ipc-main`发出 结束某项目某脚本任务
export const EVENT_TASK_STOP_SCRIPT = 'task.stop.script'
