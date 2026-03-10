import type { CommandResponse, CommandContext } from '@shared/command/type'
import { definitionApiRepo } from '@features/show-definitions/repository'
import type { DefinitionResult } from '@features/show-definitions/type'
import { LexicService } from './service'
import { COLORS_MESSAGE } from '@shared/utils/text'

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
    const [defResultRaw, synonymsRaw, antonymsRaw] = await Promise.allSettled([
      definitionApiRepo(word),
      lexicService.getSynonyms(word),
      lexicService.getAntonyms(word)
    ])

    const defResult = defResultRaw.status === 'fulfilled' ? defResultRaw.value as DefinitionResult : null
    const synList = synonymsRaw.status === 'fulfilled' ? synonymsRaw.value : []
    const antList = antonymsRaw.status === 'fulfilled' ? antonymsRaw.value : []

    const firstDef = defResult?.definitions?.[0]
    const hasDefinition = !!(defResult?.success && firstDef)

    if (!hasDefinition && synList.length === 0 && antList.length === 0) {
      return {
        success: false,
        msg: `Aucune information lexicale trouvée pour le mot "${word}".`
      }
    }

    const titleColor = COLORS_MESSAGE.colors['magenta']
    const resetColor = '\u001b[0m'
    const defaultColor = COLORS_MESSAGE.colors['blue']
    const sourceColor = COLORS_MESSAGE.colors['yellow']
    const relationColor = COLORS_MESSAGE.colors['blue']

    const actualWord = hasDefinition && defResult.word_details?.word 
      ? defResult.word_details.word.toUpperCase() 
      : word.toUpperCase()
      
    let output = `${titleColor}LEXIQUE : ${actualWord}${resetColor}\n\n`

    if (hasDefinition && firstDef) {
      const text = firstDef.definition.length > 280 
        ? firstDef.definition.substring(0, 280) + '...' 
        : firstDef.definition
        
      const source = firstDef.source_name 
        ? ` - ${sourceColor}${firstDef.source_name}${defaultColor}` 
        : ''

      output += `${titleColor}Définition :${resetColor}\n`
      output += `${defaultColor}1. ${text}${source}\n\n`
    }

    if (synList.length > 0) {
      const displaySyn = synList.slice(0, 15).join(', ')
      const moreSyn = synList.length > 15 ? '...' : ''
      output += `${titleColor}Synonymes (${synList.length}) :${resetColor}\n`
      output += `${relationColor}${displaySyn}${moreSyn}${resetColor}\n\n`
    }

    if (antList.length > 0) {
      const displayAnt = antList.slice(0, 15).join(', ')
      const moreAnt = antList.length > 15 ? '...' : ''
      output += `${titleColor}Antonymes (${antList.length}) :${resetColor}\n`
      output += `${relationColor}${displayAnt}${moreAnt}${resetColor}`
    }

    return [`\`\`\`ansi\n${output.trimEnd()}\n\`\`\``]

  } catch (error) {
    console.error(`[LexicHandler] Erreur critique avec le mot "${word}":`, error)
    return {
      success: false,
      msg: `Une erreur interne s'est produite lors de la recherche lexicale pour "${word}".`
    }
  }
}
