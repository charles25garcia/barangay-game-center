// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@shared/(.*)$": "<rootDir>/src/@shared/$1",
    "^@code/(.*)$": "<rootDir>/src/@code/$1",
    "^@screens/(.*)$": "<rootDir>/src/screens/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
