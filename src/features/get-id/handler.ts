import type { CommandContext } from '@shared/command/type'


export function getIdHandler ({ args, bot, message, clientGuard }: CommandContext) {
  const guard = clientGuard(bot, message.author.id, ['admin'])
  if (!guard.success) return guard

  const targetUsername = args[1]
  if (!targetUsername) {
    return {
      success: false,
      msg: 'Syntaxe invalide. Utilisation : .id <pseudo>'
    }
  }

  const userIds = bot.users.getIdByName(targetUsername)

  if (!userIds || userIds.length === 0) {
    return {
      success: false,
      msg: `Aucun utilisateur nommé ${targetUsername} n'a été trouvé.`
    }
  }

  return {
    success: true,
    msg: `Identifiant(s) trouvé(s) pour ${targetUsername} :\n${userIds.join(
      '\n'
    )}`
  }
}
