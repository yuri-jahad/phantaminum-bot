import type { CommandResponse, CommandContext } from '@shared/command/type'

export async function listGuildsHandler ({
  bot,
  message,
  clientGuard
}: CommandContext): Promise<CommandResponse> {
  const guard = clientGuard(bot, message.author.id, ['user'])

  if (!guard.success) {
    return {
      success: false,
      msg: guard.msg || 'Autorisation refusée.'
    }
  }

  const guildsMap = bot.guilds.guilds

  if (guildsMap.size === 0) {
    return {
      success: true,
      msg: "Le bot n'est actuellement autorisé sur aucun serveur."
    }
  }

  let responseText = `🌍 Serveurs autorisés (${guildsMap.size})\n\n`

  for (const [guildId, guildData] of guildsMap.entries()) {
    const channelCount = guildData.channels.size
    const channelPlural = channelCount > 1 ? 'salons' : 'salon'

    responseText += `• **${guildData.name}**\n`
    responseText += `  ↳ ID : \`${guildId}\` | ${channelCount} ${channelPlural} autorisé(s)\n`


    if (channelCount > 0) {
      const channelMentions = Array.from(guildData.channels)
        .map(id => `<#${id}>`)
        .join(', ')
      responseText += `  ↳ Salons : ${channelMentions}\n`
    }

    responseText += '\n' 
  }

  return {
    success: true,
    msg: responseText.trimEnd()
  }
}
