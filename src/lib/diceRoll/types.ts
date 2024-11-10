export type Operation = {
	previousValue?: number;
	value: number;
	dropped?: boolean;
	alter?: boolean;
	exploded?: boolean;
};

export type DetailedExpression = {
	expression: string;
	details?: Operation[][];
};
