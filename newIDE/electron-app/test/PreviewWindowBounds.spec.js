const assert = require('assert');

const {
  getPreviewBrowserWindowOptionsFittingDisplay,
  getBoundsFittingDisplayHeight,
} = require('../app/PreviewWindowBounds');

const run = () => {
  const requestedOptions = {
    width: 720,
    height: 1280,
    useContentSize: true,
    title: 'Preview',
  };

  assert.deepStrictEqual(
    getPreviewBrowserWindowOptionsFittingDisplay(requestedOptions, {
      x: 0,
      y: 0,
      width: 1200,
      height: 900,
    }),
    {
      width: 506,
      height: 900,
      useContentSize: true,
      title: 'Preview',
    }
  );
  assert.deepStrictEqual(requestedOptions, {
    width: 720,
    height: 1280,
    useContentSize: true,
    title: 'Preview',
  });

  assert.deepStrictEqual(
    getPreviewBrowserWindowOptionsFittingDisplay(
      { width: 720, height: 800 },
      { x: 0, y: 0, width: 1200, height: 900 }
    ),
    { width: 720, height: 800 }
  );

  assert.deepStrictEqual(
    getBoundsFittingDisplayHeight(
      { x: 10, y: 10, width: 700, height: 950 },
      { x: 0, y: 0, width: 1000, height: 900 }
    ),
    { x: 10, y: 0, width: 700, height: 900 }
  );

  assert.deepStrictEqual(
    getBoundsFittingDisplayHeight(
      { x: 10, y: 100, width: 700, height: 850 },
      { x: 0, y: 0, width: 1000, height: 900 }
    ),
    { x: 10, y: 50, width: 700, height: 850 }
  );

  assert.strictEqual(
    getBoundsFittingDisplayHeight(
      { x: 10, y: 20, width: 700, height: 800 },
      { x: 0, y: 0, width: 1000, height: 900 }
    ),
    null
  );
};

run();
