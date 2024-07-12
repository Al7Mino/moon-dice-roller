import { diceWithOperatorRegex } from './regex';
import type { Operation } from './types';
import type Dice from './Dice';
import type { Operator } from './Operator';

export default class DiceExpression {
  dice: Dice;
  operators?: Operator[];
  constructor(dice: Dice, operators?: Operator | Operator[]) {
    this.dice = dice;
    this.operators = undefined;
    if (operators) {
      this.operators = Array.isArray(operators) ? operators : [operators];
    }
  }

  static isDiceExpression(value: any): boolean {
    return value instanceof DiceExpression;
  }

  static isValidDiceExpression(value: string): boolean {
    const regex = new RegExp(`^${diceWithOperatorRegex.source}$`, 'i');
    return regex.test(value);
  }

  run(): Operation[][] {
    const dices = this.dice.roll();
    if (!this.operators) {
      const result = dices.map((dice) => ({
        value: dice,
      }));
      return [result];
    }
    let dicesToOperate = [...dices];
    const operations: Operation[][] = [];
    for (const operator of this.operators) {
      const operationRes = operator.executeOperation(dicesToOperate, this.dice);
      operations.push(operationRes);
      dicesToOperate = operationRes.filter((value) => !value.dropped).map((value) => value.value);
    }
    return operations;
  }

  toString(): string {
    const result = `${this.dice.toString()}`;

    return this.operators ? `${result}${this.operators?.map((operator) => operator.toString()).join('')}` : result;
  }
}