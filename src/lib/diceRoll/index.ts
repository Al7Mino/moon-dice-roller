import type { DetailedExpression } from "./types";
import DiceRollExpression from "./DiceRollExpression";
import DiceRollManager from "./DiceRollManager";

export const calculateDiceRollExpression = (
	diceRollString: string,
): {
	details: DetailedExpression[];
	total: number;
} => {
	if (!DiceRollExpression.isValidDiceRollExpression(diceRollString)) {
		throw new Error("Parameter is not a valid dice roll expression");
	}

	const manager = new DiceRollManager();

	const diceRollExpression = manager.parse(diceRollString);

	if (!diceRollExpression) {
		throw new Error("Impossible to parse dice roll expression");
	}

	const result = diceRollExpression.run();
	return result;
};

export const stringifyDiceRollDetails = (details: DetailedExpression[]): string => {
	const result: string[] = [];
	for (const detail of details) {
		if (!detail.details) {
			result.push(detail.expression);
		} else {
			result.push(detail.expression);
			if (detail.details.length > 1) {
				result.push("[");
			}
			for (const operation in detail.details) {
				const operationSet = detail.details[operation];
				const operations = operationSet.map((op) => {
					if (op.dropped) {
						return `~~${op.value}~~`;
					}
					if (op.alter) {
						return `${op.previousValue} -> ${op.value}`;
					}
					if (op.exploded) {
						return `${op.value}!`;
					}
					return `${op.value}`;
				});
				result.push(`(${operations.join(", ")})`);
				if (detail.details.length > 1 && detail.details.length > parseInt(operation, 10) + 1) {
					result.push(" | ");
				}
			}
			if (detail.details.length > 1) {
				result.push("]");
			}
		}
	}
	return result.join(" ");
};
