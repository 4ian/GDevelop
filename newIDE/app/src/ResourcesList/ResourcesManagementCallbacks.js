// @flow

import uniqueId from 'lodash/uniqueId';

const callbacks = {};

export const registerOnResourcesChangedCallback = (
  callback: (...args: any) => any
) => {
  const callbackId = uniqueId();
  callbacks[callbackId] = callback;
  return callbackId;
};

export const unregisterOnResourcesChangedCallback = (callbackId: string) => {
  delete callbacks[callbackId];
};

export const onResourcesChanged = () => {
  Object.keys(callbacks).forEach(callbackId => {
    try {
      callbacks[callbackId]();
    } catch (error) {}
  });
};
