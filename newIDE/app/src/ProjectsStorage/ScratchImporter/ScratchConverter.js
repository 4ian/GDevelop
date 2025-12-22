// @flow
/**
 * Scratch to GDevelop Project Converter
 * Main converter that transforms Scratch projects into GDevelop format
 */

import {
  parseScratchProject,
  extractScratchAssets,
  getAllSprites,
  getStage,
  convertCostume,
  convertSound,
  type ScratchProject,
  type ScratchSprite,
} from './ScratchParser';
import {
  convertScratchBlocks,
  getTopLevelBlocks,
  type ConvertedEvent,
} from './BlockConverter';

export type GDevelopProject = {|
  name: string,
  description: string,
  scenes: Array<any>,
  objects: Array<any>,
  resources: Array<any>,
  variables: Array<any>,
|};

/**
 * Convert Scratch project to GDevelop project
 */
export const convertScratchToGDevelop = async (
  file: File
): Promise<?GDevelopProject> => {
  try {
    // Parse Scratch project
    const scratchProject = await parseScratchProject(file);
    if (!scratchProject) {
      console.error('Failed to parse Scratch project');
      return null;
    }
    
    // Extract assets
    const assets = await extractScratchAssets(file, scratchProject);
    
    // Create GDevelop project structure
    const gdProject: GDevelopProject = {
      name: 'Scratch Project Import',
      description: 'Imported from Scratch',
      scenes: [],
      objects: [],
      resources: [],
      variables: [],
    };
    
    // Convert stage (background)
    const stage = getStage(scratchProject);
    if (stage) {
      convertStageToScene(gdProject, stage, assets);
    }
    
    // Convert sprites to objects
    const sprites = getAllSprites(scratchProject);
    for (const sprite of sprites) {
      convertSpriteToObject(gdProject, sprite, assets);
    }
    
    console.log('Converted GDevelop project:', gdProject);
    return gdProject;
  } catch (error) {
    console.error('Error converting Scratch to GDevelop:', error);
    return null;
  }
};

/**
 * Convert Scratch stage to GDevelop scene
 */
const convertStageToScene = (
  gdProject: GDevelopProject,
  stage: ScratchSprite,
  assets: Map<string, Blob>
): void => {
  const scene = {
    name: 'Scene1',
    objects: [],
    events: [],
    variables: convertVariables(stage.variables),
    instances: [],
    layers: [
      {
        name: '',
        visibility: true,
        effects: [],
        cameras: [],
        isLightingLayer: false,
        followBaseLayerCamera: false,
      },
    ],
    behaviorsSharedData: [],
  };
  
  // Convert stage blocks to events
  if (stage.blocks) {
    const topLevelBlocks = getTopLevelBlocks(stage.blocks);
    const events = convertScratchBlocks(stage.blocks, topLevelBlocks);
    scene.events = events;
  }
  
  // Add background costumes as scene resources
  for (const costume of stage.costumes) {
    const gdCostume = convertCostume(costume);
    gdProject.resources.push({
      kind: 'image',
      name: gdCostume.name,
      file: gdCostume.imageUrl,
      metadata: '',
    });
  }
  
  gdProject.scenes.push(scene);
};

/**
 * Convert Scratch sprite to GDevelop object
 */
const convertSpriteToObject = (
  gdProject: GDevelopProject,
  sprite: ScratchSprite,
  assets: Map<string, Blob>
): void => {
  const gdObject = {
    type: 'Sprite',
    name: sprite.name,
    variables: convertVariables(sprite.variables),
    effects: [],
    behaviors: [],
    animations: [],
  };
  
  // Convert costumes to animations
  const animation = {
    name: 'Default',
    useMultipleDirections: false,
    directions: [
      {
        looping: true,
        timeBetweenFrames: 0.08,
        sprites: sprite.costumes.map(costume => {
          const gdCostume = convertCostume(costume);
          
          // Add to resources
          gdProject.resources.push({
            kind: 'image',
            name: gdCostume.name,
            file: gdCostume.imageUrl,
            metadata: '',
          });
          
          return {
            hasCustomCollisionMask: false,
            image: gdCostume.name,
            points: [],
            originPoint: {
              name: 'origin',
              x: gdCostume.centerX,
              y: gdCostume.centerY,
            },
            centerPoint: {
              automatic: true,
              name: 'center',
              x: 0,
              y: 0,
            },
            customCollisionMask: [],
          };
        }),
      },
    ],
  };
  
  gdObject.animations.push(animation);
  
  // Add sounds to resources
  for (const sound of sprite.sounds) {
    const gdSound = convertSound(sound);
    gdProject.resources.push({
      kind: 'audio',
      name: gdSound.name,
      file: gdSound.soundUrl,
      metadata: '',
    });
  }
  
  gdProject.objects.push(gdObject);
  
  // Add sprite instance to first scene if it exists
  if (gdProject.scenes.length > 0 && sprite.x !== undefined && sprite.y !== undefined) {
    gdProject.scenes[0].instances.push({
      persistentUuid: '',
      name: sprite.name,
      x: sprite.x + 240, // Scratch coordinates to GDevelop (centered at 0,0)
      y: 180 - sprite.y, // Flip Y axis
      angle: sprite.direction || 0,
      layer: '',
      zOrder: sprite.layerOrder || 0,
      customSize: sprite.size !== undefined && sprite.size !== 100,
      width: sprite.size !== undefined ? sprite.size : 100,
      height: sprite.size !== undefined ? sprite.size : 100,
      locked: false,
      sealed: false,
    });
  }
  
  // Convert sprite blocks to object events
  if (sprite.blocks) {
    const topLevelBlocks = getTopLevelBlocks(sprite.blocks);
    const events = convertScratchBlocks(sprite.blocks, topLevelBlocks);
    
    // Add events to the scene with object-specific conditions
    if (gdProject.scenes.length > 0) {
      gdProject.scenes[0].events.push(...events);
    }
  }
};

/**
 * Convert Scratch variables to GDevelop variables
 */
const convertVariables = (
  scratchVars: { [key: string]: any }
): Array<{| name: string, value: any |}> => {
  const variables: Array<{| name: string, value: any |}> = [];
  
  Object.keys(scratchVars).forEach(varId => {
    const varData = scratchVars[varId];
    variables.push({
      name: varData[0], // Variable name
      value: varData[1], // Variable value
    });
  });
  
  return variables;
};

/**
 * Export GDevelop project as JSON string
 */
export const exportGDevelopProjectJSON = (project: GDevelopProject): string => {
  return JSON.stringify(project, null, 2);
};

/**
 * Validate Scratch file
 */
export const validateScratchFile = (file: File): boolean => {
  // Check file extension
  if (!file.name.endsWith('.sb3') && !file.name.endsWith('.sb2')) {
    console.error('Invalid file type. Expected .sb3 or .sb2');
    return false;
  }
  
  // Check file size (max 100MB)
  if (file.size > 100 * 1024 * 1024) {
    console.error('File too large. Maximum size is 100MB');
    return false;
  }
  
  return true;
};