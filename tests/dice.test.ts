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
    describe("Check Dice.isValidDiceExpression", () => {
        test.each([
            [diceString, true],
            [zeroSideDiceString, false],
            [zeroNumDiceString, false],
            [floatDiceString, false],
            [negativeDiceString, false],
        ])("%s is %s", (value, expected) => {
            expected ? expect(Dice.isValidDiceExpression(value)).toBeTrue() : expect(Dice.isValidDiceExpression(value)).toBeFalse();
        });
    });

    describe("Check Dice.isDice", () => {
        test.each([
            {label: diceString, value: regularDice, expected: true, num: 2, sides: 20},
            {label: zeroSideDiceString, value: zeroSideDice, expected: true, num: 2, sides: 6},
            {label: zeroNumDiceString, value: zeroNumDice, expected: true, num: 1, sides: 20},
            {label: floatDiceString, value: floatDice, expected: true, num: 1, sides: 10},
            {label: negativeDiceString, value: negativeDice, expected: true, num: 1, sides: 6},
        ])("Dice $label is $expected, with num = $num and sides = $sides", ({value, expected, num, sides}) => {
            expected ? expect(Dice.isDice(value)).toBeTrue() : expect(Dice.isDice(value)).toBeFalse();
            if (num !== undefined) {
                expect(value.num).toBe(num);
            }
            if (sides !== undefined) {
                expect(value.sides).toBe(sides);
            }
        });
    });
});