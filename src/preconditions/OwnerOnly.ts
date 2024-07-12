import { AllFlowsPrecondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';

const owners = ['295635515355561984'];

export class UserPrecondition extends AllFlowsPrecondition {
  #message = 'Cette commande peut être utilisé uniquement par le propriétaire du bot.';

  public override chatInputRun(interaction: CommandInteraction) {
    return this.doOwnerCheck(interaction.user.id);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.doOwnerCheck(interaction.user.id);
  }

  public override messageRun(message: Message) {
    return this.doOwnerCheck(message.author.id);
  }

  private doOwnerCheck(userId: Snowflake) {
    return owners && owners.includes(userId) ? this.ok() : this.error({ message: this.#message });
  }
}

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
	}
}
