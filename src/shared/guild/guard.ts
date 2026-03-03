import type { PhantaminumBot } from '@core/bot/phantaminum-bot'
import type { Message } from 'discord.js'

export function guildGuard (message: Message, bot: PhantaminumBot): boolean {
  if (!message.guildId) return true

  const user = bot.users.getUser(message.author.id)
  if (user?.role === 'owner') return true

  return bot.guilds.hasChannel(message.guildId, message.channelId)
}
