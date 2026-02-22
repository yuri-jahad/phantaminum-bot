import { CommandRegistry } from '@shared/command/command-registry'
import { DiscordClient } from '@shared/discord/discord-client'
import { UserRegistry } from '@shared/user/user-registry'

export class PhantaminumBot {
  client: DiscordClient = DiscordClient.getInstance()
  users: UserRegistry = UserRegistry.getInstance()
  commands: CommandRegistry = CommandRegistry.getInstance()

  async intializeBot () {
    await this.users.load()
    await this.commands.initializeCommands()
    await this.client.start()
    console.log(this)
  }
}

console.log(await new PhantaminumBot().intializeBot())
