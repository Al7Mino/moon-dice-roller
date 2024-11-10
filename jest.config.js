/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  rootDir: ".",
  preset: 'ts-jest',
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  setupFilesAfterEnv: ["jest-extended/all"],
  moduleNameMapper: {
    "@arguments/(.*)": "<rootDir>/src/arguments/$1",
    "@lib/(.*)": "<rootDir>/src/lib/$1",
    "@data/(.*)": "<rootDir>/src/data/$1"
  },
};