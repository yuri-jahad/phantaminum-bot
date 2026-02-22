const COLORS_MESSAGE: any = {
  colors: {
    red: '\u001b[31m\u001b[1m',
    green: '\u001b[32m\u001b[1m',
    yellow: '\u001b[33m\u001b[1m',
    blue: '\u001b[34m\u001b[1m',
    magenta: '\u001b[35m\u001b[1m',
    cyan: '\u001b[36m\u001b[1m',
    white: '\u001b[37m\u001b[1m'
  } as const,
  format (
    text: string,
    colorKey: keyof typeof COLORS_MESSAGE['colors'],
    cmd = ''
  ): string {
    const colorCode = COLORS_MESSAGE.colors[colorKey]
    return `${cmd}\`\`\`ansi\n${colorCode}${text}\u001b[0m\n\`\`\``
  }
} as const

export const sleep = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time))

export const reformatTextService = (
  firstCmd: string,
  result: string | { success: boolean; msg: string }
): string[] => {
  const cmdTitle = `${firstCmd}\n`
  const messages: string[] = []
  const CHUNK_SIZE = 962

  let finalResult: string
  let color: keyof typeof COLORS_MESSAGE['colors'] = 'cyan'

  if (typeof result === 'object') {
    finalResult = result.msg
    color = result.success ? 'cyan' : 'red'
  } else {
    finalResult = result
    color = 'cyan'
  }

  const content = cmdTitle + finalResult
  const totalLen = content.length

  if (totalLen <= CHUNK_SIZE) {
    messages.push(COLORS_MESSAGE.format(finalResult, color, cmdTitle))
    return messages
  }

  const firstChunk = content.slice(0, CHUNK_SIZE)
  messages.push(
    COLORS_MESSAGE.format(firstChunk.replace(cmdTitle, ''), color, cmdTitle)
  )

  for (let i = CHUNK_SIZE; i < totalLen; i += CHUNK_SIZE) {
    const chunk = content.slice(i, i + CHUNK_SIZE)
    messages.push(COLORS_MESSAGE.format(chunk, color, ''))
  }

  return messages
}
