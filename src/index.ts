import { DiscordClient } from "@shared/discord/discord-client";
import { words } from "@core/dictionary/dictionary.cache.js";

// src/index.ts
const discordClient = DiscordClient.getInstance()
await discordClient.start()
