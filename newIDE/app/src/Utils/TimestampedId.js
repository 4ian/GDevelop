// @flow

// $FlowFixMe[signature-verification-failure]
export const makeTimestampedId = () =>
  '' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
