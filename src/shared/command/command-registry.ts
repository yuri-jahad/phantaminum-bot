// shared/command/command.model.ts
import type { CommandModel } from './command.type'
import { join } from 'path'
import { readdir } from 'node:fs/promises'

export class CommandRegistry {
  private readonly cmds: Set<CommandModel> = new Set()
  private static instance: null | CommandRegistry = null

  static getInstance (): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry()
    }
    return CommandRegistry.instance
  }

  async initializeCommands (): Promise<void> {
    const __dirname = import.meta.dir
    const featuresPATH = join(__dirname, '..', '..', 'features')

    try {
      const entries: string[] = await readdir(featuresPATH, { recursive: true })

      for (const item of entries) {
        if (item.endsWith('.command.ts')) {
          const itemPath = join(featuresPATH, item)
          try {
            const { default: cmd } = (await import(itemPath)) as any
            this.cmds.add(cmd)
            console.log(`Loaded: ${item}`)
          } catch (err) {
            console.error(`Failed to load ${item}:`, err)
          }
        }
      }
    } catch (error) {
      console.error('Erreur scan features:', error)
    }
  }

  add (command: CommandModel): this {
    this.cmds.add(command)
    return this
  }

  get commands (): Set<CommandModel> {
    return this.cmds
  }
}
