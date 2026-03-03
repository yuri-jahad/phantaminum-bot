import * as cheerio from 'cheerio'

const SYNO_BASEURL = 'https://www.synonymo.fr/synonyme/'
const ANTO_BASEURL = 'https://www.antonyme.org/antonyme/'

export class LexicService {
  private async fetchWords (baseURL: string, word: string): Promise<string[]> {
    try {
      const URL = `${baseURL}${word}`

      const response = await fetch(URL, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (!response.ok) {
        if (response.status === 404) return []
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const htmlText = await response.text()
      const $ = cheerio.load(htmlText)
      const results: string[] = []

      $('.fiche ul li a').each((_, element) => {
        const text = $(element).text().trim()

        if (text && text.length > 1 && !results.includes(text)) {
          results.push(text)
        }
      })

      return results
    } catch (error) {
      console.error(`Erreur lors de la récupération pour "${word}":`, error)
      return []
    }
  }

  async getSynonyms (word: string): Promise<string[]> {
    const results = await this.fetchWords(
      SYNO_BASEURL,
      word.toLowerCase().trim()
    )
    console.log(
      `[Synonymes] ${results.length} trouvés pour "${word}" :`,
      results
    )
    return results
  }

  async getAntonyms (word: string): Promise<string[]> {
    const results = await this.fetchWords(
      ANTO_BASEURL,
      word.toLowerCase().trim()
    )
    console.log(
      `[Antonymes] ${results.length} trouvés pour "${word}" :`,
      results
    )
    return results
  }
}
