import { lexicHandler } from '@features/lexic/handler'

export default {
  variants: ['lexic', 'lexique'],
  helper:
    "Affiche la définition, les synonymes et les antonymes d'un mot. Exemple : .lexic maison",
  fn: lexicHandler
}
