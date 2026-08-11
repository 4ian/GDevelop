// @flow

// This dependency-free runtime file is also the canonical source used by GDJS.
// $FlowFixMe[cannot-resolve-module]
// $FlowFixMe[untyped-import]
const keyboardDefinitions = require('../../../../GDJS/Runtime/events-tools/keyboard-key-definitions.js');

export const keyDefinitions: Array<Object> =
  keyboardDefinitions.keyboardKeyDefinitions;

export const keyNames: Array<string> = keyDefinitions
  .filter(definition => typeof definition.gdevelopKeyName === 'string')
  .map(definition => definition.gdevelopKeyName);

export const keyAliases: Array<string> = keyDefinitions.reduce(
  (aliases, definition) =>
    aliases.concat(Array.isArray(definition.aliases) ? definition.aliases : []),
  []
);

export const getKeyboardKeyDefinition = (keyName: string): ?Object =>
  keyboardDefinitions.getKeyboardKeyDefinition(keyName);

export const normalizeKeyboardKeyName = (keyName: string): string =>
  keyboardDefinitions.normalizeKeyboardKeyName(keyName);
