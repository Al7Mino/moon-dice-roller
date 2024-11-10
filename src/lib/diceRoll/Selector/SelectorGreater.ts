import { selectorGreaterRegex } from '../regex';
import Selector from './Selector';

/**
 * Class representing a greater selector.\
 * A greater selector is used to keep all values from a given list that are greater than the selector's `value`.
 */
export default class SelectorGreater extends Selector {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  static isValidSelectorGreaterExpression(value: string): boolean {
    const regex = new RegExp(`^${selectorGreaterRegex.source}$`, 'i');
    return regex.test(value);
  }

  filter(dices: number[]): {value: number, index: number}[] {
    const results = dices.map((dice, index) => ({
      value: dice,
      index,
    }))
      .filter((dice) => dice.value > this.value);

    return results;
  }

  toString(): string {
    return `>${this.value}`;
  }
}