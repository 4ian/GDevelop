// @flow
/**
 * Scratch Importer Module
 * Enables importing Scratch projects (.sb3) into GDevelop
 * Based on concepts from leopard-js
 */

export {
  parseScratchProject,
  extractScratchAssets,
  getSpriteByName,
  getStage,
  getAllSprites,
  convertCostume,
  convertSound,
} from './ScratchParser';

export type {
  ScratchSprite,
  ScratchProject,
} from './ScratchParser';

export {
  convertScratchBlocks,
  getTopLevelBlocks,
} from './BlockConverter';

export type {
  ConvertedEvent,
} from './BlockConverter';

export {
  convertScratchToGDevelop,
  exportGDevelopProjectJSON,
  validateScratchFile,
} from './ScratchConverter';

export type {
  GDevelopProject,
} from './ScratchConverter';
