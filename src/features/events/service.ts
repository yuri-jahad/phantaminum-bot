import * as cheerio from 'cheerio'

export type HipHopEvent = {
  id: string
  name: string
  url: string
  description: string
  date: string
  imageUrl: string
  source: 'and8.dance' | 'ticketmaster'
}

export class EventService {
  private readonly AND8_URL = 'https://and8.dance'
  private readonly TM_API_KEY = process.env.TICKETMASTER_API_KEY || 'VOTRE_CLE_TICKETMASTER_ICI'
  
  private readonly HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }

  async searchEvents(searchQuery: string = 'hip hop'): Promise<HipHopEvent[]> {
    try {
      const [and8Events, tmEvents] = await Promise.allSettled([
        this.fetchAnd8(searchQuery),
        this.fetchTicketmaster(searchQuery)
      ])

      const events1 = and8Events.status === 'fulfilled' ? and8Events.value : []
      const events2 = tmEvents.status === 'fulfilled' ? tmEvents.value : []

      return [...events1, ...events2].slice(0, 8)
    } catch (error) {
      console.error('[EventService] Global error:', error)
      return []
    }
  }

  private async fetchTicketmaster(query: string): Promise<HipHopEvent[]> {
    try {
      if (this.TM_API_KEY === 'VOTRE_CLE_TICKETMASTER_ICI') return []

      const safeQuery = encodeURIComponent(query)
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${this.TM_API_KEY}&keyword=${safeQuery}&classificationName=Hip-Hop/Rap&sort=date,asc&size=4`
      
      const response = await fetch(url)
      if (!response.ok) return []

      const data = await response.json()
      if (!data._embedded || !data._embedded.events) return []

      return data._embedded.events.map((event: any) => {
        // Ticketmaster fournit plusieurs images, on prend la plus large au format 16:9
        const bestImage = event.images?.find((img: any) => img.ratio === '16_9' && img.width > 600) 
                          || event.images?.[0]
        
        const venue = event._embedded?.venues?.[0]
        const locationStr = venue ? `${venue.name}, ${venue.city?.name}` : ''

        return {
          id: `tm_${event.id}`,
          name: event.name,
          url: event.url,
          description: locationStr,
          date: event.dates?.start?.localDate || 'Date à venir',
          imageUrl: bestImage?.url || '',
          source: 'ticketmaster'
        }
      })

    } catch (error) {
      console.error('[EventService] Ticketmaster error:', error)
      return []
    }
  }

  private async fetchAnd8(query: string): Promise<HipHopEvent[]> {
    try {
      const response = await fetch(`${this.AND8_URL}/fr/events`, { headers: this.HEADERS })
      if (!response.ok) return []
      
      const html = await response.text()
      const $ = cheerio.load(html)
      const foundEvents = new Map<string, string>()

      const elements = $('tr, li, a, .event, .item').toArray()
      
      for (const el of elements) {
        const elHtml = $(el).html() || ''
        const elHref = $(el).attr('href') || ''
        const match = elHtml.match(/\/e\/(\d{3,6})/) || elHref.match(/\/e\/(\d{3,6})/)
        
        if (match) {
          const id = match[1]
          const text = $(el).text().toLowerCase()
          const existingText = foundEvents.get(id) || ''
          if (text.length > existingText.length) {
            foundEvents.set(id, text)
          }
        }
      }

      let targetIds = Array.from(foundEvents.keys())
      
      if (query && query !== 'hip hop') {
        const queryWords = query.toLowerCase().trim().split(/\s+/)
        targetIds = Array.from(foundEvents.entries())
          .filter(([_, text]) => queryWords.every(word => text.includes(word)))
          .map(([id, _]) => id)
      }

      const idsToFetch = targetIds.slice(0, 4)
      const events: HipHopEvent[] = []

      await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const eventUrl = `${this.AND8_URL}/fr/e/${id}`
            const res = await fetch(eventUrl, { headers: this.HEADERS })
            if (!res.ok) return
            
            const detailHtml = await res.text()
            const $detail = cheerio.load(detailHtml)
            
            let name = $detail('meta[property="og:title"]').attr('content') || $detail('title').text()
            name = name.replace('| 5,6,7 and8 - dance', '').replace('| 5,6,7 and8', '').trim()
            
            let description = $detail('meta[property="og:description"]').attr('content') || ''
            description = description.replace(/\s+/g, ' ').trim()

            let imageUrl = $detail('meta[property="og:image"]').attr('content')
            if (!imageUrl) imageUrl = `${this.AND8_URL}/media/events/${id}/header.jpg`

            events.push({
              id,
              name,
              url: eventUrl,
              description,
              date: 'Voir la page', 
              imageUrl,
              source: 'and8.dance'
            })
          } catch (e) {}
        })
      )

      return events
    } catch (error) {
      console.error('[EventService] and8 error:', error)
      return []
    }
  }
}
