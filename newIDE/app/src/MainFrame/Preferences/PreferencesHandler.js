// @flow
export type PreferencesState = {
  themeName: string,
};

const LocalStorageItem = 'gd-preferences';

const loadFromLocalStorage = () => {
  try {
    const persistedState = localStorage.getItem(LocalStorageItem);
    if (!persistedState) return null;

    return JSON.parse(persistedState);
  } catch (e) {
    return null;
  }
};
const persistToLocalStorage = state => {
  try {
    localStorage.setItem(LocalStorageItem, JSON.stringify(state));
  } catch (e) {
    console.warn('Unable to persist preferences', e);
  }

  return state;
};

export const getDefaultPreferences = (): PreferencesState => {
  return (
    loadFromLocalStorage() || {
      themeName: 'GDevelop default',
    }
  );
};

export const getThemeName = (state: PreferencesState): string => {
  return state.themeName;
};

export const setThemeName = (
  state: PreferencesState,
  themeName: string
): PreferencesState => {
  return persistToLocalStorage({
    ...state,
    themeName,
  });
};
