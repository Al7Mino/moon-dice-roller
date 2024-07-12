interface DiceErrorOptions extends ErrorOptions {
  expression?: string
}

export class DiceError extends Error {
  options?: DiceErrorOptions;
  constructor(message?: string, options?: DiceErrorOptions) {
    super(message);
    this.options = options;
  }
}

export class SelectorDiceError extends DiceError {}