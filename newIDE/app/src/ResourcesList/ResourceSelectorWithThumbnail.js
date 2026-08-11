// @flow
import * as React from 'react';
import ResourcesLoader from '../ResourcesLoader';
import ResourceSelector from './ResourceSelector';
import {
  allResourceKindsAndMetadata,
  type ResourceManagementProps,
  type ResourceKind,
} from './ResourceSource';
import ResourceThumbnail, {
  resourcesKindsWithThumbnail,
} from './ResourceThumbnail';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { LineStackLayout } from '../UI/Layout';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { Line } from '../UI/Grid';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import optionalRequire from '../Utils/OptionalRequire';
import {
  getActiveProjectFileDragPath,
  getProjectFilePathFromDataTransfer,
  hasProjectFileDragData,
} from '../Utils/ProjectFileDragData';
import {
  applyResourceDefaults,
  copyAllToProjectFolder,
  DEFAULT_IMPORTED_RESOURCES_FOLDER,
  isURL,
} from './ResourceUtils';
import { showErrorBox } from '../UI/Messages/MessageBox';

const path = optionalRequire('path');
const electron = optionalRequire('electron');
const electronWebUtils = electron ? electron.webUtils : null;

const getResourceKindFileExtensions = (
  resourceKind: ResourceKind
): Array<string> => {
  const resourceKindMetadata = allResourceKindsAndMetadata.find(
    metadata => metadata.kind === resourceKind
  );
  return resourceKindMetadata ? resourceKindMetadata.fileExtensions : [];
};

const getResourceCreator = (resourceKind: ResourceKind): ?() => gdResource => {
  const resourceKindMetadata = allResourceKindsAndMetadata.find(
    metadata => metadata.kind === resourceKind
  );
  return resourceKindMetadata ? resourceKindMetadata.createNewResource : null;
};

const hasNativeFileDragData = (dataTransferTypes: any): boolean => {
  if (!dataTransferTypes) return false;

  if (typeof dataTransferTypes.includes === 'function') {
    return dataTransferTypes.includes('Files');
  }

  if (typeof dataTransferTypes.contains === 'function') {
    return dataTransferTypes.contains('Files');
  }

  for (let index = 0; index < dataTransferTypes.length; index++) {
    if (dataTransferTypes[index] === 'Files') return true;
  }

  return false;
};

export const hasDroppedResourceFileData = (
  dataTransfer: ?DataTransfer | any,
  resourceKind: ResourceKind
): boolean => {
  if (!dataTransfer) return false;

  const dataTransferTypes = dataTransfer.types || [];
  return (
    hasNativeFileDragData(dataTransferTypes) ||
    hasProjectFileDragData(dataTransferTypes) ||
    getDroppedResourceFilePathsFromDataTransfer(dataTransfer, resourceKind)
      .length > 0
  );
};

const getLocalPathFromNativeFile = (file: any, webUtils: any): ?string => {
  if (!file) return null;
  if (typeof file.path === 'string' && file.path) return file.path;

  if (webUtils && typeof webUtils.getPathForFile === 'function') {
    try {
      const filePath = webUtils.getPathForFile(file);
      return typeof filePath === 'string' && filePath ? filePath : null;
    } catch (error) {
      return null;
    }
  }

  return null;
};

export const isSupportedDroppedResourceFilePath = ({
  filePath,
  resourceKind,
}: {|
  filePath: string,
  resourceKind: ResourceKind,
|}): boolean => {
  if (!path || !filePath) return false;

  const extension = path
    .extname(filePath)
    .replace('.', '')
    .toLowerCase();
  return getResourceKindFileExtensions(resourceKind).includes(extension);
};

export const getDroppedResourceFilePathsFromDataTransfer = (
  dataTransfer: ?DataTransfer | any,
  resourceKind: ResourceKind,
  webUtils: any = electronWebUtils
): Array<string> => {
  const filePaths = [];
  const activeProjectFileDragPath = getActiveProjectFileDragPath();
  if (activeProjectFileDragPath) filePaths.push(activeProjectFileDragPath);

  if (dataTransfer) {
    const projectFilePath = getProjectFilePathFromDataTransfer(dataTransfer);
    if (projectFilePath) filePaths.push(projectFilePath);

    if (dataTransfer.files) {
      for (let index = 0; index < dataTransfer.files.length; index++) {
        const filePath = getLocalPathFromNativeFile(
          dataTransfer.files[index],
          webUtils
        );
        if (filePath) filePaths.push(filePath);
      }
    }
  }

  return Array.from(
    new Set(
      filePaths.filter(filePath =>
        isSupportedDroppedResourceFilePath({ filePath, resourceKind })
      )
    )
  );
};

export const importDroppedResourceFileAsProjectResource = async ({
  project,
  resourceKind,
  filePath,
  importedResourcesFolder,
}: {|
  project: gdProject,
  resourceKind: ResourceKind,
  filePath: string,
  importedResourcesFolder?: string,
|}): Promise<{| resourceName: string, hasCreatedResource: boolean |}> => {
  if (!path) throw new Error('Path module is not available.');
  const projectFile = project.getProjectFile();
  if (!projectFile) {
    throw new Error(
      'The project must be saved locally before importing resources.'
    );
  }

  const projectPath = path.dirname(projectFile);
  const normalizedFilePath = path.resolve(filePath);
  const resourcesManager = project.getResourcesManager();
  const existingResourceName = resourcesManager
    .getAllResourceNames()
    .toJSArray()
    .find(resourceName => {
      const resource = resourcesManager.getResource(resourceName);
      const resourceFile = resource.getFile();
      if (
        resource.getKind() !== resourceKind ||
        !resourceFile ||
        isURL(resourceFile)
      ) {
        return false;
      }

      const resourceFilePath = path.isAbsolute(resourceFile)
        ? resourceFile
        : path.join(projectPath, resourceFile);
      return path.resolve(resourceFilePath) === normalizedFilePath;
    });
  if (existingResourceName) {
    return {
      resourceName: existingResourceName,
      hasCreatedResource: false,
    };
  }

  const createNewResource = getResourceCreator(resourceKind);
  if (!createNewResource) {
    throw new Error(`Resource kind "${resourceKind}" is not supported.`);
  }

  const newToOldFilePaths = new Map<string, string>();
  const [resourceFilePath] = await copyAllToProjectFolder(
    project,
    [filePath],
    newToOldFilePaths,
    importedResourcesFolder || DEFAULT_IMPORTED_RESOURCES_FOLDER
  );
  const resourceName = path
    .relative(projectPath, resourceFilePath || filePath)
    .replace(/\\/g, '/');
  const resource = createNewResource();
  resource.setFile(resourceName);
  resource.setName(resourceName);
  applyResourceDefaults(project, resource);
  const hasCreatedResource = resourcesManager.addResource(resource);
  resource.delete();

  return { resourceName, hasCreatedResource };
};

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  resourceManagementProps: ResourceManagementProps,
  resourceKind: ResourceKind,
  resourceName: string,
  defaultNewResourceName?: string,
  onChange: string => void,
  floatingLabelText?: React.Node,
  hintText?: MessageDescriptor,
  helperMarkdownText?: ?string,
  fallbackResourceKind?: ResourceKind,
  importedResourcesFolder?: string,
  includeProjectAssetsFolder?: boolean,
  defaultLocalFileDialogFolder?: string,
  resourceNameFilter?: (resourceName: string, resource: gdResource) => boolean,
  id?: string,
  disabled?: boolean,
|};

const ResourceSelectorWithThumbnail = ({
  project,
  projectScopedContainersAccessor,
  resourceManagementProps,
  resourceKind,
  resourceName,
  defaultNewResourceName,
  onChange,
  floatingLabelText,
  hintText,
  helperMarkdownText,
  fallbackResourceKind,
  importedResourcesFolder,
  includeProjectAssetsFolder,
  defaultLocalFileDialogFolder,
  resourceNameFilter,
  id,
  disabled,
}: Props): React.Node => {
  const { isMobile } = useResponsiveWindowSize();
  const itemsAlignment = isMobile ? 'center' : 'flex-end';
  const displayThumbnail = resourcesKindsWithThumbnail.includes(resourceKind);
  const [isDraggedOver, setDraggedOver] = React.useState<boolean>(false);
  const storageProvider = resourceManagementProps.getStorageProvider();
  const canDropResourceFiles =
    !disabled &&
    resourceKind === 'model3D' &&
    storageProvider.internalName === 'LocalFile' &&
    !!project.getProjectFile();

  const hasSupportedDropData = React.useCallback(
    (event: any): boolean => {
      if (!canDropResourceFiles) return false;

      const dataTransfer = event.dataTransfer;
      if (!dataTransfer) return false;

      return hasDroppedResourceFileData(dataTransfer, resourceKind);
    },
    [canDropResourceFiles, resourceKind]
  );

  const keepDropActive = React.useCallback(
    (event: any) => {
      if (!hasSupportedDropData(event)) return;

      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
      setDraggedOver(true);
    },
    [hasSupportedDropData]
  );

  const onDropResourceFile = React.useCallback(
    async (event: any) => {
      if (!hasSupportedDropData(event)) return;

      event.preventDefault();
      event.stopPropagation();
      setDraggedOver(false);

      const droppedResourceFilePaths = getDroppedResourceFilePathsFromDataTransfer(
        event.dataTransfer,
        resourceKind
      );
      if (!droppedResourceFilePaths.length) return;

      try {
        const {
          resourceName,
          hasCreatedResource,
        } = await importDroppedResourceFileAsProjectResource({
          project,
          resourceKind,
          filePath: droppedResourceFilePaths[0],
          importedResourcesFolder,
        });

        const resource = project
          .getResourcesManager()
          .getResource(resourceName);
        if (resourceNameFilter && !resourceNameFilter(resourceName, resource)) {
          showErrorBox({
            message:
              'This resource cannot be used here. Choose a resource from the expected project folder.',
            errorId: 'resource-folder-mismatch',
          });
          return;
        }

        if (hasCreatedResource) {
          await resourceManagementProps.onFetchNewlyAddedResources();
          resourceManagementProps.onNewResourcesAdded();
        }
        onChange(resourceName);
        resourceManagementProps.onResourceUsageChanged();
      } catch (error) {
        console.error('Unable to import dropped resource:', error);
        showErrorBox({
          message:
            'Unable to import this resource. Check that the project is saved locally and the file can be read.',
          rawError: error,
          errorId: 'resource-drop-import-error',
        });
      }
    },
    [
      hasSupportedDropData,
      importedResourcesFolder,
      onChange,
      project,
      resourceKind,
      resourceManagementProps,
      resourceNameFilter,
    ]
  );

  const resourcesSelector = (
    <ResourceSelector
      project={project}
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      resourceManagementProps={resourceManagementProps}
      resourcesLoader={ResourcesLoader}
      resourceKind={resourceKind}
      fullWidth
      initialResourceName={resourceName}
      defaultNewResourceName={defaultNewResourceName}
      onChange={onChange}
      floatingLabelText={floatingLabelText}
      hintText={hintText}
      helperMarkdownText={helperMarkdownText}
      fallbackResourceKind={fallbackResourceKind}
      importedResourcesFolder={importedResourcesFolder}
      includeProjectAssetsFolder={includeProjectAssetsFolder}
      defaultLocalFileDialogFolder={defaultLocalFileDialogFolder}
      resourceNameFilter={resourceNameFilter}
      id={id}
      disabled={disabled}
    />
  );
  if (displayThumbnail) {
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          outline: isDraggedOver ? '1px dashed #8f72ff' : undefined,
          outlineOffset: 2,
        }}
        onDragEnter={keepDropActive}
        onDragOver={keepDropActive}
        onDragLeave={() => setDraggedOver(false)}
        onDrop={onDropResourceFile}
      >
        <LineStackLayout noMargin expand alignItems={itemsAlignment}>
          <ResourceThumbnail
            resourceName={resourceName}
            resourcesLoader={ResourcesLoader}
            project={project}
            resourceKind={resourceKind}
          />
          {resourcesSelector}
        </LineStackLayout>
      </div>
    );
  }
  return (
    <Line noMargin expand>
      {resourcesSelector}
    </Line>
  );
};

export default ResourceSelectorWithThumbnail;
