import { deleteChannelHandler } from '@features/delete-channel/handler'

export default {
  variants: ['deletechannel', 'delchannel', 'dc', 'removechannel'],
  helper:
    'Retire le salon actuel de la liste blanche du bot (Owner uniquement)',
  fn: deleteChannelHandler
}
