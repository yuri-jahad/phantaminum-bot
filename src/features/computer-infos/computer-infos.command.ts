import { computerHandler } from '@features/computer-infos/computer-infos.handler'

export default {
  variants: ['computer', 'sys', 'system'],
  helper: 'Affiche les informations matérielles du serveur hébergeant le bot',
  fn: computerHandler
}
