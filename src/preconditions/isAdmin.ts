import { AllFlowsPrecondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, PermissionsBitField } from 'discord.js';

export class UserPrecondition extends AllFlowsPrecondition {
  #message = 'This command can only be used by administrators.';

  public override chatInputRun(interaction: CommandInteraction) {
    return this.checkAdminPermission(interaction.memberPermissions);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.checkAdminPermission(interaction.memberPermissions);
  }

  public override messageRun(message: Message) {
    return this.checkAdminPermission(message.member?.permissions);
  }

  private checkAdminPermission(permissions?: PermissionsBitField | null) {
    const hasAdminPermission = permissions?.has('Administrator', true);
    return hasAdminPermission ? this.ok() : this.error({ message: this.#message });
  }
}

declare module '@sapphire/framework' {
	interface Preconditions {
		isAdmin: never;
	}
}
