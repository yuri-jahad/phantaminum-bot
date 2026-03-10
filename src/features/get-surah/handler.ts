import type { CommandContext, CommandResponse } from '@shared/command/type'
import { ANSI_COLORS, fitsInMessage } from '@shared/utils/text'

export function surahHandler ({ args, bot }: CommandContext): CommandResponse | string[] {
  if (args.length < 2) {
    return {
      success: false,
      msg: 'Syntaxe invalide'
    }
  }

  let queryArgs = args.slice(1)
  let pageNumber = 1

  const lastArg = queryArgs[queryArgs.length - 1]
  if (queryArgs.length > 1 && !isNaN(Number(lastArg))) {
    pageNumber = Math.max(1, Number(lastArg))
    queryArgs = queryArgs.slice(0, -1)
  }

  const query = queryArgs.join(' ').trim()

  if (!query) {
    return {
      success: false,
      msg: 'Syntaxe invalide'
    }
  }

  const surah = bot.quran.getSurah(query)

  if (!surah) {
    return {
      success: false,
      msg: `Sourate introuvable\nAucun résultat pour "${query}".`
    }
  }

  const RESET   = '\u001b[0m'
  const MAGENTA = ANSI_COLORS.magenta
  const BLUE    = ANSI_COLORS.blue
  const CYAN    = ANSI_COLORS.cyan
  const YELLOW  = ANSI_COLORS.yellow

  const buildOutput = (versesPerPage: number): { output: string, totalPages: number } => {
    const totalPages = Math.ceil(surah.content.length / versesPerPage)
    const startIndex = (pageNumber - 1) * versesPerPage
    const versesToDisplay = surah.content.slice(startIndex, startIndex + versesPerPage)

    let output = ''

    output += `${MAGENTA}┌─────────────────────────────────────┐${RESET}\n`
    output += `${MAGENTA}│ ${surah.transcription.toUpperCase().padEnd(37)}${MAGENTA}│${RESET}\n`
    output += `${MAGENTA}└─────────────────────────────────────┘${RESET}\n\n`

    output += `${BLUE}Nom arabe  ${RESET}: ${surah.name}\n`
    output += `${BLUE}Traduction ${RESET}: ${surah.translation}\n`
    output += `${BLUE}Versets    ${RESET}: ${surah.verseCount}   ${BLUE}Page ${RESET}: ${pageNumber}/${totalPages}\n`

    output += `\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n\n`

    versesToDisplay.forEach((verse, i) => {
      const verseNumber = startIndex + i + 1
      output += `${YELLOW}${String(verseNumber).padStart(3, '0')}${RESET} ${CYAN}${verse}${RESET}\n`
    })

    if (pageNumber < totalPages) {
      output += `\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`
      output += `${BLUE}▶ .surah ${query} ${pageNumber + 1} pour la suite${RESET}`
    }

    return { output, totalPages }
  }

  let versesPerPage = 10
  let output!: string
  let totalPages!: number
  let ansiMessage!: string

  while (versesPerPage > 1) {
    const result = buildOutput(versesPerPage)
    output = result.output
    totalPages = result.totalPages
    ansiMessage = `\`\`\`ansi\n${output.trimEnd()}\n\`\`\``
    if (fitsInMessage(ansiMessage)) break
    versesPerPage--
  }

  if (pageNumber > totalPages) {
    return {
      success: false,
      msg: `La sourate "${surah.transcription}" ne possède que ${totalPages} page(s).`
    }
  }

  const paddedSurahNb = String(surah.surahNb).padStart(3, '0')
  const audioUrl = `https://server8.mp3quran.net/afs/${paddedSurahNb}.mp3`
  const audioMessage = `🔊 Écouter la sourate :\n${audioUrl}`

  return [ansiMessage, audioMessage]
}