import Dice from "../src/lib/diceRoll/Dice";
import DiceExpression from "../src/lib/diceRoll/DiceExpression";

const dice = new Dice(20, 2);
const simpleDiceExpressionString = "2d20";
const simpleDiceExpression = new DiceExpression(dice);

describe("Validity of several dice expressions", () => {
    test("\"2d20\" string is not a valid DiceExpression", () => {
        expect(Dice.isDice(simpleDiceExpressionString)).toBeFalsy();
    });

    test("DiceExpression \"2d20\" is a valid DiceExpression", () => {
        expect(Dice.isDice(simpleDiceExpression)).toBeTruthy();
    });
});