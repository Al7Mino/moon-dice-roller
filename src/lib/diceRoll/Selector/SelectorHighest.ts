import { selectorHighestRegex } from '../regex';
import Selector from './Selector';

/**
 * Class representing a highest selector.\
 * A highest selector is used to keep the highest values from a given list. The number of highest values to keep is the selector's `value`.
 */
export default class SelectorHighest extends Selector {
  value: number;

  constructor(value: number) {
    super();
    this.value = Math.floor(value);
  }

  static isValidSelectorHighestExpression(value: string): boolean {
    const regex = new RegExp(`^${selectorHighestRegex.source}$`, 'i');
    return regex.test(value);
  }

  private filterNMax(array: {value: number, index: number}[], n: number): {value: number, index: number}[] {
    if (n < 1) {
      return [];
    }
    const maxValues: {value: number, index: number}[] = [];
    for (const element of array) {
      if (maxValues.length < n) {
        maxValues.push(element);
      } else {
        const min = Math.min(...maxValues.map((val) => val.value));
        if (element.value > min) {
          // Reverse max values to get the last index (instead of first)
          // This way, it's easier to know what happened
          const reversedMinIndex = maxValues.toReversed().findIndex((val) => val.value === min);
          const minIndex = Math.abs(reversedMinIndex - maxValues.length + 1);
          maxValues.splice(minIndex, 1, element);
        }
      }
    }
    return maxValues;
  }

  filter(dices: number[]): {value: number, index: number}[] {
    const mappedDices = dices.map((dice, index) => ({
      value: dice,
      index,
    }));
    const results = this.filterNMax(mappedDices, this.value);

    return results;
  }

  toString(): string {
    return `h${this.value}`;
  }
}