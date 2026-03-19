import { words } from '@core/dictionary/cache'
import type { CommandResponse, CommandContext } from '@shared/command/type'
import { searchWords } from '@shared/utils/array'
import { ANSI_COLORS, fitsInMessage } from '@shared/utils/text'
import { phantApi } from '@shared/api/client'

// Mapping depuis la version sans accents (input nettoyé) → nom exact dans la BDD
const LIST_MAP: Record<string, string> = {
  // Types grammaticaux
  nom:           'nom',
  verbe:         'verbe',
  adjectif:      'adjectif',
  adverbe:       'adverbe',
  pronom:        'pronom',
  preposition:   'préposition',
  conjonction:   'conjonction',
  article:       'article',
  interjection:  'interjection',
  participe:     'participe',
  determinant:   'déterminant',
  numeral:       'numéral',
  // Locutions
  'locution-nominale':    'locution nominale',
  'locution-verbale':     'locution verbale',
  'locution-adjectivale': 'locution adjectivale',
  'locution-adverbiale':  'locution adverbiale',
  // Catégories
  demonyme:      'démonymes',
  animal:        'animaux',
}

const KNOWN_LISTS = new Set(Object.keys(LIST_MAP))

export async function searchWordsHandler ({
  args,
  bot,
  message,
  clientGuard
}: CommandContext): Promise<CommandResponse | string[]> {
  const guard = clientGuard(bot, message.author.id, ['user'])
  if (!guard.success) return guard

  const CYAN  = ANSI_COLORS.cyan
  const BLUE  = ANSI_COLORS.blue
  const RESET = '\u001b[0m'

  // Détection : .c [liste?] [pattern] [limit?]
  const arg1 = args[1] || ''
  const isListSearch = KNOWN_LISTS.has(arg1)
  const listKey    = isListSearch ? arg1 : null
  const apiListname = listKey ? LIST_MAP[listKey]! : null
  const pattern    = isListSearch ? (args[2] || '') : arg1

  if (!pattern) {
    const availableLists = Object.keys(LIST_MAP).join(', ')
    return {
      success: false,
      msg: `Utilisation : ".c <pattern>" ou ".c <liste> <pattern>"\nListes disponibles : ${availableLists}`
    }
  }

  const user       = bot.users.getUser(message.author.id)
  const isElevated = user?.role === 'admin' || user?.role === 'owner'

  // Limite optionnelle (admin/owner)
  let limit = 10
  if (isElevated) {
    const limitArg = isListSearch ? args[3] : args[2]
    if (limitArg) {
      const parsed = parseInt(limitArg, 10)
      if (!isNaN(parsed)) limit = parsed
    }
  }

  // ─── Recherche via API (liste filtrée) ──────────────────────────────────────
  if (isListSearch && apiListname) {
    try {
      const result = await phantApi.search(pattern, apiListname)

      if (!result.success || !result.data?.length) {
        return {
          success: false,
          msg: `Aucun mot trouvé pour le motif "${pattern}" dans la liste "${arg1}".`
        }
      }

      const allWords: string[] = result.data
      const shown = allWords.slice(0, limit)
      const total: number = result.total ?? allWords.length

      const highlightRegex = new RegExp(pattern, 'gi')
      const highlighted = shown.map((w: string) =>
        `${BLUE}${w.toUpperCase().replace(highlightRegex, m => `${RESET}${CYAN}${m}${RESET}${BLUE}`)}${RESET}`
      )

      const listLabel  = `${CYAN}[${arg1.toUpperCase()}]${RESET}`
      const patLabel   = `${CYAN}${pattern.toUpperCase()}${RESET}`
      const header     = `${listLabel} ${BLUE}${total} résultat${total > 1 ? 's' : ''} — ${shown.length} affiché(s)${RESET}\n\n`
      const singleLine = header + `${patLabel} : [${highlighted.join(' ')}]`

      if (fitsInMessage(`\`\`\`ansi\n${singleLine}\n\`\`\``)) {
        return [`\`\`\`ansi\n${singleLine}\n\`\`\``]
      }

      // Découpage en plusieurs messages
      const rows: string[] = []
      for (let i = 0; i < highlighted.length; i += 10) {
        rows.push(highlighted.slice(i, i + 10).join(' '))
      }
      const messages: string[] = []
      let current = header + `${patLabel} :\n` + (rows[0] ?? '')
      for (let i = 1; i < rows.length; i++) {
        const candidate = current + '\n' + rows[i]
        if (!fitsInMessage(`\`\`\`ansi\n${candidate}\n\`\`\``)) {
          messages.push(`\`\`\`ansi\n${current}\n\`\`\``)
          current = rows[i] ?? ''
        } else {
          current = candidate
        }
      }
      if (current.trim()) messages.push(`\`\`\`ansi\n${current}\n\`\`\``)
      return messages

    } catch (error) {
      console.error(`[SearchWords] Erreur API liste "${apiListname}":`, error)
      return { success: false, msg: `Erreur lors de la recherche dans la liste "${arg1}".` }
    }
  }

  // ─── Recherche locale (liste complète) ──────────────────────────────────────
  try {
    const dictionary = words
    if (!dictionary.success) {
      return { success: false, msg: 'Le dictionnaire est actuellement indisponible.' }
    }

    const { results, total } = searchWords(pattern, dictionary.data.words, limit)

    if (total === 0) {
      return { success: false, msg: `Aucun mot trouvé pour le motif "${pattern}".` }
    }

    const highlightRegex = new RegExp(pattern, 'gi')
    const highlighted = results.map(w =>
      `${BLUE}${w.replace(highlightRegex, m => `${RESET}${CYAN}${m}${RESET}${BLUE}`)}${RESET}`
    )

    const header     = `${BLUE}${total} résultat${total > 1 ? 's' : ''} — ${results.length} affiché(s)${RESET}\n\n`
    const patLabel   = `${CYAN}${pattern.toUpperCase()}${RESET}`
    const singleLine = header + `${patLabel} : [${highlighted.join(' ')}]`

    if (fitsInMessage(`\`\`\`ansi\n${singleLine}\n\`\`\``)) {
      return [`\`\`\`ansi\n${singleLine}\n\`\`\``]
    }

    const rows: string[] = []
    for (let i = 0; i < highlighted.length; i += 10) {
      rows.push(highlighted.slice(i, i + 10).join(' '))
    }
    const messages: string[] = []
    let current = header + `${patLabel} :\n` + (rows[0] ?? '')
    for (let i = 1; i < rows.length; i++) {
      const candidate = current + '\n' + rows[i]
      if (!fitsInMessage(`\`\`\`ansi\n${candidate}\n\`\`\``)) {
        messages.push(`\`\`\`ansi\n${current}\n\`\`\``)
        current = rows[i] ?? ''
      } else {
        current = candidate
      }
    }
    if (current.trim()) messages.push(`\`\`\`ansi\n${current}\n\`\`\``)
    return messages

  } catch (error) {
    console.error(`[SearchWords] Erreur locale pattern "${pattern}":`, error)
    if (error instanceof SyntaxError || (error as any).message?.includes('Invalid')) {
      return { success: false, msg: `Le motif "${pattern}" est une expression régulière invalide.` }
    }
    return { success: false, msg: `Erreur interne lors de la recherche.` }
  }
}
