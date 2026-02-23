import { CommandRegistry } from '@shared/command/command-registry'
import { DiscordClient } from '@shared/discord/discord-client'
import { UserRegistry } from '@shared/user/user-registry'
import { handleMessageCreate } from './message.create'

export class PhantaminumBot {
  client: DiscordClient = DiscordClient.getInstance()
  users: UserRegistry = UserRegistry.getInstance()
  commands: CommandRegistry = CommandRegistry.getInstance()

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
