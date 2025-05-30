export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/'],
  verbose: true,
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/utils/', '/__tests__/setup.js']
};
