import { rollExpressionRegex } from './regex';
import type { DetailedExpression } from './types';
import DiceExpression from './DiceExpression';

export default class DiceRollExpression {
  expressionArray: (DiceExpression | number | '+' | '-')[];
  constructor(expressionArray: (DiceExpression | number | '+' | '-')[]) {
    this.expressionArray = expressionArray;
  }

  static isDiceRollExpression(value: any): value is DiceRollExpression {
    return value instanceof DiceRollExpression;
  }

  static isValidDiceRollExpression(value: string): boolean {
    return rollExpressionRegex.test(value);
  }

  run(): {
    details: DetailedExpression[],
    total: number
    } {
    const details: DetailedExpression[] = [];
    let total = 0;
    let isMinus = false;
    for (const expression of this.expressionArray) {
      if (expression === '+' || expression === '-') {
        isMinus = expression === '-';
        details.push({
          expression,
        });
      } else if (typeof expression === 'number') {
        total = isMinus ? total - expression : total + expression;
        details.push({
          expression: expression.toString(10),
        });
      } else if (expression instanceof DiceExpression) {
        const operations = expression.run();
        const finalOperation = operations[operations.length - 1];
        const dicesTotal = finalOperation.reduce((previousValue, currentValue) => {
          if (currentValue.dropped) {
            return previousValue;
          }
          return previousValue + currentValue.value;
        }, 0);
        total = isMinus ? total - dicesTotal : total + dicesTotal;
        details.push({
          expression: expression.toString(),
          details: operations,
        });
      }
    }
    return {
      details,
      total,
    };
  }
}