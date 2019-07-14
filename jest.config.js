module.exports = {
  preset: "jest-expo",
  cacheDirectory: ".jest/cache",
  moduleFileExtensions: ["ts", "tsx", "js"],
  transform: {
    "^.+\\.(js|ts|tsx)$": "babel-jest"
  },
  setupFilesAfterEnv: ["<rootDir>setupTests.js"]
};
