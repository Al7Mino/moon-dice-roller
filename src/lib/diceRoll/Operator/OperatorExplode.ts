import { DiceError } from "@lib/errors";
import { operatorExplodeRegex } from "../regex";
import type { Operation } from "../types";
import Operator from "./Operator";
import type { Selector } from "../Selector";
import type Dice from "../Dice";

/**
 * Class representing an explode operator.\
 * An explode operator is used to explode values from a given list filtered by the `selector`.
 * A dice explodes means a new dice is rolled.\
 * An exploding dice can also explodes.
 *
 * *A limit to the number of reroll is set to prevent infinite loop.*
 */
export default class OperatorExplode extends Operator {
	selector: Selector;
	private readonly limit: number = 30;

	constructor(selector: Selector) {
		super();
		this.selector = selector;
	}

	static isValidOperatorExplodeExpression(value: string): boolean {
		const regex = new RegExp(`^${operatorExplodeRegex.source}$`, "i");
		return regex.test(value);
	}

	executeOperation(results: number[], dice: Dice): Operation[] {
		const result: Operation[] = [];

		const filteredDices = this.selector.filter(results);
		const filteredIndexes = filteredDices.reduce((previousValue, currentValue) => [...previousValue, currentValue.index], [] as number[]);

		result.push(
			...results.map((value, index) => ({
				value,
				exploded: filteredIndexes.includes(index),
			})),
		);

		let offset = 1;
		for (const index of filteredIndexes) {
			let iterator = this.limit;
			let rerollDice = dice.rollOne();
			let filteredDice = this.selector.filter([rerollDice]);
			do {
				if (filteredDice.length) {
					result.splice(index + offset, 0, {
						value: rerollDice,
						exploded: true,
					});
					rerollDice = dice.rollOne();
					filteredDice = this.selector.filter([rerollDice]);
					offset++;
				}
				iterator--;
			} while (iterator > 0 && filteredDice.length > 0);

			if (iterator === 0 && filteredDice.length > 0) {
				throw new DiceError("Limite de lancer de dés atteinte !", {
					expression: `${dice.toString()}${this.toString()}`,
				});
			}

			result.splice(index + offset, 0, {
				value: rerollDice,
				exploded: false,
			});
			offset++;
		}

		return result;
	}

	toString(): string {
		return `e${this.selector.toString()}`;
	}
}
