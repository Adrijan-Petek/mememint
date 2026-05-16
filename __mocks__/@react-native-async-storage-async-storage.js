// Mock for @react-native-async-storage/async-storage
// This prevents the MetaMask SDK from trying to import React Native storage in web environment

const mockAsyncStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
  getAllKeys: () => Promise.resolve([]),
  multiGet: () => Promise.resolve([]),
  multiSet: () => Promise.resolve(),
  multiRemove: () => Promise.resolve(),
  clear: () => Promise.resolve(),
};

export default mockAsyncStorage;