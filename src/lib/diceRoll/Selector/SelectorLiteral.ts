import { selectorLiteralRegex } from "../regex";
import Selector from "./Selector";

/**
 * Class representing a literal selector.\
 * A literal selector is used to keep all values from a given list that are equal to the selector's `value`.
 */
export default class SelectorLiteral extends Selector {
	value: number;

	constructor(value: number) {
		super();
		this.value = value;
	}

	static isValidSelectorLiteralExpression(value: string): boolean {
		const regex = new RegExp(`^${selectorLiteralRegex.source}$`, "i");
		return regex.test(value);
	}

	filter(dices: number[]): { value: number; index: number }[] {
		const results = dices
			.map((dice, index) => ({
				value: dice,
				index,
			}))
			.filter((dice) => dice.value === this.value);

		return results;
	}

	toString(): string {
		return `${this.value}`;
	}
}
