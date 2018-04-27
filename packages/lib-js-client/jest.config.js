module.exports = {
  "collectCoverage": true,
  "collectCoverageFrom": [
    "src/**/*.{ts}",
  ],
  "transform": {
    ".*": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  "testRegex": "(\\.(spec))\\.(ts)$",
  "moduleFileExtensions": [
    "ts",
    "js"
  ]
}
