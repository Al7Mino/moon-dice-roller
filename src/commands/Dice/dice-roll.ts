import { ApplyOptions } from '@sapphire/decorators';
import { Command, Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { ApplicationCommandOptionType, ApplicationCommandType, type Message } from 'discord.js';
import { calculateDiceRollExpression, stringifyDiceRollDetails } from '@lib/diceRoll/index';
import { coreRollExpressionRegex } from '@lib/diceRoll/regex';
import { DiceError, SelectorDiceError } from '@lib/errors';

@ApplyOptions<Command.Options>({
  name: 'roll',
  aliases: ['r'],
  description: 'Effectue un lancer de dé à partir d\'une expression de jet de dés',
  detailedDescription: {
    description: `Lance n'importe quelle combinaison de dés au format \`XdY\` (\`1d6\`, \`2d8\`, etc).\n
		Plusieurs jets peuvent être liés ensemble. Les opérateurs mathématiques suivants peuvent être utilisés : \`+ -\`\n
		Un jet peut utiliser l'option \`-details\` ou \`-d\` pour obtenir le détail du jet (en plus du total).
    Il peut également être nommé en renseignant un libellé après le jet.
    On peut répéter un même jet avec l'option \`-repeat\` ou \`-r\` en précisant le nombre de fois que le jet doit être lancé.\n
		__Utilisation__
		\`!r <jet> [-details|d] [-repeat|r]=X [nom]\`\n
		*__Exemples__*
		\`!r d20\` - Lance un d20
		\`!r d20+5\` - Lance un d20 et ajoute 5 au résultat
		\`!r -d d100+d6 Mon jet\` - Additionne le résultat du jet d'un d100 et d'un d6 (intitulé "Mon jet"). Affiche le détail de ce jet de dé
    \`!r 2d20 -r=2\` - Lance 2 fois 2d20.\n
    **Options avancées**\n`,
    fields: [
      {
        name: '__Opérateurs__',
        value: `Les opérateurs se placent juste après une expression de dé \`XdY\` et sont directement suivis d'un sélecteur.\n
				Ils permettent d'effectuer une opération sur un jet de dés (parmi les résultats qui correspondent au sélecteur).\n
				\`k\` - keep - Conserve les valeurs sélectionnées.
				\`p\` - drop - Supprime les valeurs sélectionnées.
				\`rr\` - reroll - Relance toutes les valeurs sélectionnées jusqu'à ce que plus aucune ne correspondent au sélecteur.
				\`ro\` - reroll once - Relance toutes les valeurs sélectionnées une seule fois.
				\`ra\` - reroll and add - Relance une valeur sélectionnée une seule fois. Conserve le jet original et ajoute le nouveau.
        \`rs\` - reroll and substract - Relance une valeur sélectionnée une seule fois. Supprime le jet original et soustrait le nouveau.
				\`e\` - explode - Relance un dé supplémentaire pour chaque valeur sélectionnée. Le nouveau résultat peut aussi exploser.
				\`mi\` - minimum - Fixe la valeur minimale de chaque dé (seul le sélecteur littéral est autorisé).
				\`ma\` - maximum - Fixe la valeur maximale de chaque dé (seul le sélecteur littéral est autorisé).
        \`wl\` - wild - Définit toutes les valeurs sélectionnées comme des "wild dice", qui explosent à leur valeur maximale, et se relancent et soustraient à leur valeur minimale (1).\n`,
      },
      {
        name: '__Sélecteurs__',
        value: `Les sélecteurs se placent juste après un opérateur.\n
				Ils permettent de sélectionner les résultats d'un jet de dé pour lesquels appliquer l'opération de l'opérateur.\n
				\`X\` | Valeur X exactement
				\`lX\` | Les X plus petites valeurs
				\`hX\` | Les X plus grandes valeurs
				\`>X\` | Plus grand que X
				\`<X\` | Plus petit que X\n`,
      },
      {
        name: '__Opérations spéciales__',
        value: `Certaines écritures spéciales sont autorisées.\n
				Elle sont généralement des raccourcis pour des opérations de dés complexes.\n
				\`Xdsw\` - Lance X dés respectant les règles du jdr Star Wars D6 : le premier dé est un "wild dice" à 6 faces, les autres sont des d6 normaux.
        Cette écriture est un raccourci pour l'opération \`1d6wl<7 + Yd6\` *(où Y = X-1)*.\n`,
      },
      {
        name: '*__Exemples__*',
        value: `\`!r 2d20kh1\` - Lance deux d20 et garde le plus grand
				\`!r 10d6k6\` - Lance 10d6 et garde seulement ceux qui ont fait un 6
				\`!r 2d20pl1\` - Lance 2d20 et supprime le plus petit (équivalent à \`!r 2d20kh1\`)
				\`!r 10d6k>2\` - Lance 10d6 et garde ceux qui ont fait 3 ou plus
				\`!r 10d6rr<3\` - Lance 10d6 et relance tous ceux qui ont fait 1 ou 2, jusqu'à ce que toutes les valeurs soient supérieures ou égales à 3
				\`!r 10d6ro1\` - Lance 10d6 et relance tous les 1. Les nouveaux jets sont conservés (même si c'est de nouveau 1)
				\`!r 10d6ra6\` - Lance 10d6. Si un dé a fait 6, relance 1d6 et ajoute le résultat
        \`!r 10d6rs1\` - Lance 10d6. Si un dé a fait 6, supprime le. Ensuite relance 1d6 et soustrait le résultat
				\`!r 10d6e6\` - Lance 10d6. Pour chaque 6, relance 1d6 et ajoute le résultat. Si un ou plusieurs dés relancés font de nouveau 6, on répète l'opération
				\`!r 10d6mi2\` - Lance 10d6 et fixe le minimum à 2
				\`!r 10d6ma5\` - Lance 10d6 et fixe le maximum à 5
        \`!r 10d6wl<7\` - Lance 10d6 qui sont tous des "wild dice". Tous les 6 explosent. Tous les 1 sont supprimés et pour chacun, relance 1d6 et soustrait le résultat`,
      },
    ],
  },
  flags: ['details', 'd'],
  options: ['repeat', 'r'],
})
export class DiceRollCommand extends Command {
  // Register slash and context menu command
  public override registerApplicationCommands(registry: Command.Registry) {
    // Register slash command
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'dices',
          description: 'Expression du jet de dés à lancer',
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'label',
          description: 'Libellé du jet de dés',
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: 'details',
          description: 'Afficher les détails du résultat du lancer de dés',
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: 'repeat',
          description: 'Effectue X fois le jet de dés',
        },
      ],
    });
    registry.registerContextMenuCommand({
      name: 'Lance le jet de dés',
      type: ApplicationCommandType.Message,
    });
  }

  private buildResultDiceRoll(
    expression: string,
    label?: string | null,
    hasDetails?: boolean | null,
    repeat?: number | null,
    initialMessage?: string,
  ): string | undefined {
    try {
      let content = label ? `**${label}**\n` : '';
      content += initialMessage ? `Lance \`${initialMessage}\`\n` : '';

      if (!repeat || repeat < 1) {
        const resultCalc = calculateDiceRollExpression(expression);
        if (hasDetails) {
          const details = stringifyDiceRollDetails(resultCalc.details);
          content += `**Résultat**: ${details}\n`;
          content += `**Total**: ${resultCalc.total}`;
        } else {
          content += resultCalc.total;
        }
        return content;
      }

      const totals = [];
      if (hasDetails) {
        content += '**Résultats**:\n';
      }
      for (let i = 0; i < repeat; i++) {
        const resultCalc = calculateDiceRollExpression(expression);
        if (hasDetails) {
          const details = stringifyDiceRollDetails(resultCalc.details);
          content += `${details}\n`;
        }
        totals.push(resultCalc.total);
      }
      if (hasDetails) {
        content += '**Totaux**: ';
      }
      content += `(${totals.join(', ')})`;

      return content;
    } catch (error) {
      if (error instanceof DiceError) {
        const errorExpression = error.options?.expression;
        const errorMessage = `Erreur : ${error.message}${errorExpression ? ` (dans \`${errorExpression}\`)` : ''}`;
        return errorMessage;
      }
      if (error instanceof SelectorDiceError) {
        const errorMessage = `Erreur : ${error.message}`;
        return errorMessage;
      }
      return;
    }
  }

  // Message command
  public override async messageRun(message: Message, args: Args) {
    if (args.finished) {
      return send(message, 'Aucune expression de jet de dés...');
    }
    const argString = await args.rest('string');
    const matches = argString.match(new RegExp(`^${coreRollExpressionRegex.source}`, 'i'));

    if (!matches) {
      throw new Error('The provided argument could not be resolved to a dice roll expression.');
    }

    const expression = matches[0];
    const argStringSplitted = argString.split(expression);
    const label = argStringSplitted.length > 1 ? argStringSplitted[1].trim() : '';
    const hasDetails = args.getFlags('details', 'd');
    const repeatString = args.getOption('repeat', 'r');
    const repeat = repeatString ? parseInt(repeatString, 10) : null;

    const content = this.buildResultDiceRoll(expression, label, hasDetails, repeat && isNaN(repeat) ? null : repeat);
    return send(message, content || '');
  }
  // Slash command
  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const expression = interaction.options.getString('dices', true);
    const label = interaction.options.getString('label');
    const hasDetails = interaction.options.getBoolean('details');
    const repeat = interaction.options.getInteger('repeat');

    const content = this.buildResultDiceRoll(expression, label, hasDetails, repeat);
    return await interaction.reply({
      content,
    });
  }
  // Context menu command
  public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
    if (!interaction.isMessageContextMenuCommand()) {
      throw new Error('Interaction should be a MessageContextMenuCommand interaction !');
    }

    const message = interaction.targetMessage.content;
    const regex = new RegExp(`^!r.*${coreRollExpressionRegex.source}`, 'i');
    if (!regex.test(message)) {
      return await interaction.reply({
        content: 'Le message sélectionné ne correspond pas à une expression de jet de dés valide.',
        ephemeral: true,
      });
    }

    const coreNoCaptureGroup = coreRollExpressionRegex.source.replace(/\(/g, '(?:');
    const detailsRegex = /-{1,2}(?:details|d)/i;
    const repeatRegex = /-{1,2}(?:repeat|r)=\d*/i;
    const splitRegex = new RegExp(`((?:${coreNoCaptureGroup})|(?:${detailsRegex.source})|(?:${repeatRegex.source}))`, 'i');
    const splittedMessage = message.split(splitRegex);

    let expression = '';
    let label = '';
    let hasDetails = false;
    let repeat: number | null = null;

    for (const res of splittedMessage) {
      const resNoWhiteSpace = res.replace(/\s/g, '');
      if (new RegExp(`^${detailsRegex.source}$`, 'i').test(resNoWhiteSpace)) {
        hasDetails = true;
      } else if (new RegExp(`^${repeatRegex.source}$`, 'i').test(resNoWhiteSpace)) {
        const repeatSplit = res.split('=');
        const repeatString = repeatSplit[1];
        repeat = repeatString ? parseInt(repeatString, 10) : null;
      } else if (new RegExp(`^${coreRollExpressionRegex.source}$`, 'i').test(resNoWhiteSpace)) {
        expression = resNoWhiteSpace;
      } else if (resNoWhiteSpace !== '!r' && resNoWhiteSpace !== '') {
        label = resNoWhiteSpace;
      }
    }

    const content = this.buildResultDiceRoll(expression, label, hasDetails, repeat && isNaN(repeat) ? null : repeat, message);
    return await interaction.reply({
      content,
    });
  }
}
