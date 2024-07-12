import { ApplyOptions } from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
  description: 'Test bot latency',
  preconditions: ['isAdmin'],
})
export class UserCommand extends Command {
  // Register slash and context menu command
  public override registerApplicationCommands(registry: Command.Registry) {
    // Register slash command
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
    });
  }

  // Message command
  public override async messageRun(message: Message): Promise<Message<boolean>> {
    const msg = await send(message, 'Ping?');

    const content = `Pong ! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
      (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)
    }ms.`;

    return send(message, content);
  }
  // slash command
  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<Message<boolean>> {
    const msg = await interaction.reply({ content: 'Ping?', ephemeral: true, fetchReply: true });

    if (isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
    }

    return interaction.editReply('Failed to retrieve ping :(');
  }
}
