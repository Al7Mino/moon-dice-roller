import { swDiceWithOperatorRegex } from "./regex";
import { stringToDiceExpression } from "./utils";
import DiceRollExpression from "./DiceRollExpression";
import DiceExpression from "./DiceExpression";

export default class DiceRollManager {
	parse(expression: string): DiceRollExpression | undefined {
		if (!DiceRollExpression.isValidDiceRollExpression(expression)) {
			throw new Error("This string is not a valid dice roll expression");
		}

		let noWhitespaceString = expression.replace(/\s/g, "");

		// Parse sw dice shortcut expression
		// Get all sw dices expression
		const matchesSWDices = noWhitespaceString.match(new RegExp(swDiceWithOperatorRegex.source, "gi"));
		if (matchesSWDices) {
			for (const swDice of matchesSWDices) {
				// Extract number of dices
				// Ex: matchGroups = [10dsw, 10]
				const matchGroups = swDice.match(swDiceWithOperatorRegex);
				if (matchGroups) {
					const number = matchGroups[1] ? parseInt(matchGroups[1], 10) : 1;
					// Construct real dice expression
					const resDiceExpressionString = number > 1 ? `d6wl<7+${number - 1}d6` : "d6wl<7";
					noWhitespaceString = noWhitespaceString.replace(swDice, resDiceExpressionString);
				}
			}
		}

		const splittedString = noWhitespaceString.split(/([+-])/g);

		const result = splittedString.map((value) => {
			if (value === "+" || value === "-") {
				return value;
			} else if (/^\d+$/.test(value)) {
				const num = parseInt(value, 10);
				return num;
			} else if (DiceExpression.isValidDiceExpression(value)) {
				return stringToDiceExpression(value);
			}
			return;
		});

		const res: any = result.filter((value) => value !== undefined);

		return new DiceRollExpression(res);
	}
}
