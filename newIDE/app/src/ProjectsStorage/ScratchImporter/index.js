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
  type ScratchSprite,
  type ScratchProject,
} from './ScratchParser';

export {
  convertScratchBlocks,
  getTopLevelBlocks,
  type ConvertedEvent,
} from './BlockConverter';

export {
  convertScratchToGDevelop,
  exportGDevelopProjectJSON,
  validateScratchFile,
  type GDevelopProject,
} from './ScratchConverter';
