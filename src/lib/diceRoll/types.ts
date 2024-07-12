export interface Operation {
  previousValue?: number,
  value: number,
  dropped?: boolean,
  alter?: boolean,
  exploded?: boolean
}

export interface DetailedExpression {
  expression: string,
  details?: Operation[][];
}