/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        url: 'http://localhost:3000',
        html: '<!DOCTYPE html><html><head></head><body></body></html>'
    },
    setupFilesAfterEnv: [
        '@testing-library/jest-dom',
        '<rootDir>/src/__tests__/setup.js'
    ],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
    },
    testMatch: [
        '<rootDir>/src/__tests__/**/*.test.js',
        '!<rootDir>/src/__tests__/selenium/**/*.test.js'
    ],
    moduleDirectories: [
        'node_modules',
        'src'
    ]
}; 