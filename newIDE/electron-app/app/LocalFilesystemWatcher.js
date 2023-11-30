// @flow
const watcher = require('@parcel/watcher');

let subscriptions = {};
let newSubscriptionId = 1

const getNewSubscriptionId = () => {
  const id = newSubscriptionId++;
  return id.toString();
};

const setupWatcher = (folderPath, fileWiseCallback, serializedOptions) => {
  const options = JSON.parse(serializedOptions);
  const newSubscriptionId = getNewSubscriptionId();
  watcher
    .subscribe(
      folderPath,
      (err, fileChangeEvents) => {
        fileChangeEvents.forEach(fileChangeEvent =>
          fileWiseCallback(fileChangeEvent.path)
        );
      },
      options
    )
    .then(subscription => {
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
