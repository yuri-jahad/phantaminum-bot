import type { CommandResponse, CommandContext } from '@shared/command/type'

export async function addChannelHandler ({
  bot,
  message,
  clientGuard
}: CommandContext): Promise<CommandResponse> {
  const guard = clientGuard(bot, message.author.id, ['owner'])
  console.log('OKKK', guard)

  if (!guard.success) {
    return {
      success: false,
      msg: guard.msg || 'Autorisation refusée.'
    }
  }

  if (!message.guildId || !message.channelId) {
    return {
      success: false,
      msg: 'Cette commande doit être exécutée depuis un salon de serveur Discord.'
    }
  }
  const guildId = message.guildId
  const channelId = message.channelId
  const guildName = message.guild?.name || 'Serveur Inconnu'

  try {
    await bot.guilds.addChannel(guildId, guildName, channelId)

    return {
      success: true,
      msg: `Le salon <#${channelId}> a été ajouté à la liste blanche avec succès.`
    }
  } catch (error) {
    console.error(
      `[AddChannel] Erreur avec le salon ${channelId} (Serveur: ${guildId}):`,
      error
    )
    return {
      success: false,
      msg: 'Erreur : Vérifiez que le serveur a bien été enregistré avec la commande addguild au préalable.'
    }
  }
}
