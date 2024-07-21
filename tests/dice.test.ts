import Dice from "../src/lib/diceRoll/Dice";

const diceString = "2d20";
const regularDice = new Dice(20, 2);
const zeroSideDiceString = "2d0";
const zeroSideDice = new Dice(0, 2);
const zeroNumDiceString = "0d20";
const zeroNumDice = new Dice(20, 0);
const floatDiceString = "1.2d10.6";
const floatDice = new Dice(10.6, 1.2);
const negativeDiceString = "-3d-10";
const negativeDice = new Dice(-10, -3);

describe("Validity of several dice value expressions", () => {
    test("\"2d20\" string is not a valid Dice", () => {
        expect(Dice.isDice(diceString)).toBeFalsy();
    });

    test("Dice \"2d20\" is a valid Dice", () => {
        expect(Dice.isDice(regularDice)).toBeTruthy();
    });

    test("Dice \"2d0\" is a valid Dice, convert to dice \"2d6\"", () => {
        expect(Dice.isDice(zeroSideDice)).toBeTruthy();
        expect(zeroSideDice.sides).toBe(6);
    });
    test("\"2d0\" is not a valid dice expression", () => {
        expect(Dice.isValidDiceExpression(zeroSideDiceString)).toBeFalsy();
    });

    test("Dice \"0d20\" is a valid Dice, convert to dice \"1d20\"", () => {
        expect(Dice.isDice(zeroNumDice)).toBeTruthy();
        expect(zeroNumDice.num).toBe(1);
    });
    test("\"0d20\" is not a valid dice expression", () => {
        expect(Dice.isValidDiceExpression(zeroNumDiceString)).toBeFalsy();
    });

    test("Dice \"1.2d10.6\" is a valid Dice, convert to dice \"1d10\"", () => {
        expect(Dice.isDice(floatDice)).toBeTruthy();
        expect(floatDice.num).toBe(1);
        expect(floatDice.sides).toBe(10);
    });
    test("\"1.2d10.6\" is not a valid dice expression", () => {
        expect(Dice.isValidDiceExpression(floatDiceString)).toBeFalsy();
    });

    test("Dice \"-3d-10\" is a valid Dice, convert to default dice \"1d6\"", () => {
        expect(Dice.isDice(negativeDice)).toBeTruthy();
        expect(negativeDice.num).toBe(1);
        expect(negativeDice.sides).toBe(6);
    });
    test("\"-3d-10\" is not a valid dice expression", () => {
        expect(Dice.isValidDiceExpression(negativeDiceString)).toBeFalsy();
    });
});