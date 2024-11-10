import { operatorWildDiceRegex } from "../regex";
import type { Operation } from "../types";
import Operator from "./Operator";
import { Selector, SelectorLiteral } from "../Selector";
import type Dice from "../Dice";
import OperatorExplode from "./OperatorExplode";
import OperatorRerollSubstract from "./OperatorRerollSubstract";

export default class OperatorWildDice extends Operator {
	selector: Selector;

	constructor(selector: Selector) {
		super();
		this.selector = selector;
	}

	static isValidOperatorWildDiceExpression(value: string): boolean {
		const regex = new RegExp(`^${operatorWildDiceRegex.source}$`, "i");
		return regex.test(value);
	}

	executeOperation(dices: number[], dice: Dice): Operation[] {
		const filteredDices = this.selector.filter(dices);
		const filteredIndexes = filteredDices.reduce((previousValue, currentValue) => [...previousValue, currentValue.index], [] as number[]);

		const maxValue = dice.sides;
		const selectorMax = new SelectorLiteral(maxValue);
		const operatorExplode = new OperatorExplode(selectorMax);

		const minValue = 1;
		const selectorMin = new SelectorLiteral(minValue);
		const operatorRerollSubstract = new OperatorRerollSubstract(selectorMin);

		// Execute reroll and substract operation on filtered dices
		const resSubstractOperation = operatorRerollSubstract.executeOperation(
			filteredDices.map((value) => value.value),
			dice,
		);
		// Get index of the value that was rerolled (if exist)
		const indexDroppedValue = resSubstractOperation.findIndex((value) => value.dropped);
		// Filter result to get only unchanged values
		const filteredResult = resSubstractOperation.filter(
			(value, index) => !value.dropped || (index > 0 && !resSubstractOperation[index - 1].dropped),
		);

		// Execute explode operation on filtered result
		const resExplodeOperation = operatorExplode.executeOperation(
			filteredResult.map((value) => value.value),
			dice,
		);
		// Concatenate operations results
		const operationsResult = [...resExplodeOperation];
		if (indexDroppedValue !== -1) {
			operationsResult.unshift(resSubstractOperation[indexDroppedValue], resSubstractOperation[indexDroppedValue + 1]);
		}

		let i = 0;
		const result: Operation[] = [];
		for (let index = 0; index < dices.length; index++) {
			const value = dices[index];
			if (!filteredIndexes.includes(index)) {
				result.push({
					value,
				});
			} else {
				const operation = operationsResult[i];
				if (operation.dropped) {
					// Add the result of reroll
					result.push(operation, operationsResult[i + 1]);
					i += 2;
				} else if (operation.exploded) {
					// Add the result of exploded dice
					let op = operation;
					do {
						result.push(op);
						i++;
						op = operationsResult[i];
					} while (op.exploded && i < operationsResult.length);
					result.push(op);
				} else {
					result.push(operation);
					i++;
				}
			}
		}

		return result;
	}

	toString(): string {
		return `wl${this.selector.toString()}`;
	}
}
