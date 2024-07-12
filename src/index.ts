import 'module-alias/register';

import './lib/setup';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';

const client = new SapphireClient({
  defaultPrefix: '!',
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Debug,
  },
  shards: 'auto',
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  loadMessageCommandListeners: true,
});

const main = async () => {
  try {
    client.logger.info('Logging in');
    const token = process.env.TOKEN;
    await client.login(token);
    client.logger.info('logged in');
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
};

main();
