import { occHandler } from "@features/occ/handler"



export default {
  variants: ["pick", "omit"],
  helper: "Filtre les syllabes (2-3 lettres) et leurs mots associés selon leur nombre d'occurrences. Syntaxe : <pick|omit> <min> [max]",
  fn: occHandler
}
