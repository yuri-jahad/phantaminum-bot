import type { CommandContext, CommandResponse } from '@shared/command/type'
import { ANSI_COLORS, cleanAccents } from '@shared/utils/text'
import { sessions, clearSession } from '@features/def-game/session'
import { words } from '@core/dictionary/cache'
import { advanceRound, showFinalScore } from '@features/syl-game/handler'
import type { SendableChannel } from '@features/def-game/session'

export async function skipHandler ({
  bot,
  message,
  clientGuard
}: CommandContext): Promise<CommandResponse | string[]> {
  const guard = clientGuard(bot, message.author.id, ['user'])
  if (!guard.success) return guard

  const channelId = message.channelId
  const session   = sessions.get(channelId)

  if (!session || session.type !== 'syl') {
    return { success: false, msg: "Aucun jeu de syllabes en cours. Lance une partie avec `.sg` !" }
  }

  const CYAN  = ANSI_COLORS.cyan
  const BLUE  = ANSI_COLORS.blue
  const RESET = '\u001b[0m'

  const { syllable } = session

  const examples = words.data.words
    .filter(w => cleanAccents(w.toLowerCase()).includes(syllable))
    .slice(0, 5)
    .map(w => `${CYAN}${w.toUpperCase()}${RESET}`)
    .join(', ')

  const skipContent =
    `${CYAN}[ SYLLABE PASSÉE ]${RESET}\n\n` +
    `${BLUE}La syllabe était :${RESET} ${CYAN}${syllable.toUpperCase()}${RESET}\n\n` +
    `${BLUE}Exemples :${RESET} ${examples}`

  if (session.queue.length > 0) {
    // Manche suivante dans 2s
    await advanceRound(channelId, session, session.channel as SendableChannel, session.starterId, bot, null)
  } else {
    if (session.totalRounds > 1) {
      setTimeout(async () => {
        await showFinalScore(session.channel as SendableChannel, session)
      }, 1500)
    }
    clearSession(channelId)
  }

  return [`\`\`\`ansi\n${skipContent}\n\`\`\``]
}
