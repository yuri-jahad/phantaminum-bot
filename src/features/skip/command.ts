import { skipHandler } from './handler'

export default {
  variants: ['skip', 'passer'],
  helper:   'Passe la syllabe en cours dans un jeu `.sg`. Exemple : `.skip`',
  fn:       skipHandler
}
