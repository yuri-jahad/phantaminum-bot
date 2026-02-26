import type { Message } from 'discord.js'
import type { User } from '@shared/user/type'

export const getOwner = (id: string) =>
  id === process.env.DISCORD_OWNER_ID ? 'owner' : 'user'

export const createUserFromMessage = (clientMessage: Message): User => {
  return {
    id: clientMessage.author.id,
    username: clientMessage.author.displayName,
    avatar: clientMessage.author.avatar,
    role: getOwner(clientMessage.author.id),
    muted: false
  }
}
