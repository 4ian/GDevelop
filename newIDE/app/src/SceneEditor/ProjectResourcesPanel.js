// @flow
import * as React from 'react';
import ResourcesList, {
  type ResourcesListInterface,
} from '../ResourcesList';
import Window from '../Utils/Window';
import { showWarningBox } from '../UI/Messages/MessageBox';
import {
  type ResourceManagementProps,
  type ResourceKind,
} from '../ResourcesList/ResourceSource';
import { getResourceFilePathStatus } from '../ResourcesList/ResourceUtils';
import { type FileMetadata } from '../ProjectsStorage';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  fileMetadata: ?FileMetadata,
  unsavedChanges?: ?UnsavedChanges,
|};

const ProjectResourcesPanel = ({
  project,
  resourceManagementProps,
  fileMetadata,
  unsavedChanges,
}: Props): React.Node => {
  const resourcesListRef = React.useRef<?ResourcesListInterface>(null);
  const [selectedResource, setSelectedResource] = React.useState<?gdResource>(
    null
  );

  const triggerUnsavedChanges = React.useCallback(
    () => {
      if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
    },
    [unsavedChanges]
  );

  const refreshResourcesList = React.useCallback(() => {
    if (resourcesListRef.current) resourcesListRef.current.forceUpdateList();
  }, []);

  const onDeleteResource = React.useCallback(
    (resource: gdResource) => {
      if (!resource) return;

      const answer = Window.showConfirmDialog(
        "Are you sure you want to remove this resource? This can't be undone."
      );
      if (!answer) return;

      const resourcesManager = project.getResourcesManager();
      const currentIndex = resourcesManager.getResourcePosition(
        resource.getName()
      );
      resourcesManager.removeResource(resource.getName());

      const newCount = resourcesManager.count();
      const nextResourceToSelect =
        newCount > 0
          ? resourcesManager.getResourceAt(
              Math.min(currentIndex, newCount - 1)
            )
          : null;

      setSelectedResource(nextResourceToSelect);
      triggerUnsavedChanges();
      resourceManagementProps.onResourceUsageChanged();
      refreshResourcesList();
    },
    [
      project,
      resourceManagementProps,
      refreshResourcesList,
      triggerUnsavedChanges,
    ]
  );

  const onRenameResource = React.useCallback(
    (resource: gdResource, newName: string) => {
      if (!resource) return;
      if (resource.getName() === newName || newName.length === 0) return;

      const resourcesManager = project.getResourcesManager();
      if (resourcesManager.hasResource(newName)) {
        showWarningBox('Another resource with this name already exists', {
          delayToNextTick: true,
        });
        return;
      }

      resource.setName(newName);
      triggerUnsavedChanges();
      resourceManagementProps.onResourceUsageChanged();
      refreshResourcesList();
    },
    [
      project,
      resourceManagementProps,
      refreshResourcesList,
      triggerUnsavedChanges,
    ]
  );

  const onRemoveUnusedResources = React.useCallback(
    (resourceKind: ResourceKind) => {
      const removedResourceNames = gd.ProjectResourcesAdder.getAllUseless(
        project,
        resourceKind
      ).toJSArray();

      gd.ProjectResourcesAdder.removeAllUseless(project, resourceKind);

      if (
        selectedResource &&
        removedResourceNames.includes(selectedResource.getName())
      ) {
        setSelectedResource(null);
      }

      triggerUnsavedChanges();
      resourceManagementProps.onResourceUsageChanged();
      refreshResourcesList();
    },
    [
      project,
      selectedResource,
      resourceManagementProps,
      refreshResourcesList,
      triggerUnsavedChanges,
    ]
  );

  const onRemoveAllResourcesWithInvalidPath = React.useCallback(
    () => {
      const resourcesManager = project.getResourcesManager();
      const removedResourceNames = resourcesManager
        .getAllResourceNames()
        .toJSArray()
        .filter(resourceName => {
          return getResourceFilePathStatus(project, resourceName) === 'error';
        });

      removedResourceNames.forEach(resourceName => {
        resourcesManager.removeResource(resourceName);
      });

      if (
        selectedResource &&
        removedResourceNames.includes(selectedResource.getName())
      ) {
        setSelectedResource(null);
      }

      triggerUnsavedChanges();
      resourceManagementProps.onResourceUsageChanged();
      refreshResourcesList();
    },
    [
      project,
      selectedResource,
      resourceManagementProps,
      refreshResourcesList,
      triggerUnsavedChanges,
    ]
  );

  return (
    <ResourcesList
      ref={resourcesListRef}
      project={project}
      selectedResource={selectedResource}
      onSelectResource={setSelectedResource}
      onDeleteResource={onDeleteResource}
      onRenameResource={onRenameResource}
      fileMetadata={fileMetadata}
      onRemoveUnusedResources={onRemoveUnusedResources}
      onRemoveAllResourcesWithInvalidPath={onRemoveAllResourcesWithInvalidPath}
      getResourceActionsSpecificToStorageProvider={
        fileMetadata
          ? resourceManagementProps.getStorageProviderResourceOperations()
          : null
      }
    />
  );
};

export default ProjectResourcesPanel;
