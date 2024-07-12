import { diceRegex } from './regex';

export default class Dice {
  num: number;
  sides: number;
  constructor(sides: number, num?: number) {
    this.sides = sides;
    this.num = num && num > 0 ? num : 1;
  }

  static isDice(value: any): boolean {
    return value instanceof Dice;
  }

  static isValidDiceExpression(value: string): boolean {
    const regex = new RegExp(`^${diceRegex.source}$`, 'i');
    return regex.test(value);
  }

  rollOne(): number {
    return Math.ceil(Math.random() * this.sides);
  }

  roll(): number[] {
    const dices: number[] = [];
    for (let i = 0; i < this.num; i++) {
      const res = this.rollOne();
      dices.push(res);
    }
    return dices;
  }

  toString(): string {
    return `${this.num}d${this.sides}`;
  }
}