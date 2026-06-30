// @flow
import { t } from '@lingui/macro';

import {
  type Schema,
  type Field,
} from '../../PropertiesEditor/PropertiesEditorSchema';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor';
import { createNewResource } from '../../ResourcesList/ResourceSource';
import { createOrUpdateResource } from '../../ResourcesList/ResourceUtils';
import optionalRequire from '../../Utils/OptionalRequire';

const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const path = optionalRequire('path');

export const advancedTweenBehaviorType = 'AdvancedTween::AdvancedTween';
export const advancedTweenAnimationsFolder = 'assets/animations';

const normalizeSlashes = (value: string): string => value.replace(/\\/g, '/');

const isAdvancedTweenAnimationResource = (
  resourceName: string,
  resource: gdResource
): boolean => {
  const resourceFile = normalizeSlashes(resource.getFile() || resourceName);
  return (
    resourceFile === advancedTweenAnimationsFolder ||
    resourceFile.startsWith(advancedTweenAnimationsFolder + '/')
  );
};

const getProjectRootPath = (project: gdProject): ?string => {
  if (!path) return null;
  const projectFile = project.getProjectFile();
  if (!projectFile) return null;
  return path.dirname(projectFile);
};

const getInitialJsonFile = (
  project: gdProject,
  resourceName: ?string
): ?string => {
  if (!resourceName) return null;

  const resourcesManager = project.getResourcesManager();
  if (resourcesManager.hasResource(resourceName)) {
    const resource = resourcesManager.getResource(resourceName);
    if (!isAdvancedTweenAnimationResource(resourceName, resource)) return null;

    return normalizeSlashes(resource.getFile() || resourceName);
  }

  const normalizedResourceName = normalizeSlashes(resourceName);
  return normalizedResourceName === advancedTweenAnimationsFolder ||
    normalizedResourceName.startsWith(advancedTweenAnimationsFolder + '/')
    ? normalizedResourceName
    : null;
};

const advancedTweenResourceExternalEditors: Array<ResourceExternalEditor> = [
  {
    name: 'AdvancedTweenEditor',
    createDisplayName: t`Create with editor`,
    editDisplayName: t`Edit with editor`,
    kind: 'json',
    edit: async options => {
      if (!ipcRenderer) {
        throw new Error(
          'AdvancedTween Editor is only available in the desktop app.'
        );
      }

      const projectRootPath = getProjectRootPath(options.project);
      if (!projectRootPath) {
        throw new Error('Save the project before opening AdvancedTween Editor.');
      }

      const result = await ipcRenderer.invoke('advanced-tween-editor-load', {
        projectRootPath,
        waitForResult: true,
        initialJsonFile: getInitialJsonFile(
          options.project,
          options.resourceNames[0]
        ),
        gameResolutionWidth: options.project.getGameResolutionWidth(),
        gameResolutionHeight: options.project.getGameResolutionHeight(),
      });

      const savedJsonFile = result && result.savedJsonFile;
      if (!savedJsonFile || !savedJsonFile.relativePath) return null;

      const resource = createNewResource('json');
      if (!resource) {
        throw new Error('Unable to create a JSON resource.');
      }

      createOrUpdateResource(
        options.project,
        resource,
        savedJsonFile.relativePath
      );
      options.resourceManagementProps.onNewResourcesAdded();
      options.resourceManagementProps.onResourceUsageChanged();

      return {
        resources: [{ name: savedJsonFile.relativePath }],
        newName: savedJsonFile.relativePath,
        newMetadata: null,
      };
    },
  },
];

const customizeField = (field: Field): Field => {
  if (field.children) {
    field.children = field.children.map(customizeField);
    return field;
  }

  const fieldAsAny: any = field;
  if (fieldAsAny.valueType === 'resource' && fieldAsAny.name === 'InitialJson') {
    fieldAsAny.importedResourcesFolder = advancedTweenAnimationsFolder;
    fieldAsAny.includeProjectAssetsFolder = true;
    fieldAsAny.defaultLocalFileDialogFolder = advancedTweenAnimationsFolder;
    fieldAsAny.resourceNameFilter = isAdvancedTweenAnimationResource;
    fieldAsAny.resourceExternalEditors = advancedTweenResourceExternalEditors;
  }

  return field;
};

export const customizeAdvancedTweenBehaviorPropertiesSchema = (
  schema: Schema
): Schema => schema.map(customizeField);
