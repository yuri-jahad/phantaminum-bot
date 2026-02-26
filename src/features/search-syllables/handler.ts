import type { CommandResponse } from '@shared/command/type'
import { searchSyllablesRepository } from '@features/search-syllables/repository'

export async function searchSyllablesHandler(
  args: string[]
): Promise<CommandResponse> {
  const [_, arg1, arg2] = args

  if (!arg1) {
    return {
      success: false,
      msg: 'Utilisation invalide. Exemples : ".s 2" (2 syllabes), ".s ^er" (commence par er), ou ".s er$ 2".'
    }
  }

  const isArg1Number = /^\d+$/.test(arg1)
  const isArg2Number = arg2 ? /^\d+$/.test(arg2) : false

  const occurrenceCount = isArg1Number ? arg1 : isArg2Number ? arg2 : undefined
  const syllablePattern = !isArg1Number ? arg1 : !isArg2Number ? arg2 : undefined

  try {
    const result = await searchSyllablesRepository(occurrenceCount, syllablePattern)

    if (result.status === 'failed') {
      return {
        success: false,
        msg: `Impossible d'effectuer la recherche : ${result.message.replace(/\n/g, ' - ')}.`
      }
    }

    const match = result.message.match(/^\((\d+)\)/)
    const count = match ? parseInt(match[1], 10) : 0

    if (count === 0) {
      return {
        success: false,
        msg: 'Je n\'ai trouvé aucun résultat correspondant à votre recherche.'
      }
    }

    const syllablesArray = result.message.includes('\n')
      ? result.message.split('\n')[1].trim().split(' ')
      : []

    const searchContext = [
      syllablePattern?.toUpperCase(),
      occurrenceCount ? `${occurrenceCount} SYLLABES` : ''
    ].filter(Boolean).join(' - ')

    let output = `${count} ${
      count > 1 ? 'résultats trouvés -' : 'résultat trouvé -'
    } ${syllablesArray.length} affiché(s) (${searchContext})\n\n`
    
    output += syllablesArray.join(' ').replace(/\s+/g, ' ') + '.'

    return {
      success: true,
      msg: output
    }
  } catch (error) {
    console.error(`[SearchSyllables] Erreur avec args: ${args.slice(1).join(' ')}:`, error)
    return {
      success: false,
      msg: 'Une erreur interne s\'est produite lors de la recherche.'
    }
  }
}
