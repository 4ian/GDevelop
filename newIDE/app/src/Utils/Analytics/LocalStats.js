// @flow
const localStorageLocalStatsPrefix = 'gd-local-stats';

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

export const getGetStartedSectionViewCount = (): number => {
  try {
    const count = localStorage.getItem(
      `${localStorageLocalStatsPrefix}-get-started-section-view-count`
    );
    if (count !== null) return parseInt(count, 10);
  } catch (e) {
    console.warn('Unable to load stored get started section view count', e);
  }

  return 0;
};

export const incrementGetStartedSectionViewCount = () => {
  const count = getGetStartedSectionViewCount() + 1;

  try {
    localStorage.setItem(
      `${localStorageLocalStatsPrefix}-get-started-section-view-count`,
      '' + count
    );
  } catch (e) {
    console.warn('Unable to store get started section view count', e);
  }
};
