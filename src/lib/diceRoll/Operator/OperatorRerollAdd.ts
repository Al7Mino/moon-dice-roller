import { operatorRerollAddRegex } from '../regex';
import type { Operation } from '../types';
import Operator from './Operator';
import type { Selector } from '../Selector';
import type Dice from '../Dice';

export default class OperatorRerollAdd extends Operator {
  selector: Selector;

  constructor(selector: Selector) {
    super();
    this.selector = selector;
  }

  static isValidOperatorRerollAddExpression(value: string): boolean {
    const regex = new RegExp(`^${operatorRerollAddRegex.source}$`, 'i');
    return regex.test(value);
  }

  executeOperation(rolls: number[], dice: Dice): Operation[] {
    const result: Operation[] = [];

    const filteredDices = this.selector.filter(rolls);

    const filteredIndex = filteredDices.length ? filteredDices[0].index : undefined;

    result.push(
      ...rolls.map((value, index) => (
        {
          value,
          exploded: filteredIndex === index,
        }
      )),
    );

    if (filteredIndex !== undefined) {
      const rerollDice: number = dice.rollOne();
      result.splice(filteredIndex + 1, 0, {
        value: rerollDice,
      });
    }

    return result;
  }

  toString(): string {
    return `ra${this.selector.toString()}`;
  }
}