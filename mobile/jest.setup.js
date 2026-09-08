/** Jest — react-native 최소 스텁 (shared/lib 유닛용) */
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { scheme: 'yakok' } },
}));
