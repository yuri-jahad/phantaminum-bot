import type { CommandResponse, CommandContext } from '@shared/command/type'
import { EventService } from './service'

const eventService = new EventService()

export async function eventsHandler({ 
  args,
  message
}: CommandContext): Promise<CommandResponse> {
  const searchQuery = args.slice(1).join(' ').trim()

  try {
    const events = await eventService.searchEvents(searchQuery)

    if (events.length === 0) {
      const queryContext = searchQuery ? ` pour "${searchQuery}"` : ''
      return {
        success: false,
        msg: `Aucun resultat trouve${queryContext}.`
      }
    }
    
    let titleMsg = `RESULTATS DE RECHERCHE`
    if (searchQuery) titleMsg += ` : ${searchQuery.toUpperCase()}`
    
    await message.reply(titleMsg)

    for (const [index, event] of events.entries()) {
      const sourceTag = event.source === 'and8' ? '[AND8.DANCE]' : '[EVENTBRITE]'
      let eventMsg = `**${index + 1}. ${event.name}** ${sourceTag}\n`
      
      if (event.date && event.date !== 'À venir' && event.date !== 'Date inconnue') {
        eventMsg += `Date : ${event.date}\n`
      }

      if (event.description) {
        eventMsg += `${event.description}\n`
      }
      
      eventMsg += `<${event.url}>\n`
      
      if (event.imageUrl) {
        eventMsg += `${event.imageUrl}`
      }
      
      await message.reply(eventMsg)
    }

    return {
      success: true,
      msg: '' 
    }

  } catch (error) {
    console.error(`[EventsHandler] Error:`, error)
    return {
      success: false,
      msg: 'Erreur interne lors de la recherche des evenements.'
    }
  }
}
