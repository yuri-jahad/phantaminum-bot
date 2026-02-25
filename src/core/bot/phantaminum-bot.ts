import { CommandService } from '@shared/command/command-service'
import { DiscordClient } from '@shared/discord/discord-client'
import { UsersService } from '@shared/users/users-service'
import { handleMessageCreate } from './message.create'
import { GuildService } from '@shared/guild/guild-service'

export class PhantaminumBot {
  client: DiscordClient = DiscordClient.getInstance()
  users: UsersService = UsersService.getInstance()
  commands: CommandService = CommandService.getInstance()
  guilds: GuildService = GuildService.getInstance()

  async intializeBot () {
    await this.users.load()
    await this.commands.initializeCommands()
    const client = await this.client.start()
    client?.on(
      'messageCreate',
      async message => await handleMessageCreate(message, this)
    )
  }
}
