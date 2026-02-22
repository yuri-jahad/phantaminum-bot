import type { Message } from 'discord.js'
import { PhantaminumBot } from '@core/bot/phantaminum-bot'
import { sleep } from 'bun'

export const handleMessageCreate = async (
  message: Message,
  bot: PhantaminumBot
): Promise<void> => {
  if (message.author.bot) return
  
  const commandFnContent = await bot.commands.deployCommands(message)
  console.log(commandFnContent)
  if (!commandFnContent || commandFnContent.length === 0) return

  if (message.channel.isSendable()) {
    try {
      await message.channel.sendTyping()
    } catch {}
  }

  for (let i = 0; i < commandFnContent.length; i++) {
    await message.reply(commandFnContent[i] || '')

    if (i < commandFnContent.length - 1) {
      await sleep(1000)
    }
  }
}
