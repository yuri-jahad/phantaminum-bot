import { definitionApiRepo } from '@features/show-definitions/repository'
import type { DefinitionResult } from '@features/show-definitions/type'
import type { CommandResponse, CommandContext } from '@shared/command/type'
import { COLORS_MESSAGE } from '@shared/utils/text'

export async function showDefinitionshandler ({
  args,
  bot,
  message
}: CommandContext): Promise<CommandResponse> {
  const word = args[1]
  const rawLimit = args[2] ? parseInt(args[2], 10) : 3
  const limit = isNaN(rawLimit) ? 3 : Math.min(Math.max(rawLimit, 1), 10)

  if (!word) {
    return {
      success: false,
      msg: 'Utilisation invalide. Exemple correct : ".def maison" ou ".def maison 5" (limite optionnelle).'
    }
  }

  if (args[2] && isNaN(rawLimit)) {
    return {
      success: false,
      msg: `La limite "${args[2]}" n'est pas un nombre valide. Utilisez ".def ${word} 3".`
    }
  }

  try {
    const result = (await definitionApiRepo(word)) as DefinitionResult | null

    if (!result || !result.success || !result.definitions?.length) {
      return {
        success: false,
        msg: `Je n'ai trouvé aucune définition pour le mot "${word}".`
      }
    }

    const { word_details, definitions } = result
    const displayDefs = definitions.slice(0, limit)

    const sourceColor = COLORS_MESSAGE.colors['yellow']
    const defaultColor = COLORS_MESSAGE.colors['cyan']

    let output = `\u001b[1m${definitions.length} ${
      definitions.length > 1 ? 'définitions trouvées -' : 'définition trouvée -'
    } ${
      displayDefs.length
    } affichée(s) (${word_details.word.toUpperCase()})\u001b[0m\n\n`

    output += displayDefs
      .map((def, index) => {
        const text =
          def.definition.length > 280
            ? def.definition.substring(0, 280) + '...'
            : def.definition

        const source = def.source_name
          ? ` - ${sourceColor}${def.source_name}${defaultColor}`
          : ''

        return `${defaultColor}${index + 1}. ${text}${source}`
      })
      .join('\n\n')

    return {
      success: true,
      msg: output
    }
  } catch (error) {
    console.error(
      `[ShowDefinitions] Erreur critique avec le mot "${word}":`,
      error
    )
    return {
      success: false,
      msg: `Une erreur interne s'est produite lors de la recherche de la définition pour "${word}".`
    }
  }
}
