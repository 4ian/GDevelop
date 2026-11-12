// @flow
import optionalRequire from '../Utils/OptionalRequire';
import { readLocalFileToFile } from '../Utils/LocalFileUploader';
import { type AttachmentsForResources } from './AttachmentResources';

const fs = optionalRequire('fs');
const path = optionalRequire('path');

type PathModule = {
  relative: (from: string, to: string) => string,
  dirname: (filePath: string) => string,
  isAbsolute: (filePath: string) => boolean,
  sep: string,
  ...
};

/**
 * The path of a file relative to the folder of a project (as the files of
 * resources are stored), or null if the file is not in this folder.
 */
export const getPathInProjectFolder = ({
  filePath,
  projectFilePath,
  pathModule,
}: {|
  filePath: string,
  projectFilePath: string,
  pathModule: PathModule,
|}): string | null => {
  const relativePath = pathModule.relative(
    pathModule.dirname(projectFilePath),
    filePath
  );
  if (
    !relativePath ||
    relativePath.startsWith('..') ||
    pathModule.isAbsolute(relativePath)
  )
    return null;
  return relativePath.split(pathModule.sep).join('/');
};

const isLocalFile = (filePath: string): boolean => {
  if (!fs || !path || !path.isAbsolute(filePath)) return false;
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
};

/**
 * Where there is no user attaching files (the CLI and the MCP server), the
 * "attachments" given to the functions making resources can also be the
 * absolute paths of files of this computer.
 */
export const withLocalFilesAsAttachments = (
  attachmentsForResources: AttachmentsForResources,
  {
    getLocalProjectFilePath,
  }: {|
    // The path of the project file, when it is saved on this computer.
    getLocalProjectFilePath: () => string | null,
  |}
): AttachmentsForResources => {
  if (!fs || !path) return attachmentsForResources;

  return {
    getFiles: async attachmentIds => {
      const localFilePaths = attachmentIds.filter(isLocalFile);
      const files = await attachmentsForResources.getFiles(
        attachmentIds.filter(
          attachmentId =>
            !localFilePaths.includes(attachmentId) &&
            !path.isAbsolute(attachmentId)
        )
      );
      await Promise.all(
        localFilePaths.map(async localFilePath => {
          try {
            files[localFilePath] = await readLocalFileToFile(localFilePath);
          } catch (error) {
            console.error(`Unable to read "${localFilePath}":`, error);
          }
        })
      );
      return files;
    },
    getProjectFilePaths: attachmentIds => {
      const projectFilePaths: { [attachmentId: string]: ?string } = {};
      const projectFilePath = getLocalProjectFilePath();
      if (!projectFilePath) return projectFilePaths;
      attachmentIds.filter(isLocalFile).forEach(localFilePath => {
        projectFilePaths[localFilePath] = getPathInProjectFolder({
          filePath: localFilePath,
          projectFilePath,
          pathModule: path,
        });
      });
      return projectFilePaths;
    },
    storeResourceFiles: attachmentsForResources.storeResourceFiles,
  };
};
