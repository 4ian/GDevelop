// @flow
/**
 * Scratch Project Parser
 * Based on concepts from leopard-js (https://github.com/leopard-js/leopard)
 * Adapted for GDevelop's project structure
 * 
 * This parser reads Scratch .sb3 files and converts them to GDevelop-compatible format
 */

import JSZip from 'jszip';

export type ScratchSprite = {|
  name: string,
  isStage: boolean,
  variables: { [key: string]: any },
  lists: { [key: string]: any },
  broadcasts: { [key: string]: string },
  blocks: { [key: string]: any },
  comments: { [key: string]: any },
  currentCostume: number,
  costumes: Array<{|
    name: string,
    dataFormat: string,
    assetId: string,
    md5ext: string,
    rotationCenterX: number,
    rotationCenterY: number,
  |}>,
  sounds: Array<{|
    name: string,
    dataFormat: string,
    assetId: string,
    md5ext: string,
  |}>,
  layerOrder: number,
  volume: number,
  visible?: boolean,
  x?: number,
  y?: number,
  size?: number,
  direction?: number,
  draggable?: boolean,
  rotationStyle?: string,
|};

export type ScratchProject = {|
  targets: Array<ScratchSprite>,
  monitors: Array<any>,
  extensions: Array<string>,
  meta: {|
    semver: string,
    vm: string,
    agent: string,
  |},
|};

/**
 * Parse a Scratch .sb3 file
 */
export const parseScratchProject = async (file: File): Promise<?ScratchProject> => {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    
    // Read project.json
    const projectJsonFile = contents.file('project.json');
    if (!projectJsonFile) {
      console.error('project.json not found in Scratch file');
      return null;
    }
    
    const projectJsonText = await projectJsonFile.async('text');
    const project: ScratchProject = JSON.parse(projectJsonText);
    
    console.log('Parsed Scratch project:', project);
    return project;
  } catch (error) {
    console.error('Error parsing Scratch project:', error);
    return null;
  }
};

/**
 * Extract assets from Scratch project
 */
export const extractScratchAssets = async (
  file: File,
  project: ScratchProject
): Promise<Map<string, Blob>> => {
  const assets = new Map();
  
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    
    // Extract all costume and sound files
    for (const target of project.targets) {
      // Extract costumes
      for (const costume of target.costumes) {
        const assetFile = contents.file(costume.md5ext);
        if (assetFile) {
          const blob = await assetFile.async('blob');
          assets.set(costume.md5ext, blob);
        }
      }
      
      // Extract sounds
      for (const sound of target.sounds) {
        const assetFile = contents.file(sound.md5ext);
        if (assetFile) {
          const blob = await assetFile.async('blob');
          assets.set(sound.md5ext, blob);
        }
      }
    }
    
    console.log(`Extracted ${assets.size} assets from Scratch project`);
    return assets;
  } catch (error) {
    console.error('Error extracting Scratch assets:', error);
    return assets;
  }
};

/**
 * Get sprite by name from project
 */
export const getSpriteByName = (
  project: ScratchProject,
  name: string
): ?ScratchSprite => {
  return project.targets.find(target => target.name === name && !target.isStage);
};

/**
 * Get stage from project
 */
export const getStage = (project: ScratchProject): ?ScratchSprite => {
  return project.targets.find(target => target.isStage);
};

/**
 * Get all sprites (excluding stage)
 */
export const getAllSprites = (project: ScratchProject): Array<ScratchSprite> => {
  return project.targets.filter(target => !target.isStage);
};

/**
 * Convert Scratch costume to GDevelop-compatible format
 */
export const convertCostume = (costume: any): {|
  name: string,
  imageUrl: string,
  centerX: number,
  centerY: number,
|} => {
  return {
    name: costume.name,
    imageUrl: costume.md5ext,
    centerX: costume.rotationCenterX,
    centerY: costume.rotationCenterY,
  };
};

/**
 * Convert Scratch sound to GDevelop-compatible format
 */
export const convertSound = (sound: any): {|
  name: string,
  soundUrl: string,
|} => {
  return {
    name: sound.name,
    soundUrl: sound.md5ext,
  };
};