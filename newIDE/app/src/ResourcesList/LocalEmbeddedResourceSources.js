// @flow
import optionalRequire from '../Utils/OptionalRequire';
import newNameGenerator from '../Utils/NewNameGenerator';
import { isPathInProjectFolder } from './ResourceUtils';
import { createNewResource } from './ResourceSource';
const fs = optionalRequire('fs');
const path = optionalRequire('path');

export type EmbeddedResource = {|
  resourceKind: string,
  resourceName?: string,

  /** The "path" to the embedded resource (e.g: a tileset) as stored in the parent resource (e.g: a tilemap). */
  relPath: string,

  /** The full path to the file of the embedded resource. */
  fullPath: string,

  /** True if the embedded resource file is outside the project folder. */
  isOutsideProjectFolder: boolean,
|};

export type EmbeddedResources = {|
  hasAnyEmbeddedResourceOutsideProjectFolder: boolean,
  embeddedResources: Map<string, EmbeddedResource>,
|};

export type MappedResources = {|
  mapping: { [key: string]: string },
|};

type ParseEmbeddedFiles = (
  project: gdProject,
  filePath: string
) => Promise<?EmbeddedResources>;

/**
 * Copy the embedded resources inside the project folder
 */
export async function copyAllEmbeddedResourcesToProjectFolder(
  project: gdProject,
  filesWithEmbeddedResources: Map<string, EmbeddedResources>
) {
  if (!fs || !path) {
    return;
  }

  const projectPath = path.dirname(project.getProjectFile());
  const copies = [];

  for (const {
    hasAnyEmbeddedResourceOutsideProjectFolder,
    embeddedResources,
  } of filesWithEmbeddedResources.values()) {
    if (!hasAnyEmbeddedResourceOutsideProjectFolder) continue;

    for (const embedded of embeddedResources.values()) {
      if (!embedded.isOutsideProjectFolder) continue;

      const resourceBasename = path.basename(embedded.fullPath);
      const fileExtension = path.extname(resourceBasename);
      const fileNameWithoutExtension = path.basename(
        resourceBasename,
        fileExtension
      );

      const newFileNameWithoutExtension = newNameGenerator(
        fileNameWithoutExtension,
        tentativeFileName => {
          const tentativePath =
            path.join(projectPath, tentativeFileName) + fileExtension;
          return fs.existsSync(tentativePath);
        }
      );

      const resourceNewPath = path.join(
        projectPath,
        newFileNameWithoutExtension + fileExtension
      );

      embedded.resourceName = newFileNameWithoutExtension + fileExtension;

      copies.push(fs.promises.copyFile(embedded.fullPath, resourceNewPath));
    }
  }

  return Promise.all(copies);
}

/**
 * Create the mapping between embedded resource path (e.g: path to a tileset) to its resource name (i.e: the name of
 * the resource containing the tileset).
 */
export function createAndMapEmbeddedResources(
  project: gdProject,
  filesWithEmbeddedResources: Map<string, EmbeddedResources>
): Map<string, MappedResources> {
  const projectPath = path.dirname(project.getProjectFile());

  const filesWithMappedResources = new Map<string, MappedResources>();
  for (const [filePath, { embeddedResources }] of filesWithEmbeddedResources) {
    const mapping = {};
    for (let {
      resourceKind,
      resourceName,
      relPath,
      fullPath,
    } of embeddedResources.values()) {
      if (!resourceName) {
        resourceName = path.relative(projectPath, fullPath);
      }

      const theEmbeddedResource = createNewResource(resourceKind);
      if (theEmbeddedResource) {
        theEmbeddedResource.setName(resourceName);
        theEmbeddedResource.setFile(resourceName);

        mapping[relPath] = resourceName;

        // embedded resources can have mappings too
        if (filesWithMappedResources.has(fullPath)) {
          const mappedResources = filesWithMappedResources.get(fullPath);

          if (mappedResources && mappedResources.mapping) {
            theEmbeddedResource.setMetadata(
              JSON.stringify({
                embeddedResourcesMapping: mappedResources.mapping,
              })
            );

            filesWithMappedResources.delete(fullPath);
          }
        }

        project.getResourcesManager().addResource(theEmbeddedResource);
      }
    }

    filesWithMappedResources.set(filePath, {
      mapping,
    });
  }

  return filesWithMappedResources;
}

/**
 * List the embedded resources of a Tilemap (or JSON) resource.
 * Supports LDtk tilemaps.
 *
 * @param project The project
 * @param filePath The file path of a resource
 * @returns
 */
export async function listTileMapEmbeddedResources(
  project: gdProject,
  filePath: string
): Promise<?EmbeddedResources> {
  if (!fs || !path) {
    return null;
  }

  const data = await fs.promises.readFile(filePath, 'utf8');
  try {
    const tileMap = JSON.parse(data);

    // For LDtk tilemaps, read the tilesets.
    if (tileMap && tileMap.__header__ && tileMap.__header__.app === 'LDtk') {
      const dir = path.dirname(filePath);
      const embeddedResources = new Map<string, EmbeddedResource>();
      let hasAnyEmbeddedResourceOutsideProjectFolder = false;

      for (const tileset of tileMap.defs.tilesets) {
        if (tileset.relPath) {
          const relPath = tileset.relPath;
          const fullPath = path.resolve(dir, relPath);
          const isOutsideProjectFolder = !isPathInProjectFolder(
            project,
            fullPath
          );
          const resource: EmbeddedResource = {
            resourceKind: 'image',
            relPath,
            fullPath,
            isOutsideProjectFolder,
          };

          embeddedResources.set(relPath, resource);

          if (isOutsideProjectFolder)
            hasAnyEmbeddedResourceOutsideProjectFolder = true;
        }
      }

      for (const level of tileMap.levels) {
        if (level.bgRelPath) {
          const relPath = level.bgRelPath;
          const fullPath = path.resolve(dir, relPath);
          const isOutsideProjectFolder = !isPathInProjectFolder(
            project,
            fullPath
          );
          const resource: EmbeddedResource = {
            resourceKind: 'image',
            relPath,
            fullPath,
            isOutsideProjectFolder,
          };

          embeddedResources.set(level.bgRelPath, resource);

          if (isOutsideProjectFolder)
            hasAnyEmbeddedResourceOutsideProjectFolder = true;
        }
      }

      return {
        hasAnyEmbeddedResourceOutsideProjectFolder,
        embeddedResources,
      };
    }
  } catch (error) {
    console.error(
      `Unable to read properly the data from file ${filePath} for use as a tilemap - ignoring any potentially embedded resources.`
    );
    return null;
  }
}

export async function listSpineEmbeddedResources(
  project: gdProject,
  filePath: string
): Promise<?EmbeddedResources> {
  if (!fs || !path) return null;

  const atlasPath = filePath.replace('.json', '.atlas');
  const hasAtlasWithSameBasename = await new Promise<boolean>(resolve => {
    fs.promises
      .access(atlasPath, fs.constants.F_OK)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });

  // Spine resources usually have the same base names:
  // e.g. skeleton.json, skeleton.atlas and skeleton.png.
  if (!hasAtlasWithSameBasename) {
    console.error(`Could not find an atlas file for Spine file ${filePath}.`);
    return null;
  }

  const atlasFileName = path.basename(atlasPath);
  const embeddedResources = new Map<string, EmbeddedResource>();
  const isOutsideProjectFolder = !isPathInProjectFolder(project, atlasPath);
  const resource: EmbeddedResource = {
    resourceKind: 'atlas',
    relPath: atlasFileName,
    fullPath: atlasPath,
    isOutsideProjectFolder,
  };

  embeddedResources.set(atlasFileName, resource);

  return {
    embeddedResources,
    hasAnyEmbeddedResourceOutsideProjectFolder: isOutsideProjectFolder,
  };
}

export async function listSpineTextureAtlasEmbeddedResources(
  project: gdProject,
  filePath: string
): Promise<?EmbeddedResources> {
  if (!fs || !path) return null;

  let atlasContent: ?string = null;
  try {
    atlasContent = await fs.promises.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(
      `Unable to read Spine Atlas file at path ${filePath}:`,
      error
    );
  }

  if (!atlasContent) return null;

  const atlasImageRegex = /.*\.(png|jpeg|jpg)$/gm;
  const imageDependencies = atlasContent.match(atlasImageRegex);
  if (!imageDependencies) return null;

  const dir = path.dirname(filePath);
  const embeddedResources = new Map<string, EmbeddedResource>();
  let hasAnyEmbeddedResourceOutsideProjectFolder = false;

  for (const relatedImagePath of imageDependencies) {
    const fullPath = path.resolve(dir, relatedImagePath);
    const isOutsideProjectFolder = !isPathInProjectFolder(project, fullPath);
    const resource: EmbeddedResource = {
      resourceKind: 'image',
      relPath: relatedImagePath,
      fullPath,
      isOutsideProjectFolder,
    };

    embeddedResources.set(relatedImagePath, resource);

    if (isOutsideProjectFolder)
      hasAnyEmbeddedResourceOutsideProjectFolder = true;
  }

  return {
    embeddedResources,
    hasAnyEmbeddedResourceOutsideProjectFolder,
  };
}

export const embeddedResourcesParsers: { [string]: ParseEmbeddedFiles } = {
  tilemap: listTileMapEmbeddedResources,
  json: listTileMapEmbeddedResources,
  spine: listSpineEmbeddedResources,
  atlas: listSpineTextureAtlasEmbeddedResources,
};
