module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/tests/style-mock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
