// Jest transform for the text files imported as strings (see the matching
// webpack `asset/source` rule in config-overrides.js).
module.exports = {
  process(sourceText) {
    return { code: `module.exports = ${JSON.stringify(sourceText)};` };
  },
};
