// Remove the firebase first scene loaded callback to not be called by other tests.
// It wouldn't work as it would be called multiple times,
// and sometimes with RuntimeGame mocks without extension properties.
gdjs.callbacksFirstRuntimeSceneLoaded.length = 0;
