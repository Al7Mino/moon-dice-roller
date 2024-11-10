class JestMockRandom {
    private readonly loopValues: number[];
    private _jestMockRandomFn?: jest.SpyInstance<number, [], any>;
    get jestMockRandomFn(): jest.SpyInstance<number, [], any> | undefined {
        return this._jestMockRandomFn;
    }

    constructor(values: number[]) {
        this.loopValues = values;
    }

    private mockRandomImplementation = (fn: () => number) => jest.spyOn(global.Math, 'random').mockImplementation(fn);

    private mockRandomFn = () => {
        let index = 0;
        return this.mockRandomImplementation(() => {
            const i = index % this.loopValues.length;
            index += 1;
            return this.loopValues[i];
        });
    };

    initialize = () => {
        this._jestMockRandomFn = this.mockRandomFn();
    }
    
    addOnce = (values: number[]) => {
        for (const element of values) {
            this._jestMockRandomFn = this._jestMockRandomFn?.mockImplementationOnce(() => element);
        }
        return this._jestMockRandomFn;
    };

    restore = () => {
        jest.spyOn(global.Math, 'random').mockRestore();
    };
}

export const mockRandomForAll = (values: number[]) => {
    const mockRandom = new JestMockRandom(values);
    beforeAll(() => {
        mockRandom.initialize();
    });

    afterAll(() => {
        mockRandom.restore();
    });

    return mockRandom;
}

export const mockRandomForEach = (values: number[]) => {
    const mockRandom = new JestMockRandom(values);
    beforeEach(() => {
        mockRandom.initialize();
    });
    
    afterEach(() => {
        mockRandom.restore();
    });

    return mockRandom;
}

export const mockRandomOnce = (values: number[], mockRandom?: JestMockRandom) => {
    if (mockRandom) {
        return mockRandom.addOnce(values);
    }
    const newMockRandom = new JestMockRandom(values);
    newMockRandom.initialize();
    return newMockRandom;
}