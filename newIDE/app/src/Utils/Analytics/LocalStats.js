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

type DailyAggregatedEventStates = {
  [key: string]: {|
    lastSentDay: string,
    unsentCount: number,
  |},
};

// Used when the local storage can't be read or written.
let inMemoryDailyAggregatedEventStates: DailyAggregatedEventStates = {};

const loadDailyAggregatedEventStates = (): DailyAggregatedEventStates => {
  try {
    const serializedStates = localStorage.getItem(
      `${localStorageLocalStatsPrefix}-daily-aggregated-events`
    );
    if (serializedStates) return JSON.parse(serializedStates);
  } catch (e) {
    console.warn('Unable to load stored daily aggregated events', e);
  }

  return inMemoryDailyAggregatedEventStates;
};

const saveDailyAggregatedEventStates = (states: DailyAggregatedEventStates) => {
  inMemoryDailyAggregatedEventStates = states;
  try {
    localStorage.setItem(
      `${localStorageLocalStatsPrefix}-daily-aggregated-events`,
      JSON.stringify(states)
    );
  } catch (e) {
    console.warn('Unable to store daily aggregated events', e);
  }
};

/**
 * Count an occurrence of an event sent at most once per (UTC) day.
 * Returns the number of occurrences to report if the event must be sent now (because it's
 * its first occurrence of the day), including the occurrences not reported since the last
 * time it was sent. Returns null if the occurrence must only be counted, to be reported
 * by the next sent event.
 */
export const countDailyAggregatedEventOccurrence = (
  key: string
): number | null => {
  const today = new Date().toISOString().slice(0, 10);
  const states = loadDailyAggregatedEventStates();
  const state = states[key];
  const occurrenceCount = (state ? state.unsentCount : 0) + 1;

  if (state && state.lastSentDay === today) {
    saveDailyAggregatedEventStates({
      ...states,
      [key]: { lastSentDay: today, unsentCount: occurrenceCount },
    });
    return null;
  }

  saveDailyAggregatedEventStates({
    ...states,
    [key]: { lastSentDay: today, unsentCount: 0 },
  });
  return occurrenceCount;
};
