import { Argument } from '@sapphire/framework';
import DiceRollExpression from './../lib/diceRoll/DiceRollExpression';

export class DiceRollExpressionArgument extends Argument<string> {
  public constructor(context: Argument.LoaderContext) {
    super(context, { name: 'diceRollExpression' });
  }

  public run(parameter: string, context: Argument.Context) {
    const isMatching = DiceRollExpression.isValidDiceRollExpression(parameter);

    if (isMatching) {
      return this.ok(parameter);
    }

    return this.error({
      context,
      parameter,
      message: 'The provided argument could not be resolved to a dice roll expression.',
      identifier: 'ParameterNotADiceRollString',
    });
  }
}

declare module '@sapphire/framework' {
  interface ArgType {
    diceRollExpression: string;
  }
}
