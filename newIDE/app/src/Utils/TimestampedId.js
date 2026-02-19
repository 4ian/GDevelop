// @flow

export const makeTimestampedId = (): string =>
  '' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
