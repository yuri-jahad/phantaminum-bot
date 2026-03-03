import type { CommandResponse, CommandContext } from '@shared/command/type'

export async function deleteChannelHandler ({
  bot,
  message,
  clientGuard
}: CommandContext): Promise<CommandResponse> {
  const guard = clientGuard(bot, message.author.id, ['owner'])

  if (!guard.success) {
    return {
      success: false,
      msg: guard.msg || 'Autorisation refusée.'
    }
  }

  const guildId = message.guildId
  const channelId = message.channelId

  if (!guildId || !channelId) {
    return {
      success: false,
      msg: 'Cette commande doit être exécutée depuis un salon de serveur Discord.'
    }
  }

  try {
    const wasDeleted = await bot.guilds.deleteChannel(guildId, channelId)

    if (!wasDeleted) {
      return {
        success: false,
        msg: `Le salon <#${channelId}> n'était pas autorisé sur ce serveur.`
      }
    }

    const guildChannels = bot.guilds.guilds.get(guildId)
    if (guildChannels && guildChannels.channels.size === 0) {
      await bot.guilds.deleteGuild(guildId)
    }

    return {
      success: true,
      msg: `Le salon <#${channelId}> a été retiré de la liste blanche avec succès. Le bot l'ignorera désormais.`
    }
  } catch (error) {
    console.error(
      `[DeleteChannel] Erreur avec le salon ${channelId} (Serveur: ${guildId}):`,
      error
    )
    return {
      success: false,
      msg: "Une erreur interne s'est produite lors de la suppression du salon."
    }
  }
}
