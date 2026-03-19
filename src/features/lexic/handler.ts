import type { CommandResponse, CommandContext } from '@shared/command/type'
import { definitionApiRepo } from '@features/show-definitions/repository'
import type { DefinitionResult } from '@features/show-definitions/type'
import { LexicService } from './service'
import { phantApi } from '@shared/api/client'
import { ANSI_COLORS, fitsInMessage } from '@shared/utils/text'

const lexicService = new LexicService()

export async function lexicHandler({
  args
}: CommandContext): Promise<CommandResponse | string[]> {
  const word = args[1]?.toLowerCase().trim()

  if (!word) {
    return {
      success: false,
      msg: 'Utilisation invalide. Exemple correct : ".lexic maison"'
    }
  }

  try {
    const [defResultRaw, synonymsRaw, antonymsRaw, motRaw] = await Promise.allSettled([
      definitionApiRepo(word),
      lexicService.getSynonyms(word),
      lexicService.getAntonyms(word),
      phantApi.mot(word, ['types', 'genre'])
    ])

    const defResult = defResultRaw.status === 'fulfilled' ? defResultRaw.value as DefinitionResult : null
    const synList   = synonymsRaw.status === 'fulfilled' ? synonymsRaw.value : []
    const antList   = antonymsRaw.status === 'fulfilled' ? antonymsRaw.value : []
    const motData   = motRaw.status === 'fulfilled' ? motRaw.value : null

    const firstDef      = defResult?.definitions?.[0]
    const hasDefinition = !!(defResult?.success && firstDef)

    if (!hasDefinition && synList.length === 0 && antList.length === 0) {
      return {
        success: false,
        msg: `Aucune information lexicale trouvée pour le mot "${word}".`
      }
    }

    const CYAN   = ANSI_COLORS.cyan
    const BLUE   = ANSI_COLORS.blue
    const YELLOW = '\u001b[33m'
    const RESET  = '\u001b[0m'
    const SEP    = `${BLUE}${'─'.repeat(38)}${RESET}`

    const actualWord = hasDefinition && defResult.word_details?.word
      ? defResult.word_details.word.toUpperCase()
      : word.toUpperCase()

    // Nature / genre info from mot endpoint
    const types = motData?.data?.types?.length ? motData.data.types.join(', ') : null
    const genre = motData?.data?.genre ?? null
    const GENRE_LABEL: Record<string, string> = { m: 'masc.', f: 'fém.', mf: 'masc./fém.' }
    const genreStr = genre ? GENRE_LABEL[genre] ?? genre : null

    let natureStr = ''
    if (types && genreStr) natureStr = ` ${YELLOW}[${types} · ${genreStr}]${RESET}`
    else if (types)        natureStr = ` ${YELLOW}[${types}]${RESET}`
    else if (genreStr)     natureStr = ` ${YELLOW}[${genreStr}]${RESET}`

    let output = `${CYAN}[ LEXIQUE · ${actualWord} ]${natureStr}${RESET}\n${SEP}`

    if (hasDefinition && firstDef) {
      const text = firstDef.definition.length > 300
        ? firstDef.definition.substring(0, 300) + '...'
        : firstDef.definition
      const source = firstDef.source_name
        ? `  ${BLUE}(${firstDef.source_name})${RESET}`
        : ''
      output += `\n\n${CYAN}Définition${RESET}\n${BLUE}${text}${source}${RESET}`
    }

    if (synList.length > 0) {
      const displayed = synList.slice(0, 15)
      const more = synList.length > 15 ? ` ${BLUE}+${synList.length - 15}${RESET}` : ''
      const synWords = displayed.map((s: string) => `${CYAN}${s}${RESET}`).join('  ')
      output += `\n\n${CYAN}Synonymes ${BLUE}(${synList.length})${RESET}\n${synWords}${more}`
    }

    if (antList.length > 0) {
      const displayed = antList.slice(0, 15)
      const more = antList.length > 15 ? ` ${BLUE}+${antList.length - 15}${RESET}` : ''
      const antWords = displayed.map((a: string) => `${CYAN}${a}${RESET}`).join('  ')
      output += `\n\n${CYAN}Antonymes ${BLUE}(${antList.length})${RESET}\n${antWords}${more}`
    }

    const ansiMessage = `\`\`\`ansi\n${output.trimEnd()}\n\`\`\``

    if (fitsInMessage(ansiMessage)) {
      return [ansiMessage]
    }

    const messages: string[] = []
    const header = `${CYAN}[ LEXIQUE · ${actualWord} ]${natureStr}${RESET}\n${SEP}`
    let current = header

    if (hasDefinition && firstDef) {
      const text = firstDef.definition.length > 300
        ? firstDef.definition.substring(0, 300) + '...'
        : firstDef.definition
      const source = firstDef.source_name ? `  ${BLUE}(${firstDef.source_name})${RESET}` : ''
      const block = `\n\n${CYAN}Définition${RESET}\n${BLUE}${text}${source}${RESET}`
      const candidate = `\`\`\`ansi\n${current + block}\n\`\`\``
      if (fitsInMessage(candidate)) current += block
      else { messages.push(`\`\`\`ansi\n${current}\n\`\`\``); current = block.trimStart() }
    }

    for (const [label, list] of [['Synonymes', synList], ['Antonymes', antList]] as [string, string[]][]) {
      if (list.length > 0) {
        const displayed = list.slice(0, 15)
        const more = list.length > 15 ? ` ${BLUE}+${list.length - 15}${RESET}` : ''
        const words = displayed.map((w: string) => `${CYAN}${w}${RESET}`).join('  ')
        const block = `\n\n${CYAN}${label} ${BLUE}(${list.length})${RESET}\n${words}${more}`
        const candidate = `\`\`\`ansi\n${current + block}\n\`\`\``
        if (fitsInMessage(candidate)) current += block
        else { messages.push(`\`\`\`ansi\n${current}\n\`\`\``); current = block.trimStart() }
      }
    }

    if (current.trim()) messages.push(`\`\`\`ansi\n${current.trimEnd()}\n\`\`\``)
    return messages

  } catch (error) {
    console.error(`[LexicHandler] Erreur critique avec le mot "${word}":`, error)
    return {
      success: false,
      msg: `Une erreur interne s'est produite lors de la recherche lexicale pour "${word}".`
    }
  }
}
