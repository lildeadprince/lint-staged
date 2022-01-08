const config = {
  collectCoverage: true,
  collectCoverageFrom: ['lib/**/*'],
  setupFiles: ['./testSetup.js'],
  snapshotSerializers: ['jest-snapshot-serializer-ansi'],
  testEnvironment: 'node',
  transform: {},
}

export default config
