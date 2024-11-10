import { SelectorGreater, SelectorHighest, SelectorLiteral, SelectorLower, SelectorLowest } from "../src/lib/diceRoll/Selector";
import { OperatorDrop, OperatorExplode, OperatorKeep, OperatorMaximum, OperatorMinimum, OperatorReroll, OperatorRerollAdd, OperatorRerollOnce, OperatorRerollSubstract } from "../src/lib/diceRoll/Operator";
import { Operation } from "../src/lib/diceRoll/types";
import { mockRandomForEach, mockRandomOnce } from "./jestMockRandom";
import Dice from "@lib/diceRoll/Dice";

const selectorLiteral = new SelectorLiteral(3);
const selectorGreater = new SelectorGreater(3);
const selectorLower = new SelectorLower(3);
const selectorHighest = new SelectorHighest(3);
const selectorLowest = new SelectorLowest(3);

const diceResults = [1, 3, 3, 4, 2, 6, 1, 6, 5, 3];

const defaultRandValues = [0.5, 0, 0.9999999]; // 3, 1, 6

describe("Validity of several operators", () => {
    describe("OperatorDrop execute", () => {
        const mapDrop = (expectedDropIndexes: number[]) => (val: number, index: number): Operation => (
            {value: val, dropped: expectedDropIndexes.includes(index)}
        );
        test.each([
            {label: selectorLiteral.toString(), value: selectorLiteral, expected: diceResults.map(mapDrop([1, 2, 9]))},
            {label: selectorGreater.toString(), value: selectorGreater, expected: diceResults.map(mapDrop([3, 5, 7, 8]))},
            {label: selectorLower.toString(), value: selectorLower, expected: diceResults.map(mapDrop([0, 4, 6]))},
            {label: selectorHighest.toString(), value: selectorHighest, expected: diceResults.map(mapDrop([5, 7, 8]))},
            {label: selectorLowest.toString(), value: selectorLowest, expected: diceResults.map(mapDrop([0, 4, 6]))},
        ])(`Execute operator "p" from array [${diceResults.join(", ")}] with selector $label`, ({value, expected}) => {
            const operator = new OperatorDrop(value);
            const res = operator.executeOperation(diceResults);
            expect(res).toIncludeSameMembers(expected);
        });
    });

    describe("OperatorKeep execute", () => {
        const mapKeep = (expectedKeepIndexes: number[]) => (val: number, index: number): Operation => (
            {value: val, dropped: !expectedKeepIndexes.includes(index)}
        );
        test.each([
            {label: selectorLiteral.toString(), value: selectorLiteral, expected: diceResults.map(mapKeep([1, 2, 9]))},
            {label: selectorGreater.toString(), value: selectorGreater, expected: diceResults.map(mapKeep([3, 5, 7, 8]))},
            {label: selectorLower.toString(), value: selectorLower, expected: diceResults.map(mapKeep([0, 4, 6]))},
            {label: selectorHighest.toString(), value: selectorHighest, expected: diceResults.map(mapKeep([5, 7, 8]))},
            {label: selectorLowest.toString(), value: selectorLowest, expected: diceResults.map(mapKeep([0, 4, 6]))},
        ])(`Execute operator "k" from array [${diceResults.join(", ")}] with selector $label`, ({value, expected}) => {
            const operator = new OperatorKeep(value);
            const res = operator.executeOperation(diceResults);
            expect(res).toIncludeSameMembers(expected);
        });
    });

    describe("OperatorMaximum execute", () => {
        const mapMax = (expectedAlterIndexes: number[], max: number) => (val: number, index: number): Operation => (
            {previousValue: val, value: expectedAlterIndexes.includes(index) ? max : val, alter: expectedAlterIndexes.includes(index)}
        );
        test.each([
            {label: selectorLiteral.toString(), value: selectorLiteral, expected: diceResults.map(mapMax([3, 5, 7, 8], selectorLiteral.value))},
            {label: selectorGreater.toString(), value: selectorGreater},
            {label: selectorLower.toString(), value: selectorLower},
            {label: selectorHighest.toString(), value: selectorHighest},
            {label: selectorLowest.toString(), value: selectorLowest},
        ])(`Execute operator "ma" from array [${diceResults.join(", ")}] with selector $label`, ({value, expected}) => {
            const operator = new OperatorMaximum(value);
            if (!expected) {
                expect(() => operator.executeOperation(diceResults)).toThrow();
                return;
            }
            const res = operator.executeOperation(diceResults);
            expect(res).toIncludeSameMembers(expected);
        });
    });

    describe("OperatorMinimum execute", () => {
        const mapMin = (expectedAlterIndexes: number[], max: number) => (val: number, index: number): Operation => (
            {previousValue: val, value: expectedAlterIndexes.includes(index) ? max : val, alter: expectedAlterIndexes.includes(index)}
        );
        test.each([
            {label: selectorLiteral.toString(), value: selectorLiteral, expected: diceResults.map(mapMin([0, 4, 6], selectorLiteral.value))},
            {label: selectorGreater.toString(), value: selectorGreater},
            {label: selectorLower.toString(), value: selectorLower},
            {label: selectorHighest.toString(), value: selectorHighest},
            {label: selectorLowest.toString(), value: selectorLowest},
        ])(`Execute operator "mi" from array [${diceResults.join(", ")}] with selector $label`, ({value, expected}) => {
            const operator = new OperatorMinimum(value);
            if (!expected) {
                expect(() => operator.executeOperation(diceResults)).toThrow();
                return;
            }
            const res = operator.executeOperation(diceResults);
            expect(res).toIncludeSameMembers(expected);
        });
    });

    describe("OperatorReroll execute", () => {
        const mockRandContext = mockRandomForEach(defaultRandValues);
        test("Throw error when too much reroll", () => {
            const rollArray = new Array(30).fill(0.5);
            mockRandomOnce(rollArray, mockRandContext);

            const operator = new OperatorReroll(selectorLiteral);
            expect(() => operator.executeOperation(diceResults, new Dice(6))).toThrow();
        });

        const reduceReroll = (expectedRerollIndexes: number[], expectedRandValuesRerollIndex?: number[]) => {
            let rerollIndex = 0;
            return (prev: Operation[], current: number, index: number): Operation[] => {
                if (!expectedRerollIndexes.includes(index)) {
                    return [
                        ...prev,
                        {value: current, dropped: false}
                    ];
                }
                const res: Operation[] = [{
                    value: current,
                    dropped: true,
                }];
                let shouldReroll = expectedRandValuesRerollIndex?.includes(rerollIndex) ?? false;
                do {
                    shouldReroll = expectedRandValuesRerollIndex?.includes(rerollIndex) ?? false;
                    res.push({
                        value: Math.ceil(defaultRandValues[rerollIndex] * 6) || 1,
                        dropped: shouldReroll,
                    });
                    rerollIndex ++;
                    rerollIndex = rerollIndex % defaultRandValues.length;
                } while (shouldReroll);
                return [
                    ...prev,
                    ...res,
                ];
            };
        };
        test.each([
            {label: selectorLiteral.toString(), value: selectorLiteral, expected: diceResults.reduce(reduceReroll([1, 2, 9], [0]), [])},
            {label: selectorGreater.toString(), value: selectorGreater, expected: diceResults.reduce(reduceReroll([3, 5, 7, 8], [2]), [])},
            {label: selectorLower.toString(), value: selectorLower, expected: diceResults.reduce(reduceReroll([0, 4, 6], [1]), [])},
            {label: selectorHighest.toString(), value: selectorHighest},
            {label: selectorLowest.toString(), value: selectorLowest},
        ])(`Execute operator "rr" from array [${diceResults.join(", ")}] with selector $label`, ({value, expected}) => {
            const operator = new OperatorReroll(value);
            if (!expected) {
                expect(() => operator.executeOperation(diceResults, new Dice(6))).toThrow();
                return;
            }
            const res = operator.executeOperation(diceResults, new Dice(6));
            expect(res).toIncludeSameMembers(expected ?? []);
        });
    });

    describe("OperatorRerollOnce execute", () => {
        mockRandomForEach(defaultRandValues);

        const reduceReroll = (expectedRerollIndexes: number[]) => {
            let rerollIndex = 0;
            return (prev: Operation[], current: number, index: number): Operation[] => {
                if (!expectedRerollIndexes.includes(index)) {
                    return [
                        ...prev,
                        {value: current, dropped: false}
                    ];
                }
                const res = [
                    {
                        value: current,
                        dropped: true,
                    },
                    {
                        value: Math.ceil(defaultRandValues[rerollIndex] * 6) || 1,
                        dropped: false,
                    },
                ];
                rerollIndex ++;
                rerollIndex = rerollIndex % defaultRandValues.length;
                return [
                    ...prev,
                    ...res,
                ];
            };
        };
        test.each([
            {label: selectorLiteral.toString(), value: selectorLiteral, expected: diceResults.reduce(reduceReroll([1, 2, 9]), [])},
            {label: selectorGreater.toString(), value: selectorGreater, expected: diceResults.reduce(reduceReroll([3, 5, 7, 8]), [])},
            {label: selectorLower.toString(), value: selectorLower, expected: diceResults.reduce(reduceReroll([0, 4, 6]), [])},
            {label: selectorHighest.toString(), value: selectorHighest, expected: diceResults.reduce(reduceReroll([5, 7, 8]), [])},
            {label: selectorLowest.toString(), value: selectorLowest, expected: diceResults.reduce(reduceReroll([0, 4, 6]), [])},
        ])(`Execute operator "ro" from array [${diceResults.join(", ")}] with selector $label`, ({value, expected}) => {
            const operator = new OperatorRerollOnce(value);
            if (!expected) {
                expect(() => operator.executeOperation(diceResults, new Dice(6))).toThrow();
                return;
            }
            const res = operator.executeOperation(diceResults, new Dice(6));
            expect(res).toIncludeSameMembers(expected ?? []);
        });
    });

    describe("OperatorRerollAdd execute", () => {
        mockRandomForEach(defaultRandValues);

        const reduceRerollAdd = (expectedRerollIndexes: number[]) => {
            let rerollIndex = 0;
            return (prev: Operation[], current: number, index: number): Operation[] => {
                if (!expectedRerollIndexes.includes(index)) {
                    return [
                        ...prev,
                        {value: current, exploded: false}
                    ];
                }
                const res = [
                    {
                        value: current,
                        exploded: true,
                    },
                    {
                        value: Math.ceil(defaultRandValues[rerollIndex] * 6) || 1,
                    },
                ];
                rerollIndex ++;
                rerollIndex = rerollIndex % defaultRandValues.length;
                return [
                    ...prev,
                    ...res,
                ];
            };
        };
        test.each([
            {label: selectorLiteral.toString(), value: selectorLiteral, expected: diceResults.reduce(reduceRerollAdd([1]), [])},
            {label: selectorGreater.toString(), value: selectorGreater, expected: diceResults.reduce(reduceRerollAdd([3]), [])},
            {label: selectorLower.toString(), value: selectorLower, expected: diceResults.reduce(reduceRerollAdd([0]), [])},
            {label: selectorHighest.toString(), value: selectorHighest, expected: diceResults.reduce(reduceRerollAdd([5]), [])},
            {label: selectorLowest.toString(), value: selectorLowest, expected: diceResults.reduce(reduceRerollAdd([0]), [])},
        ])(`Execute operator "ra" from array [${diceResults.join(", ")}] with selector $label`, ({value, expected}) => {
            const operator = new OperatorRerollAdd(value);
            if (!expected) {
                expect(() => operator.executeOperation(diceResults, new Dice(6))).toThrow();
                return;
            }
            const res = operator.executeOperation(diceResults, new Dice(6));
            expect(res).toIncludeSameMembers(expected ?? []);
        });
    });

    describe("OperatorRerollSubstract execute", () => {
        mockRandomForEach(defaultRandValues);

        const reduceRerollSubstract = (expectedRerollIndexes: number[]) => {
            let rerollIndex = 0;
            return (prev: Operation[], current: number, index: number): Operation[] => {
                if (!expectedRerollIndexes.includes(index)) {
                    return [
                        ...prev,
                        {value: current, dropped: false}
                    ];
                }
                const res = [
                    {
                        value: current,
                        dropped: true,
                    },
                    {
                        value: -Math.ceil(defaultRandValues[rerollIndex] * 6) || 1,
                    },
                ];
                rerollIndex ++;
                rerollIndex = rerollIndex % defaultRandValues.length;
                return [
                    ...prev,
                    ...res,
                ];
            };
        };
        test.each([
            {label: selectorLiteral.toString(), value: selectorLiteral, expected: diceResults.reduce(reduceRerollSubstract([1]), [])},
            {label: selectorGreater.toString(), value: selectorGreater, expected: diceResults.reduce(reduceRerollSubstract([3]), [])},
            {label: selectorLower.toString(), value: selectorLower, expected: diceResults.reduce(reduceRerollSubstract([0]), [])},
            {label: selectorHighest.toString(), value: selectorHighest, expected: diceResults.reduce(reduceRerollSubstract([5]), [])},
            {label: selectorLowest.toString(), value: selectorLowest, expected: diceResults.reduce(reduceRerollSubstract([0]), [])},
        ])(`Execute operator "rs" from array [${diceResults.join(", ")}] with selector $label`, ({value, expected}) => {
            const operator = new OperatorRerollSubstract(value);
            if (!expected) {
                expect(() => operator.executeOperation(diceResults, new Dice(6))).toThrow();
                return;
            }
            const res = operator.executeOperation(diceResults, new Dice(6));
            expect(res).toIncludeSameMembers(expected ?? []);
        });
    });

    describe("OperatorExplode execute", () => {
        const mockRandContext = mockRandomForEach(defaultRandValues);
        test("Throw error when too much reroll", () => {
            const rollArray = new Array(30).fill(0.5);
            mockRandomOnce(rollArray, mockRandContext);

            const operator = new OperatorExplode(selectorLiteral);
            expect(() => operator.executeOperation(diceResults, new Dice(6))).toThrow();
        });

        const reduceReroll = (expectedRerollIndexes: number[], expectedRandValuesRerollIndex?: number[]) => {
            let rerollIndex = 0;
            return (prev: Operation[], current: number, index: number): Operation[] => {
                if (!expectedRerollIndexes.includes(index)) {
                    return [
                        ...prev,
                        {value: current, exploded: false}
                    ];
                }
                const res: Operation[] = [{
                    value: current,
                    exploded: true,
                }];
                let shouldReroll = expectedRandValuesRerollIndex?.includes(rerollIndex) ?? false;
                do {
                    shouldReroll = expectedRandValuesRerollIndex?.includes(rerollIndex) ?? false;
                    res.push({
                        value: Math.ceil(defaultRandValues[rerollIndex] * 6) || 1,
                        exploded: shouldReroll,
                    });
                    rerollIndex ++;
                    rerollIndex = rerollIndex % defaultRandValues.length;
                } while (shouldReroll);
                return [
                    ...prev,
                    ...res,
                ];
            };
        };
        test.each([
            {label: selectorLiteral.toString(), value: selectorLiteral, expected: diceResults.reduce(reduceReroll([1, 2, 9], [0]), [])},
            {label: selectorGreater.toString(), value: selectorGreater, expected: diceResults.reduce(reduceReroll([3, 5, 7, 8], [2]), [])},
            {label: selectorLower.toString(), value: selectorLower, expected: diceResults.reduce(reduceReroll([0, 4, 6], [1]), [])},
            {label: selectorHighest.toString(), value: selectorHighest},
            {label: selectorLowest.toString(), value: selectorLowest},
        ])(`Execute operator "e" from array [${diceResults.join(", ")}] with selector $label`, ({value, expected}) => {
            const operator = new OperatorExplode(value);
            if (!expected) {
                expect(() => operator.executeOperation(diceResults, new Dice(6))).toThrow();
                return;
            }
            const res = operator.executeOperation(diceResults, new Dice(6));
            expect(res).toIncludeSameMembers(expected ?? []);
        });
    });
});