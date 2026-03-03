import { PhantaminumBot } from '@core/bot/phantaminum-bot'

const bot = new PhantaminumBot()
await bot.initializeBot()
await bot.guilds.initializeGuilds()


