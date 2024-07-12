import { operatorRegex } from '../regex';
import type { Operation } from '../types';
import type { Selector } from '../Selector';
import type Dice from '../Dice';

export default abstract class Operator {
  abstract selector: Selector;

  static isValidOperatorExpression(value: string): boolean {
    const regex = new RegExp(`^${operatorRegex.source}$`, 'i');
    return regex.test(value);
  }

  abstract executeOperation(results: number[], dice?: Dice): Operation[]

  abstract toString(): string
}