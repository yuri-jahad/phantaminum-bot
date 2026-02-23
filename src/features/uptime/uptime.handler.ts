import type { CommandResponse } from '@shared/command/command.type'
import { formatUptimeService, startTime } from '@features/uptime/uptime.service'
import { ANSI_COLORS } from '@shared/command/command.service'

export const uptimeHandler = (args: string[]): CommandResponse => {
  try {
    const uptime = formatUptimeService(startTime)
    const { yellow,  cyan, green } = ANSI_COLORS

    const startDateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
    const formattedDate = new Date(startTime).toLocaleString('fr-FR', startDateOptions)
    const finalDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
    const contentMessage = [
      `${green}=== STATUT DE CONNEXION ===${cyan}\n`,
      `Statut Actuel  : ${green}EN LIGNE${cyan}`,
      `Temps Actif    : ${yellow}${uptime.display}${cyan}`,
      `Démarrage      : ${yellow}${finalDate}${cyan}`,
      `ID Processus   : ${yellow}${startTime}${cyan}`
    ].join('\n')

    return {
      success: true,
      msg: contentMessage
    }
  } catch (error) {
    console.error('[UptimeCommand] Erreur dans le calcul:', error)

    return {
      success: false,
      msg: "Impossible d'analyser le cycle de vie actuel du système."
    }
  }
}
