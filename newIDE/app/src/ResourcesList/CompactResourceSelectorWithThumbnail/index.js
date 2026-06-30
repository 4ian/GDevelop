// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import { type I18n as I18nType } from '@lingui/core';
import {
  type ResourceManagementProps,
  type ResourceKind,
  type ResourceSource,
} from '../ResourceSource';
import ResourceThumbnail, {
  resourcesKindsWithThumbnail,
} from '../ResourceThumbnail';
import { LineStackLayout } from '../../UI/Layout';
import { type ResourceExternalEditor } from '../ResourceExternalEditor';
import IconButton from '../../UI/IconButton';
import Edit from '../../UI/CustomSvgIcons/Edit';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import { t } from '@lingui/macro';
import { ExternalEditorOpenedDialog } from '../../UI/ExternalEditorOpenedDialog';
import { applyResourceDefaults } from '../ResourceUtils';
import useResourcesChangedWatcher from '../UseResourcesChangedWatcher';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import useForceUpdate from '../../Utils/UseForceUpdate';
import classes from './CompactResourceSelectorWithThumbnail.module.css';
import classNames from 'classnames';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import { createProjectAssetResourceFromResourceName } from '../ProjectResources/ProjectAssetsFolderResources';

const styles = {
  icon: {
    fontSize: 18,
  },
};

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  resourceKind: ResourceKind,
  resourceName: string,
  defaultNewResourceName?: string,
  importedResourcesFolder?: string,
  includeProjectAssetsFolder?: boolean,
  defaultLocalFileDialogFolder?: string,
  resourceNameFilter?: (resourceName: string, resource: gdResource) => boolean,
  onChange: string => void,
  id?: string,
|};

export const CompactResourceSelectorWithThumbnail = ({
  project,
  resourceManagementProps,
  resourceKind,
  resourceName,
  defaultNewResourceName,
  importedResourcesFolder,
  includeProjectAssetsFolder,
  defaultLocalFileDialogFolder,
  resourceNameFilter,
  onChange,
  id,
}: Props): React.Node => {
  const resourcesLoader = ResourcesLoader;
  const forceUpdate = useForceUpdate();
  const displayThumbnail = resourcesKindsWithThumbnail.includes(resourceKind);
  const idToUse = React.useRef<string>(id || makeTimestampedId());

  const storageProvider = resourceManagementProps.getStorageProvider();
  const resourceSources = resourceManagementProps.resourceSources
    .filter(source => source.kind === resourceKind)
    .filter(
      ({ onlyForStorageProvider }) =>
        !onlyForStorageProvider ||
        onlyForStorageProvider === storageProvider.internalName
    );

  // TODO: move in a hook?
  const { showConfirmation } = useAlertDialog();
  const abortControllerRef = React.useRef<?AbortController>(null);
  const [
    externalEditorOpened,
    setExternalEditorOpened,
  ] = React.useState<boolean>(false);

  // Transfer responsibility of refreshing project resources to this hook.
  const { triggerResourcesHaveChanged } = useResourcesChangedWatcher({
    project,
    callback: () => {},
  });

  const hasMatchingResource = React.useCallback(
    (resourceNameToCheck: string): boolean => {
      const resourcesManager = project.getResourcesManager();
      if (!resourcesManager.hasResource(resourceNameToCheck)) return false;

      const resource = resourcesManager.getResource(resourceNameToCheck);
      return (
        resource.getKind() === resourceKind &&
        (!resourceNameFilter ||
          resourceNameFilter(resourceNameToCheck, resource))
      );
    },
    [project, resourceKind, resourceNameFilter]
  );

  const registerProjectAssetResourceName = React.useCallback(
    (resourceNameToRegister: string): boolean => {
      if (!includeProjectAssetsFolder || !resourceNameToRegister) {
        return false;
      }

      const resourcesManager = project.getResourcesManager();
      if (hasMatchingResource(resourceNameToRegister)) {
        return true;
      }

      const projectAssetResource = createProjectAssetResourceFromResourceName({
        project,
        resourceKind,
        resourceName: resourceNameToRegister,
      });
      if (!projectAssetResource) return false;
      if (
        resourceNameFilter &&
        !resourceNameFilter(resourceNameToRegister, projectAssetResource)
      ) {
        projectAssetResource.delete();
        return false;
      }

      applyResourceDefaults(project, projectAssetResource);
      const hasCreatedAnyResource = resourcesManager.addResource(
        projectAssetResource
      );
      projectAssetResource.delete();

      if (hasCreatedAnyResource) {
        resourceManagementProps.onNewResourcesAdded();
        triggerResourcesHaveChanged();
        forceUpdate();
      }

      return hasMatchingResource(resourceNameToRegister);
    },
    [
      hasMatchingResource,
      includeProjectAssetsFolder,
      project,
      resourceKind,
      resourceNameFilter,
      resourceManagementProps,
      triggerResourcesHaveChanged,
      forceUpdate,
    ]
  );

  React.useEffect(
    () => {
      if (resourceName) registerProjectAssetResourceName(resourceName);
    },
    [resourceName, registerProjectAssetResourceName]
  );

  const _onChange = React.useCallback(
    (value: string) => {
      if (value === resourceName) {
        return;
      }
      registerProjectAssetResourceName(value);
      onChange(value);
      if (resourceManagementProps.onResourceUsageChanged) {
        resourceManagementProps.onResourceUsageChanged();
      }
    },
    [
      resourceName,
      registerProjectAssetResourceName,
      onChange,
      resourceManagementProps,
    ]
  );

  // TODO: move in a hook?
  const addFrom = React.useCallback(
    async (initialResourceSource: ResourceSource) => {
      try {
        if (!initialResourceSource) return;

        const {
          selectedResources,
          selectedSourceName,
        } = await resourceManagementProps.onChooseResource({
          initialSourceName: initialResourceSource.name,
          multiSelection: false,
          resourceKind: resourceKind,
          importedResourcesFolder,
          includeProjectAssetsFolder,
          defaultLocalFileDialogFolder,
        });

        if (!selectedResources.length) return;
        const selectedResourceSource = resourceSources.find(
          source => source.name === selectedSourceName
        );
        if (!selectedResourceSource) return;

        const resource = selectedResources[0];

        const resourceName: string = resource.getName();
        if (
          resourceNameFilter &&
          !resourceNameFilter(resourceName, resource)
        ) {
          showErrorBox({
            message:
              'This resource cannot be used here. Choose a resource from the expected project folder.',
            errorId: 'resource-folder-mismatch',
          });
          return;
        }

        if (selectedResourceSource.shouldCreateResource) {
          applyResourceDefaults(project, resource);

          // addResource will check if a resource with the same name exists, and if it is
          // the case, no new resource will be added.
          const hasCreatedAnyResource = project
            .getResourcesManager()
            .addResource(resource);

          // Important, we are responsible for deleting the resources that were given to us.
          // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
          selectedResources.forEach(resource => resource.delete());

          if (hasCreatedAnyResource) {
            await resourceManagementProps.onFetchNewlyAddedResources();
            resourceManagementProps.onNewResourcesAdded();
          }
          triggerResourcesHaveChanged();
        }

        _onChange(resourceName);
      } catch (err) {
        // Should never happen, errors should be shown in the interface.
        console.error('Unable to choose a resource', err);
      }
    },
    [
      project,
      resourceManagementProps,
      resourceKind,
      importedResourcesFolder,
      includeProjectAssetsFolder,
      defaultLocalFileDialogFolder,
      resourceNameFilter,
      _onChange,
      triggerResourcesHaveChanged,
      resourceSources,
    ]
  );

  // TODO: move in a hook?
  const editWith = React.useCallback(
    async (i18n: I18nType, resourceExternalEditor: ResourceExternalEditor) => {
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;
      const resourcesManager = project.getResourcesManager();
      const initialResource =
        resourceName && resourcesManager.hasResource(resourceName)
          ? resourcesManager.getResource(resourceName)
          : null;

      try {
        setExternalEditorOpened(true);
        const editResult = await resourceExternalEditor.edit({
          project,
          i18n,
          getStorageProvider: resourceManagementProps.getStorageProvider,
          resourceManagementProps,
          resourceNames: [resourceName],
          extraOptions: {
            existingMetadata: initialResource
              ? initialResource.getMetadata()
              : '',

            // Only useful for images:
            singleFrame: true,
            fps: 0,
            name: resourceName || defaultNewResourceName,
            isLooping: false,
          },
          signal,
        });

        setExternalEditorOpened(false);
        if (!editResult) return;

        const { resources } = editResult;
        if (!resources.length) return;

        // Burst the ResourcesLoader cache to force the file to be reloaded (and not cached by the browser).
        resourcesLoader.burstUrlsCacheForResources(project, [
          resources[0].name,
        ]);

        _onChange(resources[0].name);
        triggerResourcesHaveChanged();
        forceUpdate();
      } catch (error) {
        if (error.name !== 'UserCancellationError') {
          console.error(
            'An exception was thrown when launching or reading resources from the external editor:',
            error
          );
          showErrorBox({
            message:
              'There was an error while using the external editor. Try with another resource and if this persists, please report this as a bug.',
            rawError: error,
            errorId: 'external-editor-error',
          });
        }
        setExternalEditorOpened(false);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      defaultNewResourceName,
      forceUpdate,
      _onChange,
      project,
      resourceManagementProps,
      resourceName,
      resourcesLoader,
      triggerResourcesHaveChanged,
    ]
  );

  // TODO: move in a hook?
  const cancelEditingWithExternalEditor = React.useCallback(
    async () => {
      const shouldContinue = await showConfirmation({
        title: t`Cancel editing`,
        message: t`You will lose any progress made with the external editor. Do you wish to cancel?`,
        confirmButtonLabel: t`Cancel edition`,
        dismissButtonLabel: t`Continue editing`,
      });
      if (!shouldContinue) return;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      } else {
        console.error(
          'Cannot cancel editing with external editor, abort controller is missing.'
        );
      }
    },
    [showConfirmation]
  );

  // TODO: move in a hook?
  const externalEditors = resourceManagementProps.resourceExternalEditors.filter(
    externalEditor => externalEditor.kind === resourceKind
  );

  const isResourceSetButInvalid =
    resourceName && !hasMatchingResource(resourceName);

  return (
    <LineStackLayout noMargin expand id={idToUse.current}>
      {displayThumbnail && (
        <ResourceThumbnail
          resourceName={resourceName}
          resourcesLoader={ResourcesLoader}
          project={project}
          resourceKind={resourceKind}
          size={24}
        />
      )}
      <div
        className={classNames({
          [classes.container]: true,
          [classes.disabled]: false,
          [classes.errored]: isResourceSetButInvalid,
        })}
      >
        <div
          className={classNames({
            [classes.compactResourceSelector]: true,
          })}
        >
          <input
            type="text"
            spellCheck={false}
            value={resourceName}
            onChange={e => _onChange(e.currentTarget.value)}
          />
        </div>
      </div>
      <ElementWithMenu
        element={
          <IconButton size="small">
            <Edit style={styles.icon} />
          </IconButton>
        }
        buildMenuTemplate={(i18n: I18nType) => [
          ...resourceSources.map(resourceSource => ({
            label: i18n._(resourceSource.displayName),
            click: () => addFrom(resourceSource),
          })),
          ...(externalEditors.length
            ? [
                {
                  type: 'separator',
                },
              ]
            : []),
          // $FlowFixMe[incompatible-type]
          ...externalEditors.map(externalEditor => ({
            label: resourceName
              ? i18n._(externalEditor.editDisplayName)
              : i18n._(externalEditor.createDisplayName),
            click: () => editWith(i18n, externalEditor),
          })),
        ]}
      />
      {externalEditorOpened && (
        <ExternalEditorOpenedDialog onClose={cancelEditingWithExternalEditor} />
      )}
    </LineStackLayout>
  );
};
