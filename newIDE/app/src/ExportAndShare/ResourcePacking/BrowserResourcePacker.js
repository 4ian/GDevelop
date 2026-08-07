// @flow
import path from 'path-browserify';
import { buildPackLayout } from './PackFormat';
import {
  RESOURCE_KINDS_NEVER_PACKED,
  appendResourcePacksManifestToDataJs,
  buildResourcePacksManifest,
  planResourcePacks,
  readProjectDataFromDataJs,
} from './index';
import {
  type BlobFileDescriptor,
  type TextFileDescriptor,
} from '../../Utils/BrowserArchiver';

// See BrowserFileSystem for why `path.posix` is not used directly.
const pathPosix = path.posix || path;

type Args = {|
  textFiles: Array<TextFileDescriptor>,
  blobFiles: Array<BlobFileDescriptor>,
  basePath: string,
  onProgress: (count: number, total: number) => void,
|};

type Output = {|
  textFiles: Array<TextFileDescriptor>,
  blobFiles: Array<BlobFileDescriptor>,
|};

/**
 * Replace the individual resource files of an exported game by a handful of
 * ".gdpak" archives, so that the game can be uploaded to services limiting the
 * number of files in an archive (itch.io allows 1000).
 *
 * Nothing is read back into memory: a pack is a `Blob` built from the blobs of
 * the files it contains, which the browser keeps where they already are.
 */
export const packResourcesInBlobFiles = async ({
  textFiles,
  blobFiles,
  basePath,
  onProgress,
}: Args): Promise<Output> => {
  const dataJsFilePath = pathPosix.join(basePath, 'data.js');
  const dataJsFile = textFiles.find(
    ({ filePath }) => filePath === dataJsFilePath
  );
  if (!dataJsFile) {
    throw new Error(
      `Could not find "${dataJsFilePath}" in the exported game, so its resources can't be packed.`
    );
  }

  const plan = planResourcePacks(readProjectDataFromDataJs(dataJsFile.text), {
    excludedResourceKinds: RESOURCE_KINDS_NEVER_PACKED,
  });
  if (!plan.packs.length) return { textFiles, blobFiles };

  const blobByRelativePath: Map<string, Blob> = new Map();
  blobFiles.forEach(({ filePath, blob }) => {
    blobByRelativePath.set(pathPosix.relative(basePath, filePath), blob);
  });

  const packedFilePaths: Set<string> = new Set();
  const packBlobFiles: Array<BlobFileDescriptor> = [];
  let packedCount = 0;

  for (const pack of plan.packs) {
    const contents: Array<{| filePath: string, blob: Blob |}> = [];
    pack.filePaths.forEach(filePath => {
      const blob = blobByRelativePath.get(filePath);
      // A resource can be missing when the project references a file that was
      // not exported. The engine already copes with a missing resource, so skip
      // it rather than failing the whole export.
      if (blob) contents.push({ filePath, blob });
    });

    packedCount++;
    onProgress(packedCount, plan.packs.length);
    // Writing an empty archive would only waste a file. Nothing refers to it,
    // as the manifest is built from the files that were really packed.
    if (!contents.length) continue;

    const layout = buildPackLayout(
      contents.map(({ filePath, blob }) => ({ filePath, size: blob.size }))
    );

    const parts: Array<Blob | Uint8Array> = [layout.headerBytes];
    layout.entries.forEach((entry, index) => {
      parts.push(contents[index].blob);
      if (layout.paddings[index] > 0) {
        parts.push(new Uint8Array(layout.paddings[index]));
      }
    });

    packBlobFiles.push({
      filePath: pathPosix.join(basePath, pack.name),
      blob: new Blob(parts, { type: 'application/octet-stream' }),
    });
    contents.forEach(({ filePath }) => packedFilePaths.add(filePath));
  }

  // The files that made it into a pack must not be exported on their own
  // anymore - that is the whole point.
  const remainingBlobFiles = blobFiles.filter(
    ({ filePath }) =>
      !packedFilePaths.has(pathPosix.relative(basePath, filePath))
  );

  const manifest = buildResourcePacksManifest(plan, packedFilePaths);

  return {
    textFiles: textFiles.map(textFile =>
      textFile.filePath === dataJsFilePath
        ? {
            filePath: textFile.filePath,
            text: appendResourcePacksManifestToDataJs(textFile.text, manifest),
          }
        : textFile
    ),
    blobFiles: [...remainingBlobFiles, ...packBlobFiles],
  };
};
