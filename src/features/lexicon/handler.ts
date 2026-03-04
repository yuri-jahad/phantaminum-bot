import type { CommandResponse, CommandContext } from '@shared/command/type'
import { lexiconService } from './service'
import { shuffle } from '@shared/utils/array'

export async function lexiconHandler ({
  args,
  message
}: CommandContext): Promise<CommandResponse> {
  const targetPhon = args[1]
  const targetSyllables = args[2] ? parseInt(args[2], 10) : undefined

  if (!targetPhon) {
    return {
      success: false,
      msg: 'Utilisation invalide. Exemple : `.c wazo` ou `.c zo 2`'
    }
  }

  try {
    const rawResults = lexiconService.searchWords(targetPhon, targetSyllables)

    if (rawResults.length === 0) {
      const syllMsg = targetSyllables ? ` de ${targetSyllables} syllabes` : ''
      return {
        success: false,
        msg: `Aucun mot trouve contenant le son phonetique "${targetPhon}"${syllMsg}.`
      }
    }

    const shuffledResults = shuffle(rawResults)

    const maxResults = 10
    const displayedResults = shuffledResults.slice(0, maxResults)

    const syllContext = targetSyllables ? ` (${targetSyllables} syllabes)` : ''

    let replyMsg = `\`\`\`yaml\n`
    replyMsg += `# RESULTATS PHONETIQUES POUR "${targetPhon}"${syllContext}\n`
    replyMsg += `# Total trouve : ${rawResults.length} mots\n\n`

    for (const word of displayedResults) {
      replyMsg += `${word.ortho}: "[${word.phon}]" (${word.nbsyll} syll.)\n`
    }

    if (rawResults.length > maxResults) {
      replyMsg += `\n# ... et ${rawResults.length - maxResults} autres mots.\n`
      replyMsg += `# Relancez la commande pour en voir d'autres !`
    }

    replyMsg += `\n\`\`\``

    await message.reply(replyMsg)

    return {
      success: true,
      msg: ''
    }
  } catch (error: any) {
    console.error(`[LexiconHandler] Erreur :`, error)
    return {
      success: false,
      msg: "Le dictionnaire phonetique n'est pas pret ou une erreur est survenue."
    }
  }
}
