// @flow
// Note: this file has no imports on purpose, so that it can be used by
// any module dealing with resources (including `ResourcesLoader`) without
// creating import cycles.

/**
 * Read the association between the file paths written inside a resource file and
 * the resources representing these files.
 *
 * Some resources refer to other files: the tileset of a tilemap, the atlas of a
 * Spine skeleton or the texture files of a 3D model. A resource is created for
 * each of these files when the "parent" resource is imported, and this mapping
 * remembers which resource matches which file path.
 *
 * @returns null if this resource refers to no other file.
 */
export const readEmbeddedResourcesMapping = (
  resource: gdResource
): {} | null => {
  const metadataString = resource.getMetadata();
  try {
    const metadata = JSON.parse(metadataString);
    if (
      !metadata.embeddedResourcesMapping ||
      typeof metadata.embeddedResourcesMapping !== 'object'
    ) {
      return null;
    }

    return metadata.embeddedResourcesMapping;
  } catch (err) {
    return null;
  }
};

/**
 * Return the resources that the given resource refers to (see
 * `readEmbeddedResourcesMapping`), indexed by the file path written inside it.
 *
 * Resources that are not in the project anymore are left out, so that the caller
 * can always rely on the resources it gets back.
 *
 * @returns null if this resource refers to no other resource of the project.
 */
export const getEmbeddedResourceNames = (
  project: gdProject,
  resourceName: string
): { [filePath: string]: string } | null => {
  const resourcesManager = project.getResourcesManager();
  if (!resourcesManager.hasResource(resourceName)) return null;

  const embeddedResourcesMapping = readEmbeddedResourcesMapping(
    resourcesManager.getResource(resourceName)
  );
  if (!embeddedResourcesMapping) return null;

  const embeddedResourceNames: { [filePath: string]: string } = {};
  for (const [filePath, embeddedResourceName] of Object.entries(
    embeddedResourcesMapping
  )) {
    if (typeof embeddedResourceName !== 'string') continue;
    if (!resourcesManager.hasResource(embeddedResourceName)) continue;

    embeddedResourceNames[filePath] = embeddedResourceName;
  }

  return Object.keys(embeddedResourceNames).length > 0
    ? embeddedResourceNames
    : null;
};

/**
 * List the resources that the given resource refers to (see
 * `readEmbeddedResourcesMapping`) but that are not in the project anymore -
 * because they were removed or renamed.
 *
 * These missing resources usually mean the resource can't be displayed properly:
 * a 3D model would for instance be rendered without its textures.
 */
export const getMissingEmbeddedResourceNames = (
  project: gdProject,
  resourceName: string
): Array<string> => {
  const resourcesManager = project.getResourcesManager();
  if (!resourcesManager.hasResource(resourceName)) return [];

  const embeddedResourcesMapping = readEmbeddedResourcesMapping(
    resourcesManager.getResource(resourceName)
  );
  if (!embeddedResourcesMapping) return [];

  const missingResourceNames = [];
  for (const embeddedResourceName of Object.values(embeddedResourcesMapping)) {
    if (typeof embeddedResourceName !== 'string') continue;
    if (resourcesManager.hasResource(embeddedResourceName)) continue;

    missingResourceNames.push(embeddedResourceName);
  }

  return missingResourceNames;
};
