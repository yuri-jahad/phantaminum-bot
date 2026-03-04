import { lexiconHandler } from './handler'

export default {
  variants: ['phon', 'son'],
  helper:
    'Recherche des mots par le SON et le nombre de syllabes. Exemple : .c zo 2 (Trouve les mots de 2 syllabes contenant le son "zo")',
  fn: lexiconHandler
}
