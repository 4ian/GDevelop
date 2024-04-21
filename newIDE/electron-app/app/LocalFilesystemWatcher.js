// @flow
const fileWatcher = require('chokidar');

let subscriptionCancelers = {};
let newSubscriptionId = 1;

const getNewSubscriptionId = () => {
  const id = newSubscriptionId++;
  return id.toString();
};

const setupWatcher = (folderPath, fileWiseCallback, serializedOptions) => {
  const options = JSON.parse(serializedOptions);
  const newSubscriptionId = getNewSubscriptionId();
  const watcher = fileWatcher
    .watch(folderPath, {
      ignored: options.ignore,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 250,
        pollInterval: 100,
      },
    })
    .on(
      'change',
      // TODO: Is it safe to let it like that since the OS could for some reason
      // do never-ending operations on the folder or its children, making the debounce
      // never ending.
      fileWiseCallback
    )
    .on('unlink', fileWiseCallback)
    .on('add', fileWiseCallback);

  subscriptionCancelers[newSubscriptionId] = () => watcher.unwatch(folderPath);

  return newSubscriptionId;
};

const disableWatcher = id => {
  const subscriptionCanceler = subscriptionCancelers[id];
  if (!subscriptionCanceler) {
    console.log('No watcher subscription to disable.');
    return;
  }
  subscriptionCanceler();
  delete subscriptionCancelers[id];
};

module.exports = {
  setupWatcher,
  disableWatcher,
};
