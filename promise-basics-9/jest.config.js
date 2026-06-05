module.exports = {
  verbose: true,
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^(\\.\\/.+)\\.js$': '$1',
  },
};
