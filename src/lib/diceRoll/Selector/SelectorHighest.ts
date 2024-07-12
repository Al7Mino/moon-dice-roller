import { selectorHighestRegex } from '../regex';
import Selector from './Selector';

export default class SelectorHighest extends Selector {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  static isValidSelectorHighestExpression(value: string): boolean {
    const regex = new RegExp(`^${selectorHighestRegex.source}$`, 'i');
    return regex.test(value);
  }

  private filterNMax(array: {value: number, index: number}[], n: number): {value: number, index: number}[] {
    const maxValues: {value: number, index: number}[] = [];
    for (const element of array) {
      if (maxValues.length < n) {
        maxValues.push(element);
      } else {
        const min = Math.min(...maxValues.map((val) => val.value));
        if (element.value > min) {
          const minIndex = maxValues.findIndex((val) => val.value === min);
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