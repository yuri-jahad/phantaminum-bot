import { getSystemInfoService } from '@features/computer-infos/service'
import type { CommandResponse } from '@shared/command/type'
import { ANSI_COLORS } from '@shared/utils/text'

export const computerHandler = (args: string[]): CommandResponse => {
  try {
    const info = getSystemInfoService()
    const { yellow, cyan } = ANSI_COLORS

    const contentMessage = [
      `${cyan}INFORMATIONS SYSTÈME DU SERVEUR${cyan}\n`,
      `OS          : ${yellow}${info.platform} ${info.arch}${cyan}`,
      `Processeur  : ${yellow}${info.processor}${cyan}`,
      `Cœurs       : ${yellow}${info.cores}${cyan}`,
      `RAM Totale  : ${yellow}${info.totalMemory} GB${cyan}`,
      `RAM Utilisée: ${yellow}${info.usedMemory} GB (${info.memoryUsage}%)${cyan}`,
      `RAM Libre   : ${yellow}${info.freeMemory} GB${cyan}`,
      `Uptime      : ${yellow}${info.uptime}${cyan}`,
      `Node.js     : ${yellow}${info.nodeVersion}${cyan}`
    ].join('\n')

    return {
      success: true,
      msg: contentMessage
    }
  } catch (error) {
    console.error('[ComputerCommand] Erreur système:', error)
    return {
      success: false,
      msg: 'Impossible de récupérer les informations du serveur actuellement.'
    }
  }
}