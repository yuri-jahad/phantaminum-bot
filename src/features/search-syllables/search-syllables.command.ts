import { searchSyllablesHandler } from './search-syllables.handler'

export default {
  variants: ['s', 'syllables', 'syllable', 'occ'],
  helper: "Trouve les syllabes avec un nombre d'occurrences spécifique",
  fn: searchSyllablesHandler
}
