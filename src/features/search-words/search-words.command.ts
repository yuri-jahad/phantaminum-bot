import { searchWordsHandler } from '@features/search-words/search-words.handler'

export default {
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
