// shared/command/command.model.ts
import type { CommandModel } from './command-registry.type'

export class CommandRegistry {
  private readonly cmds: Set<CommandModel> = new Set()
  private static instance: null | CommandRegistry = null

  static getInstance () {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry()
    }

    return CommandRegistry.instance
  }

  add (command: CommandModel): this {
    this.cmds.add(command)
    return this
  }
}
