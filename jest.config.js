
module.exports = {
  /*
  "roots": [
    "<rootDir>"
  ],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  */
  testPathIgnorePatterns: [
      "<rootDir>/node_modules/.*",
      "<rootDir>/dist/.*"
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleDirectories: [ "node_modules", "src" ]
};

