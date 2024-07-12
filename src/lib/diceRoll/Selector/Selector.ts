import { selectorRegex } from '../regex';

export default abstract class Selector {
  abstract value: number;

  static isValidSelectorExpression(value: string): boolean {
    const regex = new RegExp(`^${selectorRegex.source}$`, 'i');
    return regex.test(value);
  }

  abstract filter(dices: number[]): {value: number, index: number}[]

  abstract toString(): string
}