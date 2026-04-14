// jest.config.js
const nextJest = require('next/jest')

// next/jest sets up the transform and module resolution that matches Next.js
const createJestConfig = nextJest( {dir: './' })

module.exports = createJestConfig({
    testEnvironment: 'node',            // jsdom for Reach components, 'node' for API/lib code
    setupFilesAfterFramework: [],       // add global setup later if needed
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',     // matches tsconfig path alias
    },
})