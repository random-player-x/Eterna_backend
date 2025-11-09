/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
module.exports = {
  // Preset for TypeScript with ESM support
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  
  // Tell Jest to treat .ts files as ES Modules
  extensionsToTreatAsEsm: ['.ts'],
  
  // Module mapper to handle .js extensions in import paths
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // Transform .ts files using ts-jest with ESM support
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};