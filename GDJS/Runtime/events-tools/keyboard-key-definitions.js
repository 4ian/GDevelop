/*
 * Canonical keyboard key definitions shared by the GDJS runtime, the editor
 * catalogs and MCP preview input simulation.
 *
 * Keep this file dependency-free: it is loaded as a browser runtime script and
 * required as a CommonJS module by the editor build.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.gdjs = root.gdjs || {};
    root.gdjs.keyboardKeyDefinitions = api.keyboardKeyDefinitions;
    root.gdjs.getKeyboardKeyDefinition = api.getKeyboardKeyDefinition;
    root.gdjs.normalizeKeyboardKeyName = api.normalizeKeyboardKeyName;
  }
})(
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
      ? self
      : this,
  function () {
    var definitions = [];
    var definitionsByName = Object.create(null);

    var registerName = function (name, definition) {
      definitionsByName[String(name).toLowerCase()] = definition;
    };
    var add = function (
      gdevelopKeyName,
      runtimeKeyCode,
      keyCode,
      domCode,
      location,
      aliases
    ) {
      var definition = {
        gdevelopKeyName: gdevelopKeyName,
        runtimeKeyCode: runtimeKeyCode,
        keyCode: keyCode,
        domCode: domCode,
        location: location || 0,
        aliases: aliases || [],
      };
      definitions.push(definition);
      registerName(gdevelopKeyName, definition);
      definition.aliases.forEach(function (alias) {
        registerName(alias, definition);
      });
      return definition;
    };
    var addInputOnlyAlias = function (name, keyCode, domCode, location) {
      registerName(name, {
        gdevelopKeyName: null,
        runtimeKeyCode: null,
        keyCode: keyCode,
        domCode: domCode,
        location: location || 0,
        aliases: [name],
      });
    };

    for (var code = 65; code <= 90; code++) {
      var letter = String.fromCharCode(code).toLowerCase();
      add(letter, code, code, 'Key' + letter.toUpperCase(), 0, []);
    }
    for (var digit = 0; digit <= 9; digit++) {
      add('Num' + digit, 48 + digit, 48 + digit, 'Digit' + digit, 0, [
        String(digit),
        'Digit' + digit,
      ]);
      add('Numpad' + digit, 96 + digit, 96 + digit, 'Numpad' + digit, 3, []);
    }

    add('LShift', 1016, 16, 'ShiftLeft', 1, []);
    add('RShift', 2016, 16, 'ShiftRight', 2, []);
    add('LControl', 1017, 17, 'ControlLeft', 1, []);
    add('RControl', 2017, 17, 'ControlRight', 2, []);
    add('LAlt', 1018, 18, 'AltLeft', 1, []);
    add('RAlt', 2018, 18, 'AltRight', 2, []);
    add('LSystem', 1091, 91, 'MetaLeft', 1, []);
    add('RSystem', 2091, 91, 'MetaRight', 2, []);

    [
      ['SemiColon', 186, 'Semicolon'],
      ['Comma', 188, 'Comma'],
      ['Period', 190, 'Period'],
      ['Quote', 222, 'Quote'],
      ['Slash', 191, 'Slash'],
      ['BackSlash', 220, 'Backslash'],
      ['Equal', 187, 'Equal'],
      ['Dash', 189, 'Minus'],
      ['Menu', 93, 'ContextMenu'],
      ['LBracket', 219, 'BracketLeft'],
      ['RBracket', 221, 'BracketRight'],
      ['Tilde', 192, 'Backquote'],
      ['Space', 32, 'Space'],
      ['Back', 8, 'Backspace', ['Backspace']],
      ['Tab', 9, 'Tab'],
      ['Delete', 46, 'Delete'],
      ['Insert', 45, 'Insert'],
      ['Escape', 27, 'Escape'],
      ['PageUp', 33, 'PageUp'],
      ['PageDown', 34, 'PageDown'],
      ['End', 35, 'End'],
      ['Home', 36, 'Home'],
      ['Return', 13, 'Enter', ['Enter']],
      ['Add', 107, 'NumpadAdd'],
      ['Subtract', 109, 'NumpadSubtract'],
      ['Multiply', 106, 'NumpadMultiply'],
      ['Divide', 111, 'NumpadDivide'],
      ['Left', 37, 'ArrowLeft'],
      ['Up', 38, 'ArrowUp'],
      ['Right', 39, 'ArrowRight'],
      ['Down', 40, 'ArrowDown'],
      ['Pause', 19, 'Pause'],
    ].forEach(function (entry) {
      add(entry[0], entry[1], entry[1], entry[2], 0, entry[3] || []);
    });

    [
      ['NumpadPageUp', 3033, 33, 'Numpad9'],
      ['NumpadPageDown', 3034, 34, 'Numpad3'],
      ['NumpadEnd', 3035, 35, 'Numpad1'],
      ['NumpadHome', 3036, 36, 'Numpad7'],
      ['NumpadReturn', 3013, 13, 'NumpadEnter'],
      ['NumpadAdd', 3107, 107, 'NumpadAdd'],
      ['NumpadSubtract', 3109, 109, 'NumpadSubtract'],
      ['NumpadMultiply', 3106, 106, 'NumpadMultiply'],
      ['NumpadDivide', 3111, 111, 'NumpadDivide'],
      ['NumpadLeft', 3037, 37, 'Numpad4'],
      ['NumpadUp', 3038, 38, 'Numpad8'],
      ['NumpadRight', 3039, 39, 'Numpad6'],
      ['NumpadDown', 3040, 40, 'Numpad2'],
    ].forEach(function (entry) {
      add(entry[0], entry[1], entry[2], entry[3], 3, []);
    });

    for (var functionKey = 1; functionKey <= 12; functionKey++) {
      add(
        'F' + functionKey,
        111 + functionKey,
        111 + functionKey,
        'F' + functionKey,
        0,
        []
      );
    }

    // Preserve the location-neutral aliases historically accepted by MCP.
    addInputOnlyAlias('Shift', 16, 'Shift', 0);
    addInputOnlyAlias('Control', 17, 'Control', 0);
    addInputOnlyAlias('Ctrl', 17, 'Control', 0);
    addInputOnlyAlias('Alt', 18, 'Alt', 0);

    var getKeyboardKeyDefinition = function (name) {
      if (typeof name !== 'string') return null;
      return definitionsByName[name.toLowerCase()] || null;
    };
    var normalizeKeyboardKeyName = function (name) {
      var definition = getKeyboardKeyDefinition(name);
      return definition && definition.gdevelopKeyName
        ? definition.gdevelopKeyName
        : name;
    };

    return {
      keyboardKeyDefinitions: definitions,
      getKeyboardKeyDefinition: getKeyboardKeyDefinition,
      normalizeKeyboardKeyName: normalizeKeyboardKeyName,
    };
  }
);
