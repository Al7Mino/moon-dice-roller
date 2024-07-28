import { selectorLowestRegex } from '../regex';
import Selector from './Selector';

/**
 * Class representing a lowest selector.\
 * A lowest selector is used to keep the lowest values from a given list. The number of lowest values to keep is the selector's `value`.
 */
export default class SelectorLowest extends Selector {
  value: number;

  constructor(value: number) {
    super();
    this.value = Math.floor(value);
  }

  static isValidSelectorLowestExpression(value: string): boolean {
    const regex = new RegExp(`^${selectorLowestRegex.source}$`, 'i');
    return regex.test(value);
  }

  private filterNMin(array: {value: number, index: number}[], n: number): {value: number, index: number}[] {
    if (n < 1) {
      return [];
    }
    const minValues: {value: number, index: number}[] = [];
    for (const element of array) {
      if (minValues.length < n) {
        minValues.push(element);
      } else {
        const max = Math.max(...minValues.map((val) => val.value));
        if (element.value < max) {
          // Reverse max values to get the last index (instead of first)
          // This way, it's easier to know what happened
          const reversedMaxIndex = minValues.toReversed().findIndex((val) => val.value === max);
          const maxIndex = Math.abs(reversedMaxIndex - minValues.length + 1);
          minValues.splice(maxIndex, 1, element);
        }
      }
    }
    return minValues;
  }

  filter(dices: number[]): {value: number, index: number}[] {
    const mappedDices = dices.map((dice, index) => ({
      value: dice,
      index,
    }));
    const results = this.filterNMin(mappedDices, this.value);

    return results;
  }

  toString(): string {
    return `l${this.value}`;
  }
}