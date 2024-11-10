import { SelectorDiceError } from '@lib/errors';
import { operatorMaximumRegex } from '../regex';
import type { Operation } from '../types';
import Operator from './Operator';
import { Selector, SelectorGreater, SelectorLiteral } from '../Selector';

/**
 * Class representing a maximum operator.\
 * A maximum operator is used to set a maximum value to a given list. All values greater than `selector.value` are replaced by `selector.value`.
 */
export default class OperatorMaximum extends Operator {
  selector: Selector;

  constructor(selector: Selector) {
    super();
    this.selector = selector;
  }

  static isValidOperatorMaximumExpression(value: string): boolean {
    const regex = new RegExp(`^${operatorMaximumRegex.source}$`, 'i');
    return regex.test(value);
  }

  executeOperation(dices: number[]): Operation[] {
    if (!(this.selector instanceof SelectorLiteral)) {
      throw new SelectorDiceError(`\`${this.selector.toString()}\` n'est pas un sélecteur valide pour l'opération "maximum"`);
    }
    const trueSelector = new SelectorGreater(this.selector.value);
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
    return `ma${this.selector.toString()}`;
  }
}