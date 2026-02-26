import { showDefinitionshandler } from '@features/show-definitions/handler'

export default {
  variants: ['d', 'def', 'definition', 'define'],
  helper: "Affiche la définition d'un mot",
  security: {
    rules: {
      2: { minRole: 'admin', fallbackValue: '3' }
    }
  },

  fn: showDefinitionshandler
}
