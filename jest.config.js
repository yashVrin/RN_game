module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-vector-icons|react-redux|@reduxjs|immer|@notifee|react-native-config|react-native-modal)/)',
  ],
};
