import { CommandService } from '@shared/command/service'
import type { CommandResponse, CommandContext, CommandModel } from '@shared/command/type'
import { ANSI_COLORS, fitsInMessage } from '@shared/utils/text'

const CATEGORIES: { label: string; keys: string[] }[] = [
  { label: 'RECHERCHE',      keys: ['c', 's', 'd', 'pick', 'lexic', 'phon'] },
  { label: 'MA LISTE',       keys: ['ml', 'mla', 'mld'] },
  { label: 'ISLAMIQUE',      keys: ['surah'] },
  { label: 'SYSTÈME',        keys: ['uptime', 'computer', 'id'] },
  { label: 'ADMINISTRATION', keys: ['mute', 'unmute', 'addchannel', 'deletechannel', 'listguilds'] },
  { label: 'AIDE',           keys: ['help'] },
]

export async function helpHandler(_ctx: CommandContext): Promise<CommandResponse | string[]> {
  try {
    const commandService = CommandService.getInstance()
    const allCommandsMap = commandService.commands

    const MAGENTA = ANSI_COLORS.magenta
    const CYAN    = ANSI_COLORS.cyan
    const BLUE    = ANSI_COLORS.blue
    const RESET   = '\u001b[0m'

    const sep   = `${BLUE}${'─'.repeat(42)}${RESET}`
    const title = `${MAGENTA}AIDE DU BOT${RESET}\n${sep}`

    const blocks: string[] = [title]

    for (const category of CATEGORIES) {
      const cmds = category.keys
        .map(k => allCommandsMap.get(k) as CommandModel | undefined)
        .filter((c): c is CommandModel => c != null)

      if (cmds.length === 0) continue

      let block = `\n${MAGENTA}◆ ${category.label}${RESET}\n`

      for (const cmd of cmds) {
        const [main, ...aliases] = cmd.variants
        const mainPart  = `${CYAN}.${main}${RESET}`
        const aliasPart = aliases.length > 0
          ? ` ${BLUE}/ ${aliases.map(a => `.${a}`).join(' / ')}${RESET}`
          : ''
        const descPart  = `  ${BLUE}└─${RESET} ${cmd.helper}`
        block += `\n  ${mainPart}${aliasPart}\n${descPart}`
      }

      blocks.push(block)
    }

    const messages: string[] = []
    let currentContent: string = blocks[0] ?? ''

    for (let i = 1; i < blocks.length; i++) {
      const candidate = currentContent + '\n' + blocks[i]
      const candidateMsg = `\`\`\`ansi\n${candidate}\n\`\`\``
      if (!fitsInMessage(candidateMsg) && currentContent !== (blocks[0] ?? '')) {
        messages.push(`\`\`\`ansi\n${currentContent}\n\`\`\``)
        currentContent = blocks[i] ?? ''
      } else {
        currentContent = candidate
      }
    }

    if (currentContent.trim()) {
      messages.push(`\`\`\`ansi\n${currentContent}\n\`\`\``)
    }

    return messages
  } catch (error) {
    console.error(`[HelpHandler] Erreur de generation:`, error)
    return {
      success: false,
      msg: "Erreur lors de la generation du menu d'aide."
    }
  }
}
