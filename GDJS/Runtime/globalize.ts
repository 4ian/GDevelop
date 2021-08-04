import * as GDJS from './index';
import * as PIXIModule from 'pixi.js';

declare global {
  var gdjs: typeof GDJS;
  var PIXI: typeof PIXIModule;
}
globalThis.gdjs = GDJS;
globalThis.PIXI = PIXIModule;
