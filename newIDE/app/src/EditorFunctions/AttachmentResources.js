// @flow
import {
  allResourceKindsAndMetadata,
  createNewResource,
} from '../ResourcesList/ResourceSource';
import {
  applyResourceDefaults,
  updateResourceJsonMetadata,
} from '../ResourcesList/ResourceUtils';
import { triggerOnResourceExternallyChanged } from '../MainFrame/ResourcesWatcher';
import newNameGenerator from '../Utils/NewNameGenerator';

export type ResourceFilesStorage =
  | 'stored'
  // Kept in memory, and stored when the project is saved.
  | 'stored-when-project-is-saved'
  // The project was not saved, and the files can't be kept in memory.
  | 'project-not-saved';

export type AttachmentsForResources = {|
  // The files attached by the user to the AI (null for an unknown or expired one).
  getFiles: (
    attachmentIds: Array<string>
  ) => Promise<{ [attachmentId: string]: ?File }>,
  // Where attachments are paths of local files (the CLI and the MCP server):
  // the path, relative to the project, of those already in the folder of a
  // project saved on this computer. They are used where they are.
  getProjectFilePaths?: (
    attachmentIds: Array<string>
  ) => { [attachmentId: string]: ?string },
  // Stores the files of the resources just added or changed (uploaded to the
  // cloud, or written in the project folder), asking the user to save the
  // project first where files can't be kept in memory until it is saved.
  storeResourceFiles: () => Promise<ResourceFilesStorage>,
|};

export type AttachmentResourceAddition = {|
  attachmentId: string,
  resourceName: string | null,
  resourceKind: string | null,
|};

export type AttachmentResourceReplacement = {|
  attachmentId: string,
  resourceName: string,
|};

const getExtension = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex === -1 ? '' : fileName.slice(dotIndex + 1).toLowerCase();
};

const getKindsAccepting = (fileName: string): Array<string> =>
  allResourceKindsAndMetadata
    .filter(({ fileExtensions }) =>
      fileExtensions.includes(getExtension(fileName))
    )
    .map(({ kind }) => kind);

type AppliedChange = {|
  resourceName: string,
  // Null for a file of the project folder: there is nothing to store.
  blobUrl: string | null,
  // What to restore if the file cannot be stored: null for an added resource.
  previousFile: {| file: string, metadata: string |} | null,
  description: string,
|};

/**
 * Add the files attached by the user as new resources, or as the new file of
 * existing resources (keeping their names, so everything using them uses the
 * new file). A change whose file cannot be stored in the project is undone.
 */
export const addOrReplaceResourcesFromAttachments = async ({
  project,
  additions,
  replacements,
  attachmentsForResources,
}: {|
  project: gdProject,
  additions: Array<AttachmentResourceAddition>,
  replacements: Array<AttachmentResourceReplacement>,
  attachmentsForResources: AttachmentsForResources,
|}): Promise<{| changes: Array<string>, warnings: Array<string> |}> => {
  const changes = [];
  const warnings = [];
  const resourcesManager = project.getResourcesManager();
  const attachmentIds = [
    ...additions.map(({ attachmentId }) => attachmentId),
    ...replacements.map(({ attachmentId }) => attachmentId),
  ];
  const projectFilePaths: {
    [attachmentId: string]: ?string,
  } = attachmentsForResources.getProjectFilePaths
    ? attachmentsForResources.getProjectFilePaths(attachmentIds)
    : {};
  const files = await attachmentsForResources.getFiles(
    attachmentIds.filter(attachmentId => !projectFilePaths[attachmentId])
  );
  const getFile = (attachmentId: string): ?File => {
    const file = files[attachmentId];
    if (!file) {
      warnings.push(
        attachmentsForResources.getProjectFilePaths &&
          /[\\/]/.test(attachmentId)
          ? `The file "${attachmentId}" was not found: give the absolute path of an existing file.`
          : `The attached file "${attachmentId}" is not available (attached files are kept 30 days): ask the user to attach it again.`
      );
    }
    return file;
  };

  const appliedChanges: Array<AppliedChange> = [];
  const setResourceFile = (resource: gdResource, file: File): string => {
    const blobUrl = URL.createObjectURL(file);
    resource.setFile(blobUrl);
    // The file is stored with a unique name, next to the others, made of the
    // resource name and this extension.
    const extension = `.${getExtension(file.name)}`;
    updateResourceJsonMetadata(resource, {
      extension: resource
        .getName()
        .toLowerCase()
        .endsWith(extension)
        ? ''
        : extension,
      localFilePath: undefined,
    });
    return blobUrl;
  };

  additions.forEach(({ attachmentId, resourceName, resourceKind }) => {
    const projectFilePath = projectFilePaths[attachmentId];
    const file = projectFilePath ? null : getFile(attachmentId);
    if (!projectFilePath && !file) return;
    const fileName = projectFilePath || (file ? file.name : '');
    const acceptingKinds = getKindsAccepting(fileName);
    const kind =
      resourceKind || (acceptingKinds.length > 0 ? acceptingKinds[0] : null);
    if (!kind || !acceptingKinds.includes(kind)) {
      warnings.push(
        `"${fileName}" cannot be added as ${
          resourceKind ? `a ${resourceKind}` : 'a'
        } resource: its extension is not supported. Supported ones: ${allResourceKindsAndMetadata
          .map(
            ({ kind, fileExtensions }) =>
              `${kind} (${fileExtensions.join(', ')})`
          )
          .join(', ')}. Skipped.`
      );
      return;
    }
    const resource = createNewResource(kind);
    if (!resource) return;
    // A unique name keeping the extension ("logo2.png", not "logo.png2").
    const requestedName = resourceName || fileName;
    const extensionIndex = requestedName.lastIndexOf('.');
    const nameExtension =
      extensionIndex > 0 ? requestedName.slice(extensionIndex) : '';
    const name =
      newNameGenerator(
        requestedName.slice(0, requestedName.length - nameExtension.length),
        nameWithoutExtension =>
          resourcesManager.hasResource(nameWithoutExtension + nameExtension)
      ) + nameExtension;
    resource.setName(name);
    if (projectFilePath) resource.setFile(projectFilePath);
    const blobUrl = file ? setResourceFile(resource, file) : null;
    applyResourceDefaults(project, resource);
    resourcesManager.addResource(resource);
    resource.delete();
    appliedChanges.push({
      resourceName: name,
      blobUrl,
      previousFile: null,
      description: projectFilePath
        ? `Added the ${kind} resource "${name}" (the file "${projectFilePath}" of the project folder).`
        : `Added the ${kind} resource "${name}" (from the attached file "${fileName}").`,
    });
  });

  replacements.forEach(({ attachmentId, resourceName }) => {
    if (!resourcesManager.hasResource(resourceName)) {
      warnings.push(
        `Resource not found: "${resourceName}". To add the attached file as a new resource, use \`added_resources\`. Skipped.`
      );
      return;
    }
    const projectFilePath = projectFilePaths[attachmentId];
    const file = projectFilePath ? null : getFile(attachmentId);
    if (!projectFilePath && !file) return;
    const fileName = projectFilePath || (file ? file.name : '');
    const resource = resourcesManager.getResource(resourceName);
    const kind = resource.getKind();
    if (!getKindsAccepting(fileName).includes(kind)) {
      warnings.push(
        `"${fileName}" cannot be the file of "${resourceName}", which is a ${kind} resource. Skipped.`
      );
      return;
    }
    const previousFile = {
      file: resource.getFile(),
      metadata: resource.getMetadata(),
    };
    if (projectFilePath) {
      resource.setFile(projectFilePath);
      updateResourceJsonMetadata(resource, { localFilePath: undefined });
    }
    const blobUrl = file ? setResourceFile(resource, file) : null;
    appliedChanges.push({
      resourceName,
      blobUrl,
      previousFile,
      description: projectFilePath
        ? `Replaced the file of the resource "${resourceName}" by the file "${projectFilePath}" of the project folder (everything using this resource now uses it).`
        : `Replaced the file of the resource "${resourceName}" by the attached file "${fileName}" (everything using this resource now uses it).`,
    });
  });

  if (!appliedChanges.length) return { changes, warnings };

  const undoChange = ({
    resourceName,
    blobUrl,
    previousFile,
  }: AppliedChange) => {
    if (previousFile) {
      const resource = resourcesManager.getResource(resourceName);
      resource.setFile(previousFile.file);
      resource.setMetadata(previousFile.metadata);
    } else {
      resourcesManager.removeResource(resourceName);
    }
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  };

  const resourceFilesStorage = appliedChanges.some(({ blobUrl }) => !!blobUrl)
    ? await attachmentsForResources.storeResourceFiles()
    : 'stored';
  if (resourceFilesStorage === 'project-not-saved') {
    appliedChanges.forEach(undoChange);
    warnings.push(
      'The attached files were not added: the project must be saved (in the cloud) to store them, and the user did not save it, or saving it failed. Nothing was changed. Stop and ask the user to save their project, then try again.'
    );
    return { changes, warnings };
  }

  const areFilesStored = resourceFilesStorage === 'stored';
  appliedChanges.forEach(appliedChange => {
    const { resourceName, blobUrl, previousFile, description } = appliedChange;
    const resource = resourcesManager.getResource(resourceName);
    if (blobUrl && areFilesStored && resource.getFile() === blobUrl) {
      undoChange(appliedChange);
      warnings.push(
        `The file for "${resourceName}" could not be stored in the project: nothing was changed.`
      );
      return;
    }
    if (blobUrl && areFilesStored) URL.revokeObjectURL(blobUrl);
    // Reload what displays the previous file of the resource.
    if (previousFile)
      triggerOnResourceExternallyChanged({ identifier: resource.getFile() });
    changes.push(description);
  });
  if (!areFilesStored && appliedChanges.some(({ blobUrl }) => !!blobUrl)) {
    changes.push(
      'The project is not saved yet: the files will be stored in it when it is saved.'
    );
  }
  return { changes, warnings };
};
