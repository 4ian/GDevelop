// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import { buildPackLayout } from './PackFormat';
import {
  RESOURCE_KINDS_NEVER_PACKED,
  appendResourcePacksManifestToDataJs,
  buildResourcePacksManifest,
  planResourcePacks,
  readProjectDataFromDataJs,
} from './index';

const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');

type Args = {|
  exportDir: string,
  onProgress: (count: number, total: number) => void,
|};

type PackedFile = {|
  filePath: string,
  absolutePath: string,
  size: number,
|};

/**
 * Append a chunk to a write stream, waiting for it to be accepted.
 */
const writeChunk = (output: any, chunk: Uint8Array): Promise<void> =>
  new Promise((resolve, reject) => {
    output.write(chunk, error => (error ? reject(error) : resolve()));
  });

/**
 * Copy a whole file into an already opened write stream, without loading it in
 * memory: a pack can hold hundreds of megabytes of 3D models or music.
 */
const appendFileToStream = (output: any, filePath: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const input = fs.createReadStream(filePath);
    input.on('error', reject);
    // Writes stay ordered because they are queued on the write stream, so
    // resolving as soon as the file has been read entirely is enough.
    input.on('end', resolve);
    input.pipe(
      output,
      { end: false }
    );
  });

/**
 * Replace the individual resource files of an exported game folder by a
 * handful of ".gdpak" archives, so that the game can be uploaded to services
 * limiting the number of files in an archive (itch.io allows 1000).
 *
 * Must be called after the resources stored as URLs have been downloaded.
 */
export const packResourcesInFolder = async ({
  exportDir,
  onProgress,
}: Args): Promise<void> => {
  const dataJsPath = path.join(exportDir, 'data.js');
  if (!(await fs.pathExists(dataJsPath))) {
    throw new Error(
      `Could not find "${dataJsPath}" in the exported game, so its resources can't be packed.`
    );
  }
  const dataJsContent = await fs.readFile(dataJsPath, 'utf8');

  const plan = planResourcePacks(readProjectDataFromDataJs(dataJsContent), {
    excludedResourceKinds: RESOURCE_KINDS_NEVER_PACKED,
  });
  if (!plan.packs.length) return;

  const packedFilePaths: Set<string> = new Set();
  let packedCount = 0;

  for (const pack of plan.packs) {
    const contents: Array<PackedFile> = [];
    for (const filePath of pack.filePaths) {
      const absolutePath = path.join(exportDir, filePath);
      // A resource can be missing when the project references a file that was
      // not exported. The engine already copes with a missing resource, so skip
      // it rather than failing the whole export.
      const stats = await fs.stat(absolutePath).catch(() => null);
      if (!stats || !stats.isFile()) continue;

      contents.push({ filePath, absolutePath, size: stats.size });
    }

    packedCount++;
    onProgress(packedCount, plan.packs.length);
    // Writing an empty archive would only waste a file. Nothing refers to it,
    // as the manifest is built from the files that were really packed.
    if (!contents.length) continue;

    const layout = buildPackLayout(
      contents.map(({ filePath, size }) => ({ filePath, size }))
    );

    const output = fs.createWriteStream(path.join(exportDir, pack.name));
    try {
      await writeChunk(output, layout.headerBytes);
      for (let index = 0; index < layout.entries.length; index++) {
        await appendFileToStream(output, contents[index].absolutePath);
        const padding = layout.paddings[index];
        if (padding > 0) await writeChunk(output, new Uint8Array(padding));
      }
    } finally {
      await new Promise(resolve => output.end(resolve));
    }

    contents.forEach(({ filePath }) => packedFilePaths.add(filePath));
  }

  // The files that made it into a pack must not be exported on their own
  // anymore - that is the whole point.
  for (const filePath of packedFilePaths) {
    await fs.remove(path.join(exportDir, filePath));
  }

  const manifest = buildResourcePacksManifest(plan, packedFilePaths);

  await fs.writeFile(
    dataJsPath,
    appendResourcePacksManifestToDataJs(dataJsContent, manifest),
    'utf8'
  );
};
