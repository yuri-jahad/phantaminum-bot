import { definitionApiRepo } from '@features/show-definitions/show-definitions.repository'
import type {
  CommandResponse,
  DefinitionResult
} from '@features/show-definitions/show-definitions.type'

export async function showDefinitionshandler (
  args: string[]
): Promise<CommandResponse> {
  const word = args[1]
  const rawLimit = (args[2] && parseInt(args[2])) || 3
  const limit = Math.min(Math.max(rawLimit, 1), 10)
  console.log(word)
  if (!word) {
    return {
      success: false,
      msg: 'Veuillez insérer un mot pour consulter sa définition. Exemple : .def maison.'
    }
  }

  try {
    const result = (await definitionApiRepo(word)) as DefinitionResult | null

    if (!result || !result.success || !result.definitions?.length) {
      return {
        success: false,
        msg: `Définition non trouvée pour le mot "${word}".`
      }
    }

    const { word_details, definitions } = result
    const displayDefs = definitions.slice(0, limit)

    let output = `# ${word_details.word.toUpperCase()} - `
    output += `${definitions.length} définitions - Affichées : ${displayDefs.length}\n\n`

    output += displayDefs
      .map((def, index) => {
        const text =
          def.definition.length > 280
            ? def.definition.substring(0, 280) + '...'
            : def.definition

        return `${index + 1}. ${text} (${def.source_name || 'Source inconnue'})`
      })
      .join('\n\n')

    return {
      success: true,
      msg: output
    }
  } catch (error) {
    return {
      success: false,
      msg: `Erreur système - Impossible de récupérer les définitions pour "${word}."`
    }
  }
}
