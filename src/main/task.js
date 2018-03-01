import { spawn } from 'child_process'
import treeKill from 'tree-kill'
import logger from './logger'
import { showNotification } from './notification'
import { sendData } from './window'
import { isArray } from '../shared/utils'
import { EVENT_APP_LOG_CONSOLE } from '../shared/events'

/**
 * {
 *  project: {
 *    script: {
 *      closed: false,
 *      child
 *    }
 *  }
 * }
 */
const tasks = {}
/**
 * {
 *   pid: {
 *     closed,
 *     child
 *   }
 * }
 */
const pidMap = {}

/**
 * {
 *  pid: [projectPath, script]
 * }
 */
const pid2script = {}

/**
 * 运行命令
 */
function runCommand (projectPath, script) {
  if (projectPath && script) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Start script: "${script}" at "${projectPath}"`)
    } else {
      logger.log(`Start script: "${script}" at "${projectPath}"`)
    }
    const commands = script.split(' ')
    const child = spawn(commands.shift(), [...commands], {
      shell: true, cwd: projectPath
    })
    child.stdout.on('data', content => {
      sendData(EVENT_APP_LOG_CONSOLE, {
        type: 'stdout', pid: child.pid, content
      })
    })
    child.stderr.on('data', content => {
      sendData(EVENT_APP_LOG_CONSOLE, {
        type: 'stderr', pid: child.pid, content
      })
    })
    child.on('close', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Script: "${script}" at "${projectPath}" stoped.`)
      } else {
        logger.log(`Script: "${script}" at "${projectPath}" stoped.`)
      }
      sendData(EVENT_APP_LOG_CONSOLE, {
        type: 'close', pid: child.pid
      })
    })
    console.log(child)
    return child
  }
}

/**
 * 结束command的后台运行
 */
async function stop (child, timeout = 5000, force = false) {
  if (child && child.pid) {
    return new Promise(resolve => {
      treeKill(child.pid, 'SIGKILL', err => {
        if (err) {
          logger.error(`进程 ${child.pid} 可能无法关闭`)
          !force && showNotification(`进程 ${child.pid} 可能无法关闭，尝试手动关闭`)
        }
        resolve()
      })
    })
  }
  return Promise.resolve()
}

/**
 * 执行项目的npm脚本
 * @param {String} projectPath 项目路径
 * @param {Array[String]} scripts npm脚本
 */
export function startTask (projectPath, scripts) {
  scripts = isArray(scripts) ? scripts : [scripts]
  const pids = scripts.map(script => {
    if (tasks[projectPath]) {
      if (tasks[projectPath][script] && tasks[projectPath][script].pid && !tasks[projectPath][script].closed) {
        // 任务已存在
        return
      } else {
        tasks[projectPath][script] = { closed: false, child: null }
      }
    } else {
      tasks[projectPath] = { [script]: { closed: false, child: null }}
    }
    const child = runCommand(projectPath, script)
    if (child) {
      Object.assign(tasks[projectPath][script], { child })
      pidMap[child.pid] = tasks[projectPath][script]
      pid2script[child.pid] = [projectPath, script]
      return child.pid
    }
  })
  return pids
}

/**
 * 结束任务
 * @param {Number} pid pid
 */
export function stopTask (pid) {
  const promise = pidMap[pid] ? stop(pidMap[pid].child) : Promise.resolve()
  return promise.then(() => {
    delete tasks[pid2script[pid][0]][pid2script[pid][1]]
    delete pidMap[pid]
    delete pid2script[pid]
  })
}

/**
 * 结束所有进程
 * @param {Boolean} force 是否强制退出
 */
export function stopAll (force = false) {
  if (Object.keys(pidMap).length > 0) {
    return Promise.all(Object.keys(pidMap).map(pid => {
      return stop(pidMap[pid].child, 8000, force)
    }))
  }
  return Promise.resolve()
}

/**
 * 获取任务列表
 */
export function getTasks () {
  return tasks
}
