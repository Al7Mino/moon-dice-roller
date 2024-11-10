import { SelectorDiceError } from '@lib/errors';
import { operatorMinimumRegex } from '../regex';
import type { Operation } from '../types';
import Operator from './Operator';
import { Selector, SelectorLiteral, SelectorLower } from '../Selector';

/**
 * Class representing a minimum operator.\
 * A minimum operator is used to set a minimum value to a given list. All values lower than `selector.value` are replaced by `selector.value`.
 */
export default class OperatorMinimum extends Operator {
  selector: Selector;

  constructor(selector: Selector) {
    super();
    this.selector = selector;
  }

  static isValidOperatorMinimumExpression(value: string): boolean {
    const regex = new RegExp(`^${operatorMinimumRegex.source}$`, 'i');
    return regex.test(value);
  }

  executeOperation(dices: number[]): Operation[] {
    if (!(this.selector instanceof SelectorLiteral)) {
      throw new SelectorDiceError(`\`${this.selector.toString()}\` n'est pas un sélecteur valide pour l'opération "minimum"`);
    }
    const trueSelector = new SelectorLower(this.selector.value);
    const filteredDices = trueSelector.filter(dices);
    const filteredIndexes = filteredDices.reduce((previousValue, currentValue) => (
      [...previousValue, currentValue.index]
    ), [] as number[]);
    const result = dices.map((dice, index) => (
      {
        previousValue: dice,
        value: filteredIndexes.includes(index) ? this.selector.value : dice,
        alter: filteredIndexes.includes(index),
      }
    ));
    return result;
  }

  toString(): string {
    return `mi${this.selector.toString()}`;
  }
}