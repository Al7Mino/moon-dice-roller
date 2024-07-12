import { selectorLowestRegex } from '../regex';
import Selector from './Selector';

export default class SelectorLowest extends Selector {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  static isValidSelectorLowestExpression(value: string): boolean {
    const regex = new RegExp(`^${selectorLowestRegex.source}$`, 'i');
    return regex.test(value);
  }

  private filterNMin(array: {value: number, index: number}[], n: number): {value: number, index: number}[] {
    const minValues: {value: number, index: number}[] = [];
    for (const element of array) {
      if (minValues.length < n) {
        minValues.push(element);
      } else {
        const max = Math.max(...minValues.map((val) => val.value));
        if (element.value < max) {
          const maxIndex = minValues.findIndex((val) => val.value === max);
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