import { words } from '@core/dictionary/dictionary.cache'
import type { CommandResponse } from '@shared/command/command.type'
import { searchWordsService } from '@features/search-words/search-words.service'

export function searchWordsHandler(args: string[]): CommandResponse {
  const pattern = args[1] || ''
  const rawLimit = args[2] ? parseInt(args[2], 10) : 10
  const limit = isNaN(rawLimit) ? 10 : rawLimit

  if (!pattern) {
    return {
      success: false,
      msg: 'Utilisation invalide. Exemple correct : ".c maison" ou ".c maison 20" (limite optionnelle).'
    }
  }

  if (args[2] && isNaN(rawLimit)) {
    return {
      success: false,
      msg: `La limite "${args[2]}" n'est pas un nombre valide. Utilisez ".c ${pattern} 10".`
    }
  }

  try {
    const dictionary = words
    if (!dictionary.success) {
      return {
        success: false,
        msg: 'Le dictionnaire est actuellement indisponible. Veuillez réessayer plus tard.'
      }
    }

    const { results, total } = searchWordsService(
      pattern,
      dictionary.data.words,
      limit
    )


    if (total === 0) {
      return {
        success: false,
        msg: `Je n'ai trouvé aucun mot correspondant au motif "${pattern}".`
      }
    }

    const wordsDisplay = results.join(' ').replace(/\s+/g, ' ')
    
    let output = `${total} ${
      total > 1 ? 'résultats trouvés -' : 'résultat trouvé -'
    } ${results.length} affiché(s) (${pattern.toUpperCase()})\n\n`
    
    output += wordsDisplay
    output += '.'

    return {
      success: true,
      msg: output
    }
  } catch (error) {
    console.error(`[SearchWords] Erreur critique avec le motif "${pattern}":`, error)
    
    if (error instanceof SyntaxError) {
      return {
        success: false,
        msg: `Le motif "${pattern}" est invalide (caractères spéciaux non supportés ou expression régulière erronée).`
      }
    }

    return {
      success: false,
      msg: `Une erreur interne s'est produite lors de la recherche du motif "${pattern}".`
    }
  }
}
