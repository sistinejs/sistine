/*
module.exports = {
  "roots": [
    "<rootDir>"
  ],
  "transform": {
    '^.+\\.tsx?$': 'ts-jest',
    // "\\.(css|less|scss)$": "./jest/stub-transformer.js"
  },
  // testRegex: '(/.*|(\\.|/)(test|spec))\\.tsx?$',
  testRegex: '(/tests/.*|(\\.|/))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  preset: 'ts-jest',
  testEnvironment: 'node',
}
*/

module.exports = {
  "roots": [
    "<rootDir>"
  ],
  testPathIgnorePatterns: [
      "<rootDir>/node_modules/.*",
      "<rootDir>/dist/.*"
  ],
  transform: {
    "<rootDir>/tests/^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

