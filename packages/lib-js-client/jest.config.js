module.exports = {
  "collectCoverage": true,
  "collectCoverageFrom": [
    "src/**/*.{ts}",
  ],
  "transform": {
    ".*": `${__dirname}/../../node_modules/ts-jest/preprocessor.js`
  },
  "testRegex": "(\\.(spec))\\.(ts)$",
  "moduleFileExtensions": [
    "ts",
    "js"
  ]
}
