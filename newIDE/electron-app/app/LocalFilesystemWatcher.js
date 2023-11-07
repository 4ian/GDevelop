// @flow
const watcher = require('@parcel/watcher');

let subscriptions = {};

const getNewSubscriptionId = () => {
  const id = Math.round((Math.random() + 1) * 10000).toString();
  if (subscriptions[id]) return getNewSubscriptionId();
  return id;
};

const setupWatcher = (folderPath, callback, serializedOptions) => {
  const options = JSON.parse(serializedOptions);
  const newSubscriptionId = getNewSubscriptionId();
  watcher.subscribe(folderPath, callback, options).then(subscription => {
    subscriptions[newSubscriptionId] = subscription;
  });
  return newSubscriptionId;
};

const disableWatcher = id => {
  const subscription = subscriptions[id];
  if (!subscription) {
    console.log('No watcher subscription to disable.');
    return;
  }
  subscription.unsubscribe().then(() => {
    delete subscriptions[id];
  });
};

module.exports = {
  setupWatcher,
  disableWatcher,
};
