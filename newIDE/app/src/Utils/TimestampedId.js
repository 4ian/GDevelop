// @flow

export const makeTimestampedId = () =>
  '' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
