import { searchWordsHandler } from '@features/search-words/handler'

export default {
  variants: ['c', 'search', 'dico', 'dictionary'],
  helper: 'Recherche par regex dans le dico complet ou dans une liste grammaticale. Syntaxe : .c [liste?] <pattern>\nListes : nom, verbe, adjectif, adverbe, pronom, preposition, conjonction, article, interjection, participe, determinant, numeral, demonyme, animal',
  config: {
    role: 'every',
    limit: {
      fallback: 10
    }
  },
  fn: searchWordsHandler
}
