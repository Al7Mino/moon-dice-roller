import { selectorLowerRegex } from '../regex';
import Selector from './Selector';

/**
 * Class representing a lower selector.\
 * A lower selector is used to keep all values from a given list that are lower than the selector's `value`.
 */
export default class SelectorLower extends Selector {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  static isValidSelectorLowerExpression(value: string): boolean {
    const regex = new RegExp(`^${selectorLowerRegex.source}$`, 'i');
    return regex.test(value);
  }

  filter(dices: number[]): {value: number, index: number}[] {
    const results = dices.map((dice, index) => ({
      value: dice,
      index,
    }))
      .filter((dice) => dice.value < this.value);

    return results;
  }

  toString(): string {
    return `<${this.value}`;
  }
}