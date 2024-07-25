import { operatorRerollSubstractRegex } from '../regex';
import type { Operation } from '../types';
import Operator from './Operator';
import type { Selector } from '../Selector';
import type Dice from '../Dice';

/**
 * Class representing a reroll and substract operator.\
 * A reroll and substract operator is used to reroll the first value from a given list filtered by the `selector`, then substract the value of the new roll.
 */
export default class OperatorRerollSubstract extends Operator {
  selector: Selector;

  constructor(selector: Selector) {
    super();
    this.selector = selector;
  }

  static isValidOperatorRerollSubstractExpression(value: string): boolean {
    const regex = new RegExp(`^${operatorRerollSubstractRegex.source}$`, 'i');
    return regex.test(value);
  }

  executeOperation(rolls: number[], dice: Dice): Operation[] {
    const result: Operation[] = [];

    const filteredDices = this.selector.filter(rolls);

    const filteredIndex = filteredDices.length ? filteredDices[0].index : undefined;

    result.push(
      ...rolls.map((value, index) => (
        {
          value,
          dropped: filteredIndex === index,
        }
      )),
    );

    if (filteredIndex !== undefined) {
      const rerollDice: number = dice.rollOne();
      result.splice(filteredIndex + 1, 0, {
        value: -rerollDice,
      });
    }

    return result;
  }

  toString(): string {
    return `rs${this.selector.toString()}`;
  }
}