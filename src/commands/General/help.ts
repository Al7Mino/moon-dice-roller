import { ApplyOptions } from '@sapphire/decorators';
import { Command, Args, container, CommandOptions, PreconditionContainerReturn } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { APIEmbedField, BaseMessageOptions, Message, EmbedBuilder, ApplicationCommandOptionType, InteractionResponse } from 'discord.js';
import { splitMessage } from '@lib/utils';

@ApplyOptions<Command.Options>({
  description: 'Informations sur l\'utilisation de MoonDiceRoller',
  detailedDescription: `Présente l'aide pour le bot ou une commande spécifique.\n
  __Utilisation__
  \`!help [command]\`\n
  *__Exemples__*
  \`!help\` - Affiche l'aide générale et la liste des commandes
  \`!help roll\` - Affiche l'aide de la commande roll`,
})
export class HelpCommand extends Command {
  // Register slash and context menu command
  public override registerApplicationCommands(registry: Command.Registry) {
    // Register slash command
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'command',
          description: 'Commande du bot sur laquelle obtenir des informations',
        },
      ],
    });
  }

  /**
   * Return all bot commands
   * @returns Array containing all commands
   */
  private getCommands(): Command<Args, CommandOptions>[] {
    const commandStore = container.stores.get('commands');
    const commands = commandStore.map((value) => value);
    return commands;
  }

  /**
   * Find a command by its name
   * @param command Command's name
   * @returns Found command, or undefined
   */
  private findCommand(command: string): Command<Args, CommandOptions> | undefined {
    const commands = this.getCommands();
    const result = commands.find((cmd) => cmd.name === command || cmd.aliases.includes(command));
    return result;
  }

  /**
   * Filter commands to display only accessible commands
   * @param filter Filter function used to filter accessible command (through preconditions)
   * @returns Array containing accessible commands
   */
  private async filterAccessibleCommands(
    filter: (cmd: Command<Args, CommandOptions>) => PreconditionContainerReturn,
  ): Promise<Command<Args, CommandOptions>[]> {
    const commands = this.getCommands();

    const asyncFilter = async (
      array: Command<Args, CommandOptions>[],
      predicate: (value: Command<Args, CommandOptions>, index?: number) => Promise<boolean>,
    ) => {
      const results = await Promise.all(array.map(predicate));

      return array.filter((_v, index) => results[index]);
    };

    const filteredCommands = await asyncFilter(commands, (async (cmd) => {
      const result = await filter(cmd);
      return result.isOk();
    }));
    return filteredCommands;
  }

  /**
   * Create the embed message used by the `help` command when no command is given
   * @param filter Filter function used to filter accessible command (through preconditions)
   * @returns Embed message
   */
  private async buildDefaultEmbedMessage(
    filter: (cmd: Command<Args, CommandOptions>) => PreconditionContainerReturn,
  ): Promise<EmbedBuilder> {
    const filteredCommands = await this.filterAccessibleCommands(filter);

    const fields = filteredCommands.reduce((previousValue, currentValue) => {
      const name = currentValue.name;
      const description = currentValue.description;
      const category = currentValue.fullCategory[0];
      const index = previousValue.findIndex((value) => value.name === category);
      if (index === -1) {
        return [
          ...previousValue,
          {
            name: category,
            value: `**${name}** - ${description}`,
          },
        ];
      }
      const newValue: APIEmbedField[] = [...previousValue];
      newValue[index].value = `${previousValue[index].value}
      **${name}** - ${description}`;
      return [
        ...newValue,
      ];
    }, [] as APIEmbedField[]);

    const embed = new EmbedBuilder({
      color: 13836804,
      description: `MoonDiceRoller est un bot de jet de dés.\n
      Pour en apprendre plus sur une commande spécifique, utiliser la commande \`help [command]\`.`,
      fields,
    });
    return embed;
  }

  /**
   * Create the embed message used by the `help` command when command is given
   * @param command Command's name
   * @returns Embed message
   */
  private buildDetailEmbedMessage(command: string): EmbedBuilder | undefined {
    const cmd = this.findCommand(command);

    if (!cmd) {
      return;
    }

    const allAliases = [cmd.name, ...cmd.aliases];
    const commandName = allAliases.length > 1 ? `[${allAliases.join('|')}]` : cmd.name;
    const title = `!${commandName}`;

    const options = typeof cmd.detailedDescription === 'string' ?
      { description: cmd.detailedDescription.toString() } :
      cmd.detailedDescription;

    const embed = new EmbedBuilder({
      color: 13836804,
      title,
      ...options,
    });

    return embed;
  }

  // Message command
  public override async messageRun(message: Message, args: Args): Promise<Message<boolean>> {
    let command = undefined;
    if (!args.finished) {
      command = await args.rest('string');
    }

    let embed: EmbedBuilder | undefined = command ?
      this.buildDetailEmbedMessage(command) :
      await this.buildDefaultEmbedMessage((cmd) => cmd.preconditions.messageRun(message, this));

    if (!embed) {
      embed = await this.buildDefaultEmbedMessage((cmd) => cmd.preconditions.messageRun(message, this));
    }

    const messageOptions: BaseMessageOptions = { embeds: [embed.data] };
    const messages = splitMessage(messageOptions);

    for (const messageOption of messages) {
      message.author.send(messageOption);
    }

    return await send(message, 'Je vous ai envoyé l\'aide dans vos DMs.');
  }
  // Slash command
  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
    const command = interaction.options.getString('command');

    let embed: EmbedBuilder | undefined = command ?
      this.buildDetailEmbedMessage(command) :
      await this.buildDefaultEmbedMessage((cmd) => cmd.preconditions.chatInputRun(interaction, this));

    if (!embed) {
      embed = await this.buildDefaultEmbedMessage((cmd) => cmd.preconditions.chatInputRun(interaction, this));
    }

    const messageOptions: BaseMessageOptions = { embeds: [embed.data] };
    const messages = splitMessage(messageOptions);

    for (const messageOption of messages) {
      interaction.user.send(messageOption);
    }

    return await interaction.reply('Je vous ai envoyé l\'aide dans vos DMs.');
  }
}
