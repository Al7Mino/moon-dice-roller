import { diceRegex } from "./regex";

export default class Dice {
	num: number;
	sides: number;
	constructor(sides: number, num?: number) {
		this.sides = sides > 0 ? Math.floor(sides) : 6;
		this.num = num && num > 0 ? Math.floor(num) : 1;
	}

	static isDice(value: any): value is Dice {
		return value instanceof Dice;
	}

	static isValidDiceExpression(value: string): boolean {
		const regex = new RegExp(`^${diceRegex.source}$`, "i");
		return regex.test(value);
	}

	rollOne(): number {
		const rand = Math.random();
		return Math.ceil(rand * this.sides) || 1;
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
