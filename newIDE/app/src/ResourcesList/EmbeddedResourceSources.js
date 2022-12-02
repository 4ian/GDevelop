import optionalRequire from '../Utils/OptionalRequire';
import newNameGenerator from '../Utils/NewNameGenerator';
import { isPathInProjectFolder } from './ResourceUtils';
import { createNewResource } from './ResourceSource';
const fs = optionalRequire('fs');
const path = optionalRequire('path');

/**
 * Copy the embedded resources inside the project folder
 * @param project The project
 * @param embeddedFiles The embedded files
 * @returns
 */
export async function copyEmbeddedToProjectFolder(project, embeddedFiles) {
  if (!fs || !path) {
    return;
  }

  const projectPath = path.dirname(project.getProjectFile());
  const copies = [];

  for (const { outside, allFiles } of embeddedFiles.values()) {
    if (outside) {
      for (const embedded of Object.values(allFiles)) {
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
export function mapEmbeddedFiles(project, embeddedFiles) {
  const projectPath = path.dirname(project.getProjectFile());

  for (const { allFiles, mapping } of embeddedFiles.values()) {
    for (let { kind, relPath, fullPath, resourceName } of Object.values(
      allFiles
    )) {
      if (!resourceName) {
        resourceName = path.relative(projectPath, fullPath);
      }

      const newResource = createNewResource(kind);
      newResource.setName(resourceName);
      newResource.setFile(resourceName);

      mapping[relPath] = resourceName;

      project.getResourcesManager().addResource(newResource);
    }
  }
}

/**
 * List the embedded resource of a resource
 * @param project The project
 * @param filePath The file path of a resource
 * @returns
 */
export async function listTileMapEmbeddedFiles(project, filePath) {
  if (!fs || !path) {
    return;
  }

  const data = await fs.promises.readFile(filePath, 'utf8');
  const tileMap = JSON.parse(data);
  if (tileMap && tileMap.__header__ && tileMap.__header__.app === 'LDtk') {
    const dir = path.dirname(filePath);
    const allFiles = {};
    let outside = false;

    for (const tileset of tileMap.defs.tilesets) {
      if (tileset.relPath) {
        const relPath = tileset.relPath;
        const fullPath = path.resolve(dir, relPath);

        allFiles[relPath] = {
          kind: 'image',
          relPath,
          fullPath,
          outside: !isPathInProjectFolder(project, fullPath),
        };

        outside = outside || allFiles[relPath].outside;
      }
    }

    for (const level of tileMap.levels) {
      if (level.bgRelPath) {
        const relPath = level.bgRelPath;
        const fullPath = path.resolve(dir, relPath);

        allFiles[level.bgRelPath] = {
          kind: 'image',
          relPath,
          fullPath,
          outside: !isPathInProjectFolder(project, fullPath),
        };

        outside = outside || allFiles[relPath].outside;
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
