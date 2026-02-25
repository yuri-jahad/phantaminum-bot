import type { Message } from 'discord.js'
import type { User } from '@shared/user/user.type'

export const createUserFromMessage = (clientMessage: Message): User => {
  return {
    id: clientMessage.author.id,
    username: clientMessage.author.displayName,
    avatar: clientMessage.author.avatar,
    role: 'user'
  }
}
