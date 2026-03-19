import type { CommandResponse, CommandContext } from '@shared/command/type'
import { phantApi } from '@shared/api/client'
import { ANSI_COLORS, fitsInMessage } from '@shared/utils/text'

const PRONOUNS = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles']
const PRONOUNS_IMP = ['–', 'tu', '–', 'nous', 'vous', '–']

const TENSES: { key: string; label: string; pronouns: string[] }[] = [
  { key: 'indicatif_présent',      label: 'Indicatif présent',      pronouns: PRONOUNS },
  { key: 'indicatif_imparfait',    label: 'Indicatif imparfait',    pronouns: PRONOUNS },
  { key: 'indicatif_futur',        label: 'Indicatif futur',        pronouns: PRONOUNS },
  { key: 'indicatif_passé_simple', label: 'Indicatif passé simple', pronouns: PRONOUNS },
  { key: 'conditionnel_présent',   label: 'Conditionnel présent',   pronouns: PRONOUNS },
  { key: 'subjonctif_présent',     label: 'Subjonctif présent',     pronouns: PRONOUNS },
  { key: 'impératif_présent',      label: 'Impératif présent',      pronouns: PRONOUNS_IMP },
]

function formatTense (label: string, forms: (string | null)[], pronouns: string[], CYAN: string, BLUE: string, RESET: string): string {
  const lines = forms
    .map((f, i) => f ? `  ${BLUE}${(pronouns[i] ?? '').padEnd(9)}${RESET} ${CYAN}${f}${RESET}` : null)
    .filter(Boolean)
    .join('\n')
  return `${CYAN}${label}${RESET}\n${lines}`
}

export async function conjugaisonHandler ({
  args
}: CommandContext): Promise<CommandResponse | string[]> {
  const verb = args[1]?.toLowerCase().trim()

  if (!verb) {
    return {
      success: false,
      msg: 'Utilisation : ".conjugaison avoir" | ".conj être" | ".conj partir futur"'
    }
  }

  // Optional tense filter (arg2)
  const tenseFilter = args[2]?.toLowerCase().trim()

  try {
    const result = await phantApi.conjugaison(verb)

    if (!result?.success) {
      return {
        success: false,
        msg: `"${verb}" n'est pas dans la base de conjugaison Verbiste.`
      }
    }

    const data = result.data as Record<string, any>

    const CYAN  = ANSI_COLORS.cyan
    const BLUE  = ANSI_COLORS.blue
    const RESET = '\u001b[0m'
    const SEP   = `${BLUE}${'─'.repeat(38)}${RESET}`

    // Participes & gérondif
    const ppasse  = (data.participe_passé as (string | null)[])?.filter(Boolean).join(' / ') ?? '—'
    const ppresent = data.participe_présent ?? '—'
    const gerondif = data.gérondif ?? '—'

    const header = `${CYAN}[ CONJUGAISON · ${verb.toUpperCase()} ]${RESET}\n${SEP}\n` +
      `${CYAN}Modèle ${RESET}${BLUE}${result.template ?? '—'}${RESET}\n` +
      `${CYAN}Participe passé    ${RESET}${BLUE}${ppasse}${RESET}\n` +
      `${CYAN}Participe présent  ${RESET}${BLUE}${ppresent}${RESET}\n` +
      `${CYAN}Gérondif           ${RESET}${BLUE}${gerondif}${RESET}`

    // Filter tenses if user specified one
    let tensesToShow = TENSES
    if (tenseFilter) {
      tensesToShow = TENSES.filter(t =>
        t.label.toLowerCase().includes(tenseFilter) ||
        t.key.toLowerCase().includes(tenseFilter)
      )
      if (tensesToShow.length === 0) tensesToShow = TENSES
    }

    const messages: string[] = []
    let current = header

    for (const tense of tensesToShow) {
      const forms = data[tense.key] as (string | null)[] | undefined
      if (!forms) continue
      const block = '\n\n' + formatTense(tense.label, forms, tense.pronouns, CYAN, BLUE, RESET)
      const candidate = `\`\`\`ansi\n${current + block}\n\`\`\``
      if (fitsInMessage(candidate)) {
        current += block
      } else {
        messages.push(`\`\`\`ansi\n${current}\n\`\`\``)
        current = formatTense(tense.label, forms, tense.pronouns, CYAN, BLUE, RESET)
      }
    }

    if (current.trim()) messages.push(`\`\`\`ansi\n${current.trimEnd()}\n\`\`\``)

    return messages.length ? messages : [{ success: false, msg: 'Aucune forme trouvée.' } as any]

  } catch (error) {
    console.error(`[ConjugaisonHandler] Erreur avec "${verb}":`, error)
    return {
      success: false,
      msg: `Erreur lors de la conjugaison de "${verb}".`
    }
  }
}
