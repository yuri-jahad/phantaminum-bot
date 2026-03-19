import { conjugaisonHandler } from './handler'

export default {
  variants: ['conjugaison', 'conj', 'conjuguer'],
  helper:   "Conjugaison d'un verbe (Verbiste). Exemple : .conj avoir | .conj partir futur",
  fn:       conjugaisonHandler
}
