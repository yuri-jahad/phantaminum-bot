import { eventsHandler } from './handler'

export default {
  variants: ['events', 'event', 'battles', 'jams'],
  helper: 'Recherche les evenements hip-hop sur and8.dance. Exemple : .events battle ou .events jam france',
  fn: eventsHandler
}
