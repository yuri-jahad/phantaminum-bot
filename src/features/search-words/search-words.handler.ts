import { words } from '@core/dictionary/dictionary.cache'
import type { CommandResponse } from '@shared/command/command.type'
import { searchWordsService } from '@features/search-words/search-words.service'

export function searchWordsHandler (args: string[]): CommandResponse {
  const pattern = args[1] || ''
  const rawLimit = args[2] ? parseInt(args[2]) : 10
  //const limit = Math.min(Math.max(rawLimit, 1), 50)

  if (!pattern) {
    return {
      success: false,
      msg: 'Usage: .c <pattern> [limit]\nExemple: .c maison 10'
    }
  }

  try {
    const dictionary = words

    if (!dictionary.success) {
      return {
        success: false,
        msg: "Le dictionnaire n'est pas disponible actuellement"
      }
    }

    const { results, total } = searchWordsService(
      pattern,
      dictionary.data.words,
      rawLimit
    )

    if (total === 0) {
      return {
        success: false,
        msg: `Aucun résultat pour "${pattern}"`
      }
    }

    console.log(total)

    const wordsDisplay = results.join(' ')
    let output = `${total} ${
      total > 1 ? 'résultats - affichés' : 'résultat - affiché'
    } ${results.length} (${pattern.toUpperCase()})\n\n`
    output += wordsDisplay
    output += '.'

    return {
      success: true,
      msg: output
    }
  } catch (error) {
    console.error('Erreur recherche:', error)
    return {
      success: false,
      msg: `Erreur système pour "${pattern}"`
    }
  }
}
