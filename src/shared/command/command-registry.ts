// shared/command/command-registry.ts
import type { CommandModel } from './command.type'
import { join } from 'path'
import { readdir } from 'node:fs/promises'
import { Message } from 'discord.js'
import { reformatTextService } from './command.service'

export class CommandRegistry {
  private readonly cmds: Map<string, CommandModel> = new Map()
  private static instance: null | CommandRegistry = null
  private readonly SYMBOLS: Set<string> = new Set(['.', '/'])

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
            const module = (await import(itemPath)) as { default: CommandModel }
            const cmd = module.default

            if (!cmd || !cmd.variants) {
              console.warn(`[Warning] ${item} export is invalid.`)
              continue
            }

            this.add(cmd)
            console.log(`Loaded command: ${item}`)
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
    for (const variant of command.variants) {
      if (this.cmds.has(variant)) {
        console.warn(`[Warning] Variant '${variant}' already exists.`)
      }
      this.cmds.set(variant, command)
    }
    return this
  }

  getCommandByTrigger (trigger: string): CommandModel | undefined {
    if (!trigger) return undefined

    const firstChar = trigger.charAt(0)
    if (this.SYMBOLS.has(firstChar)) {
      const commandName = trigger.slice(1)
      return this.cmds.get(commandName)
    }

    return undefined
  }

  async deployCommands (message: Message) {
    if (message.author.bot || !message.content) return
    const messages = message.content.toLowerCase().split(' ')
    const firstCmd = messages[0]
    if (!firstCmd) return
    const commandContent = this.getCommandByTrigger(firstCmd)
    if (!commandContent) return
    const commandContentFn = await commandContent.fn(messages)
    console.log(commandContentFn)
    return reformatTextService(firstCmd, commandContentFn)
  }

  get commands (): Map<string, CommandModel> {
    return this.cmds
  }
}
