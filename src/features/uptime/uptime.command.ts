import { uptimeHandler } from '@features/uptime/uptime.handler'

export default {
  variants: ['uptime', 'up'],
  helper: 'Affiche depuis combien de temps le bot est en ligne',
  fn: uptimeHandler
}
