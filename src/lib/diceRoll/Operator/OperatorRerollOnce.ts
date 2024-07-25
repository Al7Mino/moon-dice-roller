import { operatorRerollOnceRegex } from '../regex';
import type { Operation } from '../types';
import Operator from './Operator';
import type { Selector } from '../Selector';
import type Dice from '../Dice';

/**
 * Class representing a reroll once operator.\
 * A reroll once operator is used to reroll values from a given list once.
 */
export default class OperatorRerollOnce extends Operator {
  selector: Selector;

  constructor(selector: Selector) {
    super();
    this.selector = selector;
  }

  static isValidOperatorRerollOnceExpression(value: string): boolean {
    const regex = new RegExp(`^${operatorRerollOnceRegex.source}$`, 'i');
    return regex.test(value);
  }

  executeOperation(rolls: number[], dice: Dice): Operation[] {
    const result: Operation[] = [];

    const filteredDices = this.selector.filter(rolls);
    const filteredIndexes = filteredDices.reduce((previousValue, currentValue) => (
      [...previousValue, currentValue.index]
    ), [] as number[]);

    result.push(
      ...rolls.map((value, index) => (
        {
          value,
          dropped: filteredIndexes.includes(index),
        }
      )),
    );

    let offset = 1;
    for (const index of filteredIndexes) {
      const rerollDice = dice.rollOne();
      result.splice(index + offset, 0, {
        value: rerollDice,
      });
      offset++;
    }

    return result;
  }

  toString(): string {
    return `ro${this.selector.toString()}`;
  }
}