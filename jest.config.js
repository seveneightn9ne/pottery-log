module.exports = {
  preset: "jest-expo",
  cacheDirectory: ".jest/cache",
  moduleFileExtensions: ["ts", "tsx", "js"],
  transform: {
    "^.+\\.(js|ts|tsx)$": "babel-jest"
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  // Jest needs to compile some node_modules because they aren't plain js - specified below
  transformIgnorePatterns: [
    "node_modules/(?!(react-native.*|@?sentry.*|expo-.*|@unimodules)/)"
  ]
};
