import { computerHandler } from '@features/computer-infos/handler'
import { getIdHandler } from '@features/get-id/handler'

export default {
  variants: ["id"],
  helper: "Cherche l'identifiant du pseudo choisi.",
  fn: getIdHandler
}
