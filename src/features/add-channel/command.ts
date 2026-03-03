import { addChannelHandler } from '@features/add-channel/handler'

export default {
  variants: ['addchannel', 'channeladd', 'ac'],
  helper:
    'Autorise le salon actuel à recevoir et exécuter les commandes du bot (Owner uniquement)',
  fn: addChannelHandler
}
