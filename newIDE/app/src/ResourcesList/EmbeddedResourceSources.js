// @flow
import optionalRequire from '../Utils/OptionalRequire';
import newNameGenerator from '../Utils/NewNameGenerator';
import { isPathInProjectFolder } from './ResourceUtils';
import { createNewResource } from './ResourceSource';
const fs = optionalRequire('fs');
const path = optionalRequire('path');

export type EmbeddedResource = {
  resourceKind: string,
  resourceName?: string,
  relPath: string,
  fullPath: string,
  outside: boolean,
};

export type EmbeddedResourceResult = {
  filePath: string,
  outside: boolean,
  allFiles: Map<string, EmbeddedResource>,
  mapping: { [key: string]: string },
};

/**
 * Copy the embedded resources inside the project folder
 * @param project The project
 * @param embeddedFiles The embedded files
 * @returns
 */
export async function copyEmbeddedToProjectFolder(
  project: gdProject,
  embeddedFiles: Map<string, EmbeddedResourceResult>
) {
  if (!fs || !path) {
    return;
  }

  const projectPath = path.dirname(project.getProjectFile());
  const copies = [];

  for (const { outside, allFiles } of embeddedFiles.values()) {
    if (outside) {
      for (const embedded of allFiles.values()) {
        if (embedded.outside) {
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
    }
  }

  return Promise.all(copies);
}

/**
 * Create the mapping an embedded resource path to its resource name
 * @param project The project
 * @param embeddedFiles The embedded files
 */
export function mapEmbeddedFiles(
  project: gdProject,
  embeddedFiles: Map<string, EmbeddedResourceResult>
) {
  const projectPath = path.dirname(project.getProjectFile());

  for (const { allFiles, mapping } of embeddedFiles.values()) {
    for (let {
      resourceKind,
      resourceName,
      relPath,
      fullPath,
    } of allFiles.values()) {
      if (!resourceName) {
        resourceName = path.relative(projectPath, fullPath);
      }

      const newResource = createNewResource(resourceKind);
      if (newResource) {
        newResource.setName(resourceName);
        newResource.setFile(resourceName);

        mapping[relPath] = resourceName;

        project.getResourcesManager().addResource(newResource);
      }
    }
  }
}

/**
 * List the embedded resource of a resource
 * @param project The project
 * @param filePath The file path of a resource
 * @returns
 */
export async function listTileMapEmbeddedFiles(
  project: gdProject,
  filePath: string
): Promise<?EmbeddedResourceResult> {
  if (!fs || !path) {
    return;
  }

  const data = await fs.promises.readFile(filePath, 'utf8');
  const tileMap = JSON.parse(data);
  if (tileMap && tileMap.__header__ && tileMap.__header__.app === 'LDtk') {
    const dir = path.dirname(filePath);
    const allFiles = new Map<string, EmbeddedResource>();
    let outside = false;

    for (const tileset of tileMap.defs.tilesets) {
      if (tileset.relPath) {
        const relPath = tileset.relPath;
        const fullPath = path.resolve(dir, relPath);
        const resource = {
          resourceKind: 'image',
          relPath,
          fullPath,
          outside: !isPathInProjectFolder(project, fullPath),
        };

        allFiles.set(relPath, resource);

        outside = outside || resource.outside;
      }
    }

    for (const level of tileMap.levels) {
      if (level.bgRelPath) {
        const relPath = level.bgRelPath;
        const fullPath = path.resolve(dir, relPath);
        const resource = {
          resourceKind: 'image',
          relPath,
          fullPath,
          outside: !isPathInProjectFolder(project, fullPath),
        };

        allFiles.set(level.bgRelPath, resource);

        outside = outside || resource.outside;
      }
    }

    return {
      filePath,
      outside,
      allFiles,
      mapping: {},
    };
  }
}
