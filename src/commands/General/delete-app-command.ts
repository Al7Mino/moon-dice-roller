import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
  aliases: ['del-cmd', 'delcmd', 'delCmd'],
  description: 'Delete application command',
  preconditions: ['OwnerOnly'],
  options: ['guild', 'g'],
})
export class DeleteAppCommandCommand extends Command {
  // Message command
  public override async messageRun(message: Message, args: Args): Promise<Message<boolean>> {
    const commandId = args.finished ? undefined : await args.pick('string');

    if (!commandId) {
      return send(message, 'Aucun id de commande...');
    }

    const guildOption = args.getOption('guild');
    const gOption = args.getOption('g');
    const guildId = guildOption || gOption;

    const logger = this.container.logger;

    let content = '';
    try {

      if (guildId) {
        // Delete guild command
        message.client.application?.commands.delete(commandId, guildId);
      } else {
        // Delete global command
        message.client.application?.commands.delete(commandId);
      }
      logger.info(`Successfully deleted application command ${commandId}`);
      content = 'La commande a été supprimée avec succès';
    } catch (error) {
      logger.error(error);
      content = 'Erreur: la commande n\'a pas pu être supprimée ou elle n\'existe pas';
    }

    return send(message, content);
  }
}
