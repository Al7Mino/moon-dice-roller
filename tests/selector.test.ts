import { SelectorGreater, SelectorHighest, SelectorLiteral, SelectorLower, SelectorLowest } from "../src/lib/diceRoll/Selector";

const diceResults = [1, 3, 3, 4, 2, 6, 1, 6, 5, 3];

describe("Validity of several selectors", () => {
    describe("SelectorLiteral filter", () => {
        test.each([
            {value: 3, expected: [{index: 1, value: 3}, {index: 2, value: 3}, {index: 9, value: 3}]},
            {value: 0, expected: []},
            {value: -1, expected: []},
            {value: 5.3, expected: []},
        ])(`Filter array [${diceResults.join(", ")}] with selector $value`, ({value, expected}) => {
            const selector = new SelectorLiteral(value);
            const res = selector.filter(diceResults);
            expect(res).toIncludeSameMembers(expected);
        });
    });

    describe("SelectorGreater filter", () => {
        test.each([
            {value: 3, expected: [{index: 3, value: 4}, {index: 5, value: 6}, {index: 7, value: 6}, {index: 8, value: 5}]},
            {value: -1, expected: diceResults.map((val, index) => ({index, value: val}))},
            {value: 4.3, expected: [{index: 5, value: 6}, {index: 7, value: 6}, {index: 8, value: 5}]},
        ])(`Filter array [${diceResults.join(", ")}] with selector >$value`, ({value, expected}) => {
            const selector = new SelectorGreater(value);
            const res = selector.filter(diceResults);
            expect(res).toIncludeSameMembers(expected);
        });
    });

    describe("SelectorLower filter", () => {
        test.each([
            {value: 3, expected: [{index: 0, value: 1}, {index: 4, value: 2}, {index: 6, value: 1}]},
            {value: -1, expected: []},
            {value: 4.3, expected: [{index: 0, value: 1}, {index: 1, value: 3}, {index: 2, value: 3}, {index: 3, value: 4}, {index: 4, value: 2}, {index: 6, value: 1}, {index: 9, value: 3}]},
        ])(`Filter array [${diceResults.join(", ")}] with selector <$value`, ({value, expected}) => {
            const selector = new SelectorLower(value);
            const res = selector.filter(diceResults);
            expect(res).toIncludeSameMembers(expected);
        });
    });

    describe("SelectorHighest filter", () => {
        test.each([
            {value: 3, expected: [{index: 5, value: 6}, {index: 7, value: 6}, {index: 8, value: 5}]},
            {value: 0, expected: []},
            {value: -1, expected: []},
            {value: 5.3, expected: [{index: 1, value: 3}, {index: 3, value: 4}, {index: 5, value: 6}, {index: 7, value: 6}, {index: 8, value: 5}]},
        ])(`Filter array [${diceResults.join(", ")}] with selector h$value`, ({value, expected}) => {
            const selector = new SelectorHighest(value);
            const res = selector.filter(diceResults);
            expect(res).toIncludeSameMembers(expected);
        });
    });

    describe("SelectorLowest filter", () => {
        test.each([
            {value: 3, expected: [{index: 0, value: 1}, {index: 4, value: 2}, {index: 6, value: 1}]},
            {value: 0, expected: []},
            {value: -1, expected: []},
            {value: 5.3, expected: [{index: 0, value: 1}, {index: 1, value: 3}, {index: 2, value: 3}, {index: 4, value: 2}, {index: 6, value: 1}]},
        ])(`Filter array [${diceResults.join(", ")}] with selector l$value`, ({value, expected}) => {
            const selector = new SelectorLowest(value);
            const res = selector.filter(diceResults);
            expect(res).toIncludeSameMembers(expected);
        });
    });
});