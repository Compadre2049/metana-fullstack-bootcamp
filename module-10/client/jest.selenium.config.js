/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: [
        '<rootDir>/src/__tests__/selenium/setup.js'
    ],
    testMatch: [
        '<rootDir>/src/__tests__/selenium/**/*.test.js'
    ],
    transform: {
        '^.+\\.jsx?$': 'babel-jest'
    },
    testTimeout: 30000
}; 