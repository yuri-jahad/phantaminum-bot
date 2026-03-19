import { phantApi } from '@shared/api/client'

export class LexicService {
  async getSynonyms (word: string): Promise<string[]> {
    try {
      const result = await phantApi.synonymes(word)
      if (!result.success) return []
      const syns: string[] = result.synonyms ?? []
      console.log(`[Synonymes] ${syns.length} trouvés pour "${word}"`)
      return syns
    } catch (error) {
      console.error(`[LexicService] getSynonyms erreur pour "${word}":`, error)
      return []
    }
  }

  async getAntonyms (word: string): Promise<string[]> {
    try {
      const result = await phantApi.antonymes(word)
      if (!result.success) return []
      const ants: string[] = result.antonyms ?? []
      console.log(`[Antonymes] ${ants.length} trouvés pour "${word}"`)
      return ants
    } catch (error) {
      console.error(`[LexicService] getAntonyms erreur pour "${word}":`, error)
      return []
    }
  }
}
