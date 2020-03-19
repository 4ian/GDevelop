/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Tools related to input ( Keyboard, mouse ), for events generated code.
 *
 * @memberof gdjs.evtTools
 * @class input
 * @static
 * @private
 */
gdjs.evtTools.input = gdjs.evtTools.input || {};

/**
 * Return true if the specified key is pressed
 *
 * @private
 */
gdjs.evtTools.input.isKeyPressed = function(runtimeScene, key) {
  if (gdjs.evtTools.input.keysNameToCode.hasOwnProperty(key)) {
    return runtimeScene
      .getGame()
      .getInputManager()
      .isKeyPressed(gdjs.evtTools.input.keysNameToCode[key]);
  }

  return false;
};

/**
 * Return true if the specified key was just released
 *
 * @private
 */
gdjs.evtTools.input.wasKeyReleased = function(runtimeScene, key) {
  if (gdjs.evtTools.input.keysNameToCode.hasOwnProperty(key)) {
    return runtimeScene
      .getGame()
      .getInputManager()
      .wasKeyReleased(gdjs.evtTools.input.keysNameToCode[key]);
  }

  return false;
};

/**
 * Return the name of the last key pressed in the game
 * @private
 */
gdjs.evtTools.input.lastPressedKey = function(runtimeScene) {
  //Ensure _keysCodeToName is constructed
  if (gdjs.evtTools.input._keysCodeToName === undefined) {
    gdjs.evtTools.input._keysCodeToName = {};
    var keysNameToCode = gdjs.evtTools.input.keysNameToCode;
    for (var p in keysNameToCode) {
      if (keysNameToCode.hasOwnProperty(p)) {
        gdjs.evtTools.input._keysCodeToName[keysNameToCode[p]] = p;
      }
    }
  }

  var keyCode = runtimeScene
    .getGame()
    .getInputManager()
    .getLastPressedKey();
  if (gdjs.evtTools.input._keysCodeToName.hasOwnProperty(keyCode)) {
    return gdjs.evtTools.input._keysCodeToName[keyCode];
  }

  return '';
};

/**
 * Hashmap associated each name of a key to its code.
 * @memberof gdjs.evtTools
 */
gdjs.evtTools.input.keysNameToCode = {
  a: 'KeyA',
  b: 'KeyB',
  c: 'KeyC',
  d: 'KeyD',
  e: 'KeyE',
  f: 'KeyF',
  g: 'KeyG',
  h: 'KeyH',
  i: 'KeyI',
  j: 'KeyJ',
  k: 'KeyK',
  l: 'KeyL',
  m: 'KeyM',
  n: 'KeyN',
  o: 'KeyO',
  p: 'KeyP',
  q: 'KeyQ',
  r: 'KeyR',
  s: 'KeyS',
  t: 'KeyT',
  u: 'KeyU',
  v: 'KeyV',
  w: 'KeyW',
  x: 'KeyX',
  y: 'KeyY',
  z: 'KeyZ',

  Num0: 'Digit0',
  Num1: 'Digit1',
  Num2: 'Digit2',
  Num3: 'Digit3',
  Num4: 'Digit4',
  Num5: 'Digit5',
  Num6: 'Digit6',
  Num7: 'Digit7',
  Num8: 'Digit8',
  Num9: 'Digit9',

  Numpad0: 'Numpad0',
  Numpad1: 'Numpad1',
  Numpad2: 'Numpad2',
  Numpad3: 'Numpad3',
  Numpad4: 'Numpad4',
  Numpad5: 'Numpad5',
  Numpad6: 'Numpad6',
  Numpad7: 'Numpad7',
  Numpad8: 'Numpad8',
  Numpad9: 'Numpad9',

  RControl: 'ControlRight',
  RShift: 'ShiftRight',
  RAlt: 'AltRight',
  LControl: 'ControlLeft',
  LShift: 'ShiftLeft',
  LAlt: 'AltLeft',
  LSystem: 'MetaLeft',
  RSystem: 'MetaRight',
  /*"Menu": sf::Keyboard::Menu ,
    "LBracket": sf::Keyboard::LBracket ,
    "RBracket": sf::Keyboard::RBracket ,
    "SemiColon": sf::Keyboard::SemiColon ,
    "Comma": sf::Keyboard::Comma ,
    "Period": sf::Keyboard::Period ,
    "Quote": sf::Keyboard::Quote ,
    "Slash": sf::Keyboard::Slash ,
    "BackSlash": sf::Keyboard::BackSlash ,
    "Tilde": sf::Keyboard::Tilde ,
    "Equal": sf::Keyboard::Equal ,
    "Dash": sf::Keyboard::Dash,*/
  Space: 'Space',
  Return: 'Enter',
  Back: 'Backspace',
  Tab: 'Tab',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  End: 'End',
  Home: 'Home',
  Delete: 'Delete',
  Insert: 'Insert',
  Escape: 'Escape',

  Add: 'NumpadAdd',
  Subtract: 'NumpadSubtract',
  Multiply: 'NumpadMultiply',
  Divide: 'NumpadDivide',

  Left: 'ArrowLeft',
  Up: 'ArrowUp',
  Right: 'ArrowRight',
  Down: 'ArrowDown',

  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',

  Pause: 'Pause',
};

gdjs.evtTools.input.anyKeyPressed = function(runtimeScene) {
  return runtimeScene
    .getGame()
    .getInputManager()
    .anyKeyPressed();
};

gdjs.evtTools.input.isMouseButtonPressed = function(runtimeScene, button) {
  if (button === 'Left')
    return runtimeScene
      .getGame()
      .getInputManager()
      .isMouseButtonPressed(0);
  if (button === 'Right')
    return runtimeScene
      .getGame()
      .getInputManager()
      .isMouseButtonPressed(1);
  if (button === 'Middle')
    return runtimeScene
      .getGame()
      .getInputManager()
      .isMouseButtonPressed(2);
  return false;
};

gdjs.evtTools.input.isMouseButtonReleased = function(runtimeScene, button) {
  if (button === 'Left')
    return runtimeScene
      .getGame()
      .getInputManager()
      .isMouseButtonReleased(0);
  if (button === 'Right')
    return runtimeScene
      .getGame()
      .getInputManager()
      .isMouseButtonReleased(1);
  if (button === 'Middle')
    return runtimeScene
      .getGame()
      .getInputManager()
      .isMouseButtonReleased(2);
  return false;
};

gdjs.evtTools.input.hideCursor = function(runtimeScene) {
  runtimeScene.getRenderer().hideCursor();
};

gdjs.evtTools.input.showCursor = function(runtimeScene) {
  runtimeScene.getRenderer().showCursor();
};

gdjs.evtTools.input.getMouseWheelDelta = function(runtimeScene) {
  return runtimeScene
    .getGame()
    .getInputManager()
    .getMouseWheelDelta();
};

gdjs.evtTools.input.isScrollingUp = function(runtimeScene) {
  return runtimeScene
    .getGame()
    .getInputManager()
    .isScrollingUp();
};

gdjs.evtTools.input.isScrollingDown = function(runtimeScene) {
  return runtimeScene
    .getGame()
    .getInputManager()
    .isScrollingDown();
};

gdjs.evtTools.input.getMouseX = function(runtimeScene, layer, camera) {
  return runtimeScene.getLayer(layer).convertCoords(
    runtimeScene
      .getGame()
      .getInputManager()
      .getMouseX(),
    runtimeScene
      .getGame()
      .getInputManager()
      .getMouseY()
  )[0];
};

gdjs.evtTools.input.getMouseY = function(runtimeScene, layer, camera) {
  return runtimeScene.getLayer(layer).convertCoords(
    runtimeScene
      .getGame()
      .getInputManager()
      .getMouseX(),
    runtimeScene
      .getGame()
      .getInputManager()
      .getMouseY()
  )[1];
};

gdjs.evtTools.input._cursorIsOnObject = function(obj, runtimeScene) {
  return obj.cursorOnObject(runtimeScene);
};

gdjs.evtTools.input.cursorOnObject = function(
  objectsLists,
  runtimeScene,
  accurate,
  inverted
) {
  return gdjs.evtTools.object.pickObjectsIf(
    gdjs.evtTools.input._cursorIsOnObject,
    objectsLists,
    inverted,
    runtimeScene
  );
};

gdjs.evtTools.input.getTouchX = function(
  runtimeScene,
  identifier,
  layer,
  camera
) {
  return runtimeScene.getLayer(layer).convertCoords(
    runtimeScene
      .getGame()
      .getInputManager()
      .getTouchX(identifier),
    runtimeScene
      .getGame()
      .getInputManager()
      .getTouchY(identifier)
  )[0];
};

gdjs.evtTools.input.getTouchY = function(
  runtimeScene,
  identifier,
  layer,
  camera
) {
  return runtimeScene.getLayer(layer).convertCoords(
    runtimeScene
      .getGame()
      .getInputManager()
      .getTouchX(identifier),
    runtimeScene
      .getGame()
      .getInputManager()
      .getTouchY(identifier)
  )[1];
};

gdjs.evtTools.input.getLastTouchId = function() {
  return gdjs.evtTools.input.lastTouchId || 0;
};

gdjs.evtTools.input.getLastEndedTouchId = function() {
  return gdjs.evtTools.input.lastEndedTouchId || 0;
};

gdjs.evtTools.input.popStartedTouch = function(runtimeScene) {
  var startedTouchId = runtimeScene
    .getGame()
    .getInputManager()
    .popStartedTouch();

  if (startedTouchId !== undefined) {
    gdjs.evtTools.input.lastTouchId = startedTouchId;
    return true;
  }

  return false;
};

gdjs.evtTools.input.popEndedTouch = function(runtimeScene) {
  var endedTouchId = runtimeScene
    .getGame()
    .getInputManager()
    .popEndedTouch();

  if (endedTouchId !== undefined) {
    gdjs.evtTools.input.lastEndedTouchId = endedTouchId;
    return true;
  }

  return false;
};

gdjs.evtTools.input.touchSimulateMouse = function(runtimeScene, enable) {
  runtimeScene
    .getGame()
    .getInputManager()
    .touchSimulateMouse(enable);
};
