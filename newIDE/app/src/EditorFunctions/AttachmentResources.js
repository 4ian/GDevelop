// @flow
import {
  allResourceKindsAndMetadata,
  createNewResource,
} from '../ResourcesList/ResourceSource';
import { applyResourceDefaults } from '../ResourcesList/ResourceUtils';
import ResourcesLoader from '../ResourcesLoader';
import newNameGenerator from '../Utils/NewNameGenerator';

export type AttachmentsForResources = {|
  // The files attached by the user to the AI (null for an unknown or expired one).
  getFiles: (
    attachmentIds: Array<string>
  ) => Promise<{ [attachmentId: string]: ?File }>,
  // Stores the files of the resources just added or changed (uploaded to the
  // cloud, or written in the project folder). Resolves to false when the
  // project is not saved yet: they are then stored when it is saved.
  storeResourceFiles: () => Promise<boolean>,
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
  blobUrl: string,
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
  attachments,
}: {|
  project: gdProject,
  additions: Array<AttachmentResourceAddition>,
  replacements: Array<AttachmentResourceReplacement>,
  attachments: AttachmentsForResources,
|}): Promise<{| changes: Array<string>, warnings: Array<string> |}> => {
  const changes = [];
  const warnings = [];
  const resourcesManager = project.getResourcesManager();
  const files = await attachments.getFiles([
    ...additions.map(({ attachmentId }) => attachmentId),
    ...replacements.map(({ attachmentId }) => attachmentId),
  ]);
  const getFile = (attachmentId: string): ?File => {
    const file = files[attachmentId];
    if (!file) {
      warnings.push(
        `The attached file "${attachmentId}" is not available (attached files are kept 30 days): ask the user to attach it again.`
      );
    }
    return file;
  };

  const appliedChanges: Array<AppliedChange> = [];
  const setResourceFile = (resource: gdResource, file: File): string => {
    const blobUrl = URL.createObjectURL(file);
    resource.setFile(blobUrl);
    // The file is stored with a unique name, next to the others.
    resource.setMetadata(
      JSON.stringify({ extension: `.${getExtension(file.name)}` })
    );
    return blobUrl;
  };

  additions.forEach(({ attachmentId, resourceName, resourceKind }) => {
    const file = getFile(attachmentId);
    if (!file) return;
    const acceptingKinds = getKindsAccepting(file.name);
    const kind =
      resourceKind || (acceptingKinds.length > 0 ? acceptingKinds[0] : null);
    if (!kind || !acceptingKinds.includes(kind)) {
      warnings.push(
        `"${file.name}" cannot be added as ${
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
    const requestedName = resourceName || file.name;
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
    const blobUrl = setResourceFile(resource, file);
    applyResourceDefaults(project, resource);
    resourcesManager.addResource(resource);
    resource.delete();
    appliedChanges.push({
      resourceName: name,
      blobUrl,
      previousFile: null,
      description: `Added the ${kind} resource "${name}" (from the attached file "${
        file.name
      }").`,
    });
  });

  replacements.forEach(({ attachmentId, resourceName }) => {
    if (!resourcesManager.hasResource(resourceName)) {
      warnings.push(
        `Resource not found: "${resourceName}". To add the attached file as a new resource, use \`added_resources\`. Skipped.`
      );
      return;
    }
    const file = getFile(attachmentId);
    if (!file) return;
    const resource = resourcesManager.getResource(resourceName);
    const kind = resource.getKind();
    if (!getKindsAccepting(file.name).includes(kind)) {
      warnings.push(
        `"${
          file.name
        }" cannot be the file of "${resourceName}", which is a ${kind} resource. Skipped.`
      );
      return;
    }
    const previousFile = {
      file: resource.getFile(),
      metadata: resource.getMetadata(),
    };
    const blobUrl = setResourceFile(resource, file);
    appliedChanges.push({
      resourceName,
      blobUrl,
      previousFile,
      description: `Replaced the file of the resource "${resourceName}" by the attached file "${
        file.name
      }" (everything using this resource now uses it).`,
    });
  });

  if (!appliedChanges.length) return { changes, warnings };

  const areFilesStored = await attachments.storeResourceFiles();
  appliedChanges.forEach(
    ({ resourceName, blobUrl, previousFile, description }) => {
      const resource = resourcesManager.getResource(resourceName);
      if (areFilesStored && resource.getFile() === blobUrl) {
        if (previousFile) {
          resource.setFile(previousFile.file);
          resource.setMetadata(previousFile.metadata);
        } else {
          resourcesManager.removeResource(resourceName);
        }
        URL.revokeObjectURL(blobUrl);
        warnings.push(
          `The file for "${resourceName}" could not be stored in the project: nothing was changed.`
        );
        return;
      }
      if (areFilesStored) URL.revokeObjectURL(blobUrl);
      changes.push(description);
    }
  );
  if (!areFilesStored) {
    changes.push(
      'The project is not saved yet: the files will be stored in it when it is saved.'
    );
  }
  ResourcesLoader.burstUrlsCacheForResources(
    project,
    appliedChanges.map(({ resourceName }) => resourceName)
  );

  return { changes, warnings };
};
