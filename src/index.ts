import { PhantaminumBot } from '@core/bot/phantaminum-bot'

const bot = new PhantaminumBot()
await bot.intializeBot()
await bot.guilds.initializeGuilds()


