// @ts-check

/**
 * Manipulations that make sense in any editor. An editor specific helper adds
 * its own to these (see `helpers/SpriteEditor.js`).
 */

const { scrollList, wait } = require('./PageDriver');

const genericActions = {
  scrollList: {
    describe: args => `scroll the list by ${args.delta}px`,
    pick: (state, random) => ({
      delta: (random() < 0.5 ? -1 : 1) * (300 + Math.floor(random() * 900)),
    }),
    run: async (page, args) => {
      await scrollList(page, args.delta);
      await wait(400);
    },
  },
};

const genericMonkeyWeights = {
  scrollList: 2,
};

module.exports = { genericActions, genericMonkeyWeights };
