import { execSync } from 'child_process'
import { currentConfig } from './data'

const commandMap = {
  atom: 'atom -a {path}',
  vscode: 'code -a {path}'
}

/**
 * 在默认IDE中打开项目
 * @param {String} projectPath 项目路径
 */
export function openIDE (projectPath) {
  if (projectPath) {
    const command = commandMap[currentConfig.defaultIDE].replace(/{path}/, projectPath)
    return execSync(command)
  }
}
