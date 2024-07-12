import { operatorDropRegex } from '../regex';
import type { Operation } from '../types';
import Operator from './Operator';
import type { Selector } from '../Selector';

export default class OperatorDrop extends Operator {
  selector: Selector;

  constructor(selector: Selector) {
    super();
    this.selector = selector;
  }

  static isValidOperatorDropExpression(value: string): boolean {
    const regex = new RegExp(`^${operatorDropRegex.source}$`, 'i');
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
        dropped: filteredIndexes.includes(index),
      }
    ));
    return result;
  }

  toString(): string {
    return `p${this.selector.toString()}`;
  }
}