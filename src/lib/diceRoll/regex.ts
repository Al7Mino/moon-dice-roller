//
// DICE REGEX
//

const percentageSidesRegex = /%/i;
const siP = percentageSidesRegex.source;

const swSidesRegex = /sw/i;
const siSw = swSidesRegex.source;

// Regex (ex: 10dsw)
const swDiceRegex = new RegExp(`([1-9]\\d*)?d${siSw}`, "i");
const dsw = swDiceRegex.source;

// Regex (ex: 3d6, d20, d%, 10dsw)
export const diceRegex = new RegExp(`([1-9]\\d*)?d(([1-9]\\d*)|${siP}|${siSw})`, "i");
const ds = diceRegex.source;

//
// OPERATOR REGEX
//

// Regex (ex: k)
export const operatorKeepRegex = /k/i;
const ok = operatorKeepRegex.source;

// Regex (ex: p)
export const operatorDropRegex = /p/i;
const od = operatorDropRegex.source;

// Regex (ex: rr)
export const operatorRerollRegex = /rr/i;
const orr = operatorRerollRegex.source;

// Regex (ex: ro)
export const operatorRerollOnceRegex = /ro/i;
const oro = operatorRerollOnceRegex.source;

// Regex (ex: ra)
export const operatorRerollAddRegex = /ra/i;
const ora = operatorRerollAddRegex.source;

// Regex (ex: rs)
export const operatorRerollSubstractRegex = /rs/i;
const ors = operatorRerollSubstractRegex.source;

// Regex (ex: e)
export const operatorExplodeRegex = /e/i;
const oe = operatorExplodeRegex.source;

// Regex (ex: mi)
export const operatorMinimumRegex = /mi/i;
const omi = operatorMinimumRegex.source;

// Regex (ex: ma)
export const operatorMaximumRegex = /ma/i;
const oma = operatorMaximumRegex.source;

// Regex (ex: wl)
export const operatorWildDiceRegex = /wl/i;
const owild = operatorWildDiceRegex.source;

export const operatorRegex = new RegExp(`${ok}|${od}|${orr}|${oro}|${ora}|${ors}|${oe}|${omi}|${oma}|${owild}`, "i");
const os = operatorRegex.source;

//
// SELECTOR REGEX
//

// Regex (ex: 2)
export const selectorLiteralRegex = /([1-9]\d*)/i;
const sl = selectorLiteralRegex.source;

// Regex (ex: h2)
export const selectorHighestRegex = /(h[1-9]\d*)/i;
const sh = selectorHighestRegex.source;

// Regex (ex: l2)
export const selectorLowestRegex = /(l[1-9]\d*)/i;
const slo = selectorLowestRegex.source;

// Regex (ex: >2)
export const selectorGreaterRegex = /(>[1-9]\d*)/i;
const sgt = selectorGreaterRegex.source;

// Regex (ex: <2)
export const selectorLowerRegex = /(<[1-9]\d*)/i;
const slt = selectorLowerRegex.source;

export const selectorRegex = new RegExp(`${sh}|${slo}|${sgt}|${slt}|${sl}`, "i");
const slcts = selectorRegex.source;

// Regex (ex: k2, kh1)
export const operatorWithSelectorRegex = new RegExp(`(${os})(${slcts})`, "i");
const ows = operatorWithSelectorRegex.source;

// Regex (ex: 3d6, 2d20kh2, 10d6kh5mi2)
export const diceWithOperatorRegex = new RegExp(`${ds}(${ows})*`, "i");
const dos = diceWithOperatorRegex.source;

// Regex (ex: 10dswkh5)
export const swDiceWithOperatorRegex = new RegExp(`${dsw}(?:${ows.replace(/\(/g, "(?:")})*`, "i");

// Regex (ex: d20, 2d10 + 5 + 1d6, 2d20kh2 + 5 + 1d6)
export const coreRollExpressionRegex = new RegExp(`${dos}(\\s?[+-]\\s?((${dos})|\\d+))*`, "i");
export const rollExpressionRegex = new RegExp(`^${coreRollExpressionRegex.source}$`, "i");
