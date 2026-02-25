import { searchWordsHandler } from '@features/search-words/search-words.handler'

export default {
  variants: ['c', 'search', 'dico', 'dictionary'],
  helper: 'Trouve les mots correspondants à syllabe ou à un motif regex.',
  config: {
    role: 'every',
    limit: {
      timeSecond: 30 * 60, // s
      max: 100
    }
  },

  fn: searchWordsHandler
}

/**
 *
 * OWNER :
 * -> Owner choisit le temps
 * -> Le nombre de tentatives par temps
 *
 * -> role du commanditaire de la commande
 * -> role des sous-commandes
 * -> valeur par défaut du nombre de solutions
 * -> Authorization des sous commandes
 *
 *
 *
 *
 *
 *
 */
