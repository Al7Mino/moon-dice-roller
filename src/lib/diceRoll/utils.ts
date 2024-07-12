import { operatorRegex, operatorWithSelectorRegex } from './regex';
import Dice from './Dice';
import DiceExpression from './DiceExpression';
import {
  Operator,
  OperatorKeep,
  OperatorDrop,
  OperatorReroll,
  OperatorRerollOnce,
  OperatorRerollAdd,
  OperatorRerollSubstract,
  OperatorExplode,
  OperatorMinimum,
  OperatorMaximum,
  OperatorWildDice,
} from './Operator';
import {
  Selector,
  SelectorLiteral,
  SelectorHighest,
  SelectorLowest,
  SelectorGreater,
  SelectorLower,
} from './Selector';

export const stringToDice = (expression: string): Dice => {
  if (!Dice.isValidDiceExpression(expression)) {
    throw new Error('This string is not a valid dice expression');
  }

  const diceSplitted = expression.split(/d/gi);
  const numberDices = diceSplitted[0] === '' ? 1 : parseInt(diceSplitted[0], 10);
  let sides = 0;
  if (diceSplitted[1] === '%') {
    sides = 100;
  } else {
    sides = parseInt(diceSplitted[1], 10);
  }
  return new Dice(sides, numberDices);
};

export const stringToOperator = (expression: string, selector: Selector): Operator | undefined => {
  if (!Operator.isValidOperatorExpression(expression)) {
    throw new Error('This string is not a valid operator expression');
  }
  if (OperatorKeep.isValidOperatorKeepExpression(expression)) {
    return new OperatorKeep(selector);
  }
  if (OperatorDrop.isValidOperatorDropExpression(expression)) {
    return new OperatorDrop(selector);
  }
  if (OperatorReroll.isValidOperatorRerollExpression(expression)) {
    return new OperatorReroll(selector);
  }
  if (OperatorRerollOnce.isValidOperatorRerollOnceExpression(expression)) {
    return new OperatorRerollOnce(selector);
  }
  if (OperatorRerollAdd.isValidOperatorRerollAddExpression(expression)) {
    return new OperatorRerollAdd(selector);
  }
  if (OperatorRerollSubstract.isValidOperatorRerollSubstractExpression(expression)) {
    return new OperatorRerollSubstract(selector);
  }
  if (OperatorExplode.isValidOperatorExplodeExpression(expression)) {
    return new OperatorExplode(selector);
  }
  if (OperatorMinimum.isValidOperatorMinimumExpression(expression)) {
    return new OperatorMinimum(selector);
  }
  if (OperatorMaximum.isValidOperatorMaximumExpression(expression)) {
    return new OperatorMaximum(selector);
  }
  if (OperatorWildDice.isValidOperatorWildDiceExpression(expression)) {
    return new OperatorWildDice(selector);
  }
  return;
};

export const stringToSelector = (expression: string): Selector | undefined => {
  if (!Selector.isValidSelectorExpression(expression)) {
    throw new Error('This string is not a valid selector expression');
  }
  if (SelectorHighest.isValidSelectorHighestExpression(expression)) {
    const split = expression.split('h');
    const value = parseInt(split[1], 10);
    return new SelectorHighest(value);
  }
  if (SelectorLowest.isValidSelectorLowestExpression(expression)) {
    const split = expression.split('l');
    const value = parseInt(split[1], 10);
    return new SelectorLowest(value);
  }
  if (SelectorGreater.isValidSelectorGreaterExpression(expression)) {
    const split = expression.split('>');
    const value = parseInt(split[1], 10);
    return new SelectorGreater(value);
  }
  if (SelectorLower.isValidSelectorLowerExpression(expression)) {
    const split = expression.split('<');
    const value = parseInt(split[1], 10);
    return new SelectorLower(value);
  }
  if (SelectorLiteral.isValidSelectorLiteralExpression(expression)) {
    const value = parseInt(expression, 10);
    return new SelectorLiteral(value);
  }
  return;
};

export const stringToOperatorWithSelector = (expression: string): Operator | undefined => {
  const regex = new RegExp(`^${operatorWithSelectorRegex.source}$`, 'i');
  if (!regex.test(expression)) {
    throw new Error('This string is not a valid operator with selector expression');
  }
  const splittedExpression = expression.split(new RegExp(`(${operatorRegex.source})`, 'gi'));
  // splittedExpression[0] === ''
  const operator = splittedExpression[1];
  const selector = splittedExpression[2];

  const resSelector = stringToSelector(selector);
  if (!resSelector) {
    return;
  }
  const resOperator = stringToOperator(operator, resSelector);
  return resOperator;
};

export const stringToDiceExpression = (expression: string): DiceExpression | undefined => {
  if (!DiceExpression.isValidDiceExpression(expression)) {
    throw new Error('This string is not a valid dice with operator expression');
  }
  const splittedExpression = expression.split(new RegExp(`(${operatorRegex.source})`, 'gi'));

  let dice = '';
  const operatorsAndSelectors: {operator: string, selector: string}[] = [];
  for (let index = 0; index < splittedExpression.length; index++) {
    if (index === 0) {
      dice = splittedExpression[0];
    } else if (index % 2 === 1) {
      operatorsAndSelectors.push({
        operator: splittedExpression[index],
        selector: '',
      });
    } else if (index % 2 === 0) {
      operatorsAndSelectors[operatorsAndSelectors.length - 1].selector = splittedExpression[index];
    }
  }

  const resDice = stringToDice(dice);

  if (!operatorsAndSelectors.length) {
    return new DiceExpression(resDice);
  }

  const resOperators = operatorsAndSelectors.map((value) => stringToOperatorWithSelector(`${value.operator}${value.selector}`));
  if (!resOperators.length) {
    return;
  }
  if (resOperators.some((value) => value === undefined)) {
    return;
  }

  return new DiceExpression(resDice, resOperators as Operator[]);
};