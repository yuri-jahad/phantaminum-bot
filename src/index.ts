import { DiscordClient } from "@shared/discord/discord-client";
import { words } from "@core/dictionary/dictionary.cache.js";
import { searchWordsHandler } from "@features/search-words/search-words.handler";
// src/index.ts
// const discordClient = DiscordClient.getInstance()
// await discordClient.start()

console.log(searchWordsHandler(["er", "ede"]))