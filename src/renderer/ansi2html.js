// https://github.com/creationix/ansi-to-html/blob/master/ansi-to-html.js
// https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences
const colors = {
  // 30
  black: '#000',
  // 31
  red: '#c24021',
  // 32
  green: '#25bc24',
  // 33
  yellow: '#adad27',
  // 34
  blue: '#492ee1',
  // 35
  magenta: '#d338d3',
  // 36
  cyan: '#33bbc8',
  // 37
  white: '#e9cccd',
  orange: '#cb4b16',
  violet: '#6c71c4'
}

export default function ansiToHtml (text) {
  const state = {
    color: false,
    background: false,
    bold: false,
    italic: false,
    underline: false
  }
  const mapping = {
    '0': { color: false, background: false, bold: false },
    '1': { bold: true },
    '3': { italic: true },
    '4': { underline: true },
    '21': { bold: false },
    '22': { color: false },
    '23': { italic: false },
    '24': { underline: false },
    '30': { color: colors.black },
    '31': { color: colors.red },
    '32': { color: colors.green },
    '33': { color: colors.yellow },
    '34': { color: colors.blue },
    '35': { color: colors.magenta },
    '36': { color: colors.cyan },
    '37': { color: colors.white },
    '39': { color: false },
    '40': { background: colors.black },
    '41': { background: colors.red },
    '42': { background: colors.green },
    '43': { background: colors.yellow },
    '44': { background: colors.blue },
    '45': { background: colors.magenta },
    '46': { background: colors.cyan },
    '47': { background: colors.white },
    '49': { background: false }
  }
  const html = []
  text.split('\x1B').forEach(part => {
    const match = part.match(/\[([0-9]+(?:;[0-9]+)*)m/)
    if (match) {
      part = part.substring(match[0].length)
      match[1].split(';').forEach(command => {
        const change = mapping[command]
        if (!change) {
          console.error('Unknown command: ', match[1])
          return
        }
        for (var key in change) {
          state[key] = change[key]
        }
      })
    }
    if (part) {
      const style = []
      state.color && style.push('color: ' + state.color + ';')
      state.background && style.push('background-color: ' + state.background + ';')
      state.bold && style.push('font-weight: bold;')
      state.italic && style.push('font-style: italic;')
      state.underline && style.push('text-decoration: underline;')
      if (style.length) {
        html.push(`<span style="${style.join(' ')}">${part}</span>`)
      } else {
        html.push(part)
      }
    }
  })
  return html.join('')
}
