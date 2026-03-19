import { phantApi } from '@shared/api/client'
import type { CommandResponse, CommandContext } from '@shared/command/type'
import { COLORS_MESSAGE, fitsInMessage } from '@shared/utils/text'

// Exact source names from DB → display label
const SOURCE_MAP: Record<string, string> = {
  wiktionnaire:   'Wiktionnaire',
  larousse:       'Larousse',
  robert:         'Robert',
  ledictionnaire: 'LeDictionnaire',
  dico:           'LeDictionnaire',
  cordial:        'Cordial',
}

function matchSource (input: string): string | null {
  const lc = input.toLowerCase().trim()
  // Direct match
  if (SOURCE_MAP[lc]) return SOURCE_MAP[lc]!
  // Prefix match
  const key = Object.keys(SOURCE_MAP).find(k => k.startsWith(lc) || lc.startsWith(k))
  return key ? SOURCE_MAP[key]! : null
}

export async function showDefinitionsHandler ({
  args
}: CommandContext): Promise<CommandResponse | string[]> {
  const word = args[1]
  if (!word) {
    return {
      success: false,
      msg: 'Utilisation : ".d maison" | ".d maison 5" | ".d maison wiktionnaire"'
    }
  }

  // Parse optional args: source (string) or limit (number)
  let source: string | undefined
  let limit = 3

  for (const arg of args.slice(2)) {
    const n = parseInt(arg, 10)
    if (!isNaN(n)) {
      limit = Math.min(Math.max(n, 1), 10)
    } else {
      const matched = matchSource(arg)
      if (matched) source = matched
    }
  }

  try {
    const result = await phantApi.definitions(word, source, limit)

    if (!result || !result.success || !result.definitions?.length) {
      const srcMsg = source ? ` (source : ${source})` : ''
      return {
        success: false,
        msg: `Je n'ai trouvé aucune définition pour "${word}"${srcMsg}.`
      }
    }

    const definitions = result.definitions
    const wordLabel   = result.word_details?.word?.toUpperCase() ?? word.toUpperCase()
    const displayDefs = definitions.slice(0, limit)
    const totalCount  = result.definitions_count ?? result.count ?? definitions.length

    const sourceColor  = COLORS_MESSAGE.colors['blue']
    const defaultColor = COLORS_MESSAGE.colors['cyan']
    const headerColor  = COLORS_MESSAGE.colors['blue']

    const srcTag = source ? ` · ${source}` : ''
    const header = `${headerColor}\u001b[1m${totalCount} ${
      totalCount > 1 ? 'définitions trouvées' : 'définition trouvée'
    } - ${displayDefs.length} affichée(s) (${wordLabel}${srcTag})\u001b[0m`

    const formattedDefs = displayDefs.map((def: any, index: number) => {
      const text = def.definition.length > 280
        ? def.definition.substring(0, 280) + '...'
        : def.definition
      const src = def.source_name
        ? ` - ${sourceColor}${def.source_name}${defaultColor}`
        : ''
      return `${defaultColor}${index + 1}. ${text}${src}`
    })

    const fullOutput  = header + '\n\n' + formattedDefs.join('\n\n')
    const ansiMessage = `\`\`\`ansi\n${fullOutput.trimEnd()}\n\`\`\``

    if (fitsInMessage(ansiMessage)) return [ansiMessage]

    const messages: string[] = []
    let currentOutput = header + '\n\n'

    for (const def of formattedDefs) {
      const candidate    = currentOutput + def + '\n\n'
      const candidateMsg = `\`\`\`ansi\n${candidate.trimEnd()}\n\`\`\``
      if (!fitsInMessage(candidateMsg) && currentOutput !== header + '\n\n') {
        messages.push(`\`\`\`ansi\n${currentOutput.trimEnd()}\n\`\`\``)
        currentOutput = def + '\n\n'
      } else {
        currentOutput = candidate
      }
    }

    if (currentOutput.trim()) messages.push(`\`\`\`ansi\n${currentOutput.trimEnd()}\n\`\`\``)
    return messages

  } catch (error) {
    console.error(`[ShowDefinitions] Erreur critique avec le mot "${word}":`, error)
    return {
      success: false,
      msg: `Une erreur interne s'est produite lors de la recherche pour "${word}".`
    }
  }
}
