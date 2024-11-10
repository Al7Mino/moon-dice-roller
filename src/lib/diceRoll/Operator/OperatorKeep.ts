import { operatorKeepRegex } from '../regex';
import type { Operation } from '../types';
import Operator from './Operator';
import type { Selector } from '../Selector';

/**
 * Class representing a keep operator.\
 * A keep operator is used to keep only the values from a given list that are filtered by the `selector`.
 */
export default class OperatorKeep extends Operator {
  selector: Selector;

  constructor(selector: Selector) {
    super();
    this.selector = selector;
  }

  static isValidOperatorKeepExpression(value: string): boolean {
    const regex = new RegExp(`^${operatorKeepRegex.source}$`, 'i');
    return regex.test(value);
  }

  executeOperation(dices: number[]): Operation[] {
    const filteredDices = this.selector.filter(dices);
    const filteredIndexes = filteredDices.reduce((previousValue, currentValue) => (
      [...previousValue, currentValue.index]
    ), [] as number[]);
    const result = dices.map((dice, index) => (
      {
        value: dice,
        dropped: !filteredIndexes.includes(index),
      }
    ));
    return result;
  }

  toString(): string {
    return `k${this.selector.toString()}`;
  }
}