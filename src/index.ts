import { PhantaminumBot } from '@core/bot/phantaminum-bot'
import { lexiconService } from '@features/lexicon/service'

await lexiconService.loadDictionary().then(() => {
  console.log("Le bot est pret a recevoir des commandes phonetiques !")
})
const bot = new PhantaminumBot()
await bot.initializeBot()
await bot.guilds.initializeGuilds()


