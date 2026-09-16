// @flow

import {
  getStarterPlaceholders,
  getStarterTheme,
  type StarterPlaceholders,
  type StarterTheme,
  type StarterThemeSlot,
  type StarterThemeResourceOrigin,
} from '../Utils/GDevelopServices/StarterTheme';

export type StarterThemeApplicationResult = {|
  themeId: string,
  appliedSlots: Array<string>,
  missingSlots: Array<string>,
  changedObjectsCount: number,
  changedResourcesCount: number,
|};

const getFileBaseName = (filePath: ?string): string => {
  if (!filePath) return '';
  const parts = filePath.split(/[\\/]/);
  const baseName = parts[parts.length - 1];
  return baseName || '';
};

/**
 * Every object of a serialized project: global, per scene, and inside
 * events-based objects (the 3D tank starter keeps its parts there).
 */
const getAllSerializedObjects = (projectContent: Object): Array<Object> => {
  const objects = [...(projectContent.objects || [])];
  (projectContent.layouts || []).forEach(layout => {
    objects.push(...(layout.objects || []));
  });
  (projectContent.eventsFunctionsExtensions || []).forEach(extension => {
    (extension.eventsBasedObjects || []).forEach(eventsBasedObject => {
      objects.push(...(eventsBasedObject.objects || []));
    });
  });
  return objects;
};

/**
 * Same merge as the asset swapper: the object keeps every animation name it
 * had, played by the theme's animation of the same name (or its first one),
 * and the theme's extra animations are appended.
 */
const mergeModel3DAnimations = (
  objectAnimations: Array<Object>,
  themeAnimations: Array<Object>
): Array<Object> => {
  if (!themeAnimations.length) return objectAnimations;

  const animations = [];
  objectAnimations.forEach(objectAnimation => {
    const sameNameThemeAnimation = themeAnimations.find(
      themeAnimation => themeAnimation.name === objectAnimation.name
    );
    animations.push(
      sameNameThemeAnimation || {
        ...themeAnimations[0],
        name: objectAnimation.name,
      }
    );
  });
  themeAnimations.forEach(themeAnimation => {
    const isAlreadyAdded = objectAnimations.some(
      objectAnimation => objectAnimation.name === themeAnimation.name
    );
    if (!isAlreadyAdded) animations.push(themeAnimation);
  });
  return animations;
};

/**
 * Scale the theme model to the volume the placeholder occupied, so instances
 * keep their footprint in the scene.
 */
const getSizeRatio = (objectContent: Object, themeContent: Object): number => {
  const objectVolume =
    (objectContent.width || 0) *
    (objectContent.height || 0) *
    (objectContent.depth || 0);
  const themeVolume =
    (themeContent.width || 0) *
    (themeContent.height || 0) *
    (themeContent.depth || 0);
  if (objectVolume <= 0 || themeVolume <= 0) return 1;
  return Math.pow(objectVolume / themeVolume, 1 / 3);
};

const getResourceOrigin = (
  slot: StarterThemeSlot
): StarterThemeResourceOrigin => {
  const origin = slot.origin;
  if (origin) return origin;
  return { name: 'gdevelop-asset-store', identifier: slot.file };
};

/**
 * Re-skin a starter by rewriting its serialized project, in place.
 *
 * Placeholder resources are recognized by their file name and repointed at the
 * theme's files, which updates every cube face, skybox and sprite using them at
 * once. 3D objects additionally take the theme model's dimensions, rotation,
 * material and animations, the way the asset swapper does, while keeping their
 * name, behaviors, variables, instances, origin and center.
 *
 * Resource names are left untouched: nothing else in the project has to be
 * renamed, and a project can be re-themed later by the same lookup.
 */
export const applyStarterThemeToProjectContent = (
  projectContent: Object,
  {
    starterPlaceholders,
    starterTheme,
  }: {|
    starterPlaceholders: StarterPlaceholders,
    starterTheme: StarterTheme,
  |}
): StarterThemeApplicationResult => {
  const resources =
    (projectContent.resources && projectContent.resources.resources) || [];

  const appliedSlots = new Set<string>();
  const missingSlots = new Set<string>();
  let changedObjectsCount = 0;
  let changedResourcesCount = 0;

  // Resource name -> slot of the model it holds, for the objects using it.
  const modelSlotByResourceName = new Map<string, string>();

  resources.forEach(resource => {
    const baseName =
      getFileBaseName(resource.name) || getFileBaseName(resource.file);
    const slotId =
      resource.kind === 'model3D'
        ? starterPlaceholders.models[baseName]
        : resource.kind === 'image'
        ? starterPlaceholders.textures[baseName]
        : null;
    if (!slotId) return;

    const slot = starterTheme.slots[slotId];
    if (!slot) {
      missingSlots.add(slotId);
      return;
    }

    if (resource.kind === 'model3D') {
      modelSlotByResourceName.set(resource.name, slotId);
    }
    resource.file = slot.file;
    resource.origin = getResourceOrigin(slot);
    appliedSlots.add(slotId);
    changedResourcesCount++;
  });

  getAllSerializedObjects(projectContent).forEach(object => {
    if (object.type !== 'Scene3D::Model3DObject') return;
    const objectContent = object.content;
    if (!objectContent) return;

    const slotId = modelSlotByResourceName.get(objectContent.modelResourceName);
    if (!slotId) return;
    const slot = starterTheme.slots[slotId];
    if (!slot || slot.kind !== 'model') return;

    const themeContent = slot.objectContent;
    const sizeRatio = getSizeRatio(objectContent, themeContent);

    object.content = {
      ...themeContent,
      // Keep pointing at the project's own resource, now holding the theme model.
      modelResourceName: objectContent.modelResourceName,
      animations: mergeModel3DAnimations(
        objectContent.animations || [],
        themeContent.animations || []
      ),
      width: (themeContent.width || 0) * sizeRatio,
      height: (themeContent.height || 0) * sizeRatio,
      depth: (themeContent.depth || 0) * sizeRatio,
      // The origin and center drive collisions and placement: keep the
      // starter's, which its events and instances were built around.
      originLocation: objectContent.originLocation,
      centerLocation: objectContent.centerLocation,
    };
    if (slot.assetStoreId) object.assetStoreId = slot.assetStoreId;
    changedObjectsCount++;
  });

  return {
    themeId: starterTheme.id,
    appliedSlots: [...appliedSlots].sort(),
    missingSlots: [...missingSlots].sort(),
    changedObjectsCount,
    changedResourcesCount,
  };
};

/**
 * The placeholder files a project still shows, so a re-theme can tell a
 * freshly created starter from a project the user has already built upon.
 */
export const hasStarterPlaceholders = (
  projectContent: Object,
  starterPlaceholders: StarterPlaceholders
): boolean => {
  const resources =
    (projectContent.resources && projectContent.resources.resources) || [];
  return resources.some(resource => {
    const baseName =
      getFileBaseName(resource.name) || getFileBaseName(resource.file);
    if (resource.kind === 'model3D')
      return !!starterPlaceholders.models[baseName];
    if (resource.kind === 'image')
      return !!starterPlaceholders.textures[baseName];
    return false;
  });
};

/**
 * Build the transformation applied to a downloaded starter before it is loaded.
 * A theme that can't be loaded is not worth failing a project creation for: the
 * project is then created with its placeholder art.
 */
export const getStarterThemeTransform = async (
  starterThemeId: ?string
): Promise<?(projectContent: Object) => void> => {
  if (!starterThemeId) return null;

  try {
    const [starterPlaceholders, starterTheme] = await Promise.all([
      getStarterPlaceholders(),
      getStarterTheme(starterThemeId),
    ]);

    return (projectContent: Object) => {
      const result = applyStarterThemeToProjectContent(projectContent, {
        starterPlaceholders,
        starterTheme,
      });
      console.info(
        `Applied the "${result.themeId}" theme to the starter: ${
          result.changedObjectsCount
        } object(s) and ${result.changedResourcesCount} resource(s) changed.`,
        result
      );
    };
  } catch (error) {
    console.error(
      `Unable to load the "${starterThemeId}" starter theme. The project will be created with its original assets.`,
      error
    );
    return null;
  }
};

export { getFileBaseName, getAllSerializedObjects };
