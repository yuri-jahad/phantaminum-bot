import { Client, Events, GatewayIntentBits } from 'discord.js'

const token = process.env.DISCORD_TOKEN!

export class DiscordClient {
  private client: Client | null = null
  private isStarted: boolean = false
  private static instance: DiscordClient | null = null

  private constructor () {}

  static getInstance (): DiscordClient {
    if (!DiscordClient.instance) {
      DiscordClient.instance = new DiscordClient()
    }
    return DiscordClient.instance
  }

 async start(): Promise<Client | null> {
  if (this.isStarted && this.client?.isReady()) {
    return this.client
  }

  try {
    if (!token) {
      throw new Error('DISCORD_TOKEN manquant')
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    })

    await this.client.login(token)

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for ready (10s)'))
      }, 10000)

      this.client!.once(Events.ClientReady, () => {
        clearTimeout(timeout)
        console.log(`✅ Ready! Logged in as ${this.client!.user!.tag}`)
        this.isStarted = true
        resolve()
      })
    })

    return this.client!
  } catch (error) {
    console.error('Connection failed:', error)
    await this.stop()
    return null
  }
}


  private async stop (): Promise<void> {
    if (this.client) {
      await this.client.destroy()
      this.client = null
      this.isStarted = false
    }
  }
}
