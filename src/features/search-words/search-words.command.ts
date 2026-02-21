import { searchWordsHandler } from '@features/search-words/search-words.handler'
import type { CommandModel } from '@features/search-words/search-words.type'

export const searchWordsCommand: CommandModel = {
  variants: ['c', 'search', 'dico', 'dictionary'],
  helper: 'Trouve les mots correspondants à syllabe ou à un motif regex.',
  config: {
    role: 'every',
    rateLimit: 5,
    itemsLimit: {
      authorization: ['every'],
      default: 20,
      max: {
        public: 40,
        staff: 200
      }
    }
  },

  fn: searchWordsHandler
}
