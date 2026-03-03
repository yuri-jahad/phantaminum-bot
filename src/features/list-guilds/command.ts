import { listGuildsHandler } from '@features/list-guilds/handler'

export default {
  variants: ['listguilds', 'guilds', 'lg', 'servers'],
  helper:
    'Affiche la liste des serveurs et salons où le bot est autorisé (Owner uniquement)',
  fn: listGuildsHandler
}
