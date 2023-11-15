// @flow
export const localStorageLocalStatsPrefix = 'gd-local-stats';

export const getProgramOpeningCount = (): number => {
  try {
    const count = localStorage.getItem(
      `${localStorageLocalStatsPrefix}-program-opening`
    );
    if (count !== null) return parseInt(count, 10);
  } catch (e) {
    console.warn('Unable to load stored program opening count', e);
  }

  return 0;
};

export const incrementProgramOpeningCount = () => {
  const count = getProgramOpeningCount() + 1;

  try {
    localStorage.setItem(
      `${localStorageLocalStatsPrefix}-program-opening`,
      '' + count
    );
  } catch (e) {
    console.warn('Unable to store program opening count', e);
  }
};
