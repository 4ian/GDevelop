// @flow
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { filterResourcesList } from './EnumerateResources';
import { getResourceFilePathStatus } from './ResourceUtils';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import {
  type ResourceKind,
  allResourceKindsAndMetadata,
} from './ResourceSource';
import { type FileMetadata } from '../ProjectsStorage';
import ResourcesLoader from '../ResourcesLoader';
import { Column, Line } from '../UI/Grid';
import { type ResourcesActionsMenuBuilder } from '../ProjectsStorage';
import InfoBar from '../UI/Messages/InfoBar';
import useForceUpdate from '../Utils/UseForceUpdate';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';

const styles = {
  listContainer: {
    flex: 1,
    outline: 'none',
  },
};

const getResourceName = (resource: gdResource) => resource.getName();
export const getDefaultResourceThumbnail = (resource: gdResource) => {
  switch (resource.getKind()) {
    case 'audio':
      return 'res/actions/music24.png';
    case 'json':
    case 'tilemap':
    case 'tileset':
    case 'spine':
      return 'res/actions/fichier24.png';
    case 'video':
      return 'JsPlatform/Extensions/videoicon24.png';
    case 'font':
      return 'res/actions/font24.png';
    case 'bitmapFont':
      return 'JsPlatform/Extensions/bitmapfont32.png';
    case 'model3D':
      return 'JsPlatform/Extensions/3d_model.svg';
    case 'javascript':
      return 'res/javascript.svg';
    default:
      return 'res/unknown32.png';
  }
};

export type ResourcesListInterface = {|
  forceUpdateList: () => void,
  checkMissingPaths: () => void,
  focus: () => void,
|};

type Props = {|
  project: gdProject,
  selectedResource: ?gdResource,
  onSelectResource: (resource: ?gdResource) => void,
  onDeleteResource: (resource: gdResource) => void,
  onRenameResource: (
    resource: gdResource,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onResourceRenamed?: () => void,
  fileMetadata: ?FileMetadata,
  onRemoveUnusedResources: ResourceKind => void,
  onRemoveAllResourcesWithInvalidPath: () => void,
  getResourceActionsSpecificToStorageProvider?: ?ResourcesActionsMenuBuilder,
|};

const ResourcesList = React.memo<Props, ResourcesListInterface>(
  React.forwardRef<Props, ResourcesListInterface>(
    (
      {
        project,
        selectedResource,
        onSelectResource,
        onDeleteResource,
        onRenameResource,
        onResourceRenamed,
        fileMetadata,
        onRemoveUnusedResources,
        getResourceActionsSpecificToStorageProvider,
      }: Props,
      ref
    ) => {
      const forceUpdate = useForceUpdate();
      const [renamedResource, setRenamedResource] = React.useState(null);
      const [searchText, setSearchText] = React.useState('');
      const [resourcesWithErrors, setResourcesWithErrors] = React.useState({});
      const [infoBarContent, setInfoBarContent] = React.useState(null);
      const sortableListRef = React.useRef(null);
      const listContainerRef = React.useRef(null);

      const deleteResource = React.useCallback(
        (resource: gdResource) => {
          onDeleteResource(resource);
        },
        [onDeleteResource]
      );

      const editName = React.useCallback((resource: ?gdResource) => {
        setRenamedResource(resource);
        if (sortableListRef.current) sortableListRef.current.forceUpdateGrid();
      }, []);

      const getResourceThumbnail = React.useCallback(
        (resource: gdResource) => {
          switch (resource.getKind()) {
            case 'image':
              return ResourcesLoader.getResourceFullUrl(
                project,
                resource.getName(),
                {}
              );
            default:
              return getDefaultResourceThumbnail(resource);
          }
        },
        [project]
      );

      const forceUpdateList = React.useCallback(
        () => {
          // Force re-render of component
          forceUpdate();
          if (sortableListRef.current)
            sortableListRef.current.forceUpdateGrid();
        },
        [forceUpdate]
      );

      const renameResource = React.useCallback(
        (resource: gdResource, newName: string) => {
          setRenamedResource(null);

          if (resource.getName() === newName || newName.length === 0) return;

          if (project.getResourcesManager().hasResource(newName)) {
            showWarningBox('Another resource with this name already exists', {
              delayToNextTick: true,
            });
            return;
          }

          onRenameResource(resource, newName, doRename => {
            if (!doRename) return;
            resource.setName(newName);
            // Force re-render
            forceUpdateList();
            if (onResourceRenamed) onResourceRenamed();
          });

          // Refocus the list container to allow keyboard shortcuts
          if (listContainerRef.current) listContainerRef.current.focus();
        },
        [project, onRenameResource, forceUpdateList, onResourceRenamed]
      );

      const moveSelection = React.useCallback(
        (delta: number) => {
          const resourcesManager = project.getResourcesManager();
          const resourceCount = resourcesManager.count();

          if (resourceCount === 0) return;

          let nextIndex = 0;
          if (selectedResource) {
            const currentIndex = resourcesManager.getResourcePosition(
              selectedResource.getName()
            );
            nextIndex = Math.max(
              0,
              Math.min(resourceCount - 1, currentIndex + delta)
            );
          }

          const nextResource = resourcesManager.getResourceAt(nextIndex);
          onSelectResource(nextResource);
        },
        [project, selectedResource, onSelectResource]
      );

      const handleKeyDown = React.useCallback(
        (event: KeyboardEvent) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            moveSelection(event.key === 'ArrowDown' ? 1 : -1);
            event.preventDefault();
          } else {
            keyboardShortcutsRef.current.onKeyDown(event);
          }
        },
        [moveSelection]
      );

      const moveSelectionTo = React.useCallback(
        (destinationResource: gdResource) => {
          if (!selectedResource) return;

          const resourcesManager = project.getResourcesManager();
          resourcesManager.moveResource(
            resourcesManager.getResourcePosition(selectedResource.getName()),
            resourcesManager.getResourcePosition(destinationResource.getName())
          );
          forceUpdateList();
        },
        [project, selectedResource, forceUpdateList]
      );

      const renderResourceMenuTemplate = React.useCallback(
        (i18n: I18nType) => (
          resource: gdResource,
          _index: number
        ): Array<MenuItemTemplate> => {
          let menu = [
            {
              label: i18n._(t`Rename`),
              click: () => editName(resource),
            },
            {
              label: i18n._(t`Delete`),
              click: () => deleteResource(resource),
            },
            { type: 'separator' },
            {
              label: i18n._(t`Remove unused...`),
              submenu: allResourceKindsAndMetadata
                .map(({ displayName, kind }) => ({
                  label: i18n._(displayName),
                  click: () => {
                    onRemoveUnusedResources(kind);
                  },
                }))
                .concat([
                  {
                    label: i18n._(t`Resources (any kind)`),
                    click: () => {
                      allResourceKindsAndMetadata.forEach(
                        resourceKindAndMetadata => {
                          onRemoveUnusedResources(resourceKindAndMetadata.kind);
                        }
                      );
                    },
                  },
                ]),
            },
          ];
          if (getResourceActionsSpecificToStorageProvider && fileMetadata) {
            menu.push({ type: 'separator' });
            menu = menu.concat(
              getResourceActionsSpecificToStorageProvider({
                project,
                fileMetadata,
                resource,
                i18n,
                informUser: setInfoBarContent,
                updateInterface: () => forceUpdateList(),
                cleanUserSelectionOfResources: () => onSelectResource(null),
              })
            );
          }
          return menu;
        },
        [
          project,
          fileMetadata,
          editName,
          deleteResource,
          onRemoveUnusedResources,
          getResourceActionsSpecificToStorageProvider,
          onSelectResource,
          forceUpdateList,
        ]
      );

      const checkMissingPaths = React.useCallback(
        () => {
          const resourcesManager = project.getResourcesManager();
          const resourceNames = resourcesManager
            .getAllResourceNames()
            .toJSArray();
          const newResourcesWithErrors = {};
          resourceNames.forEach(resourceName => {
            newResourcesWithErrors[resourceName] = getResourceFilePathStatus(
              project,
              resourceName
            );
          });
          setResourcesWithErrors(newResourcesWithErrors);
          forceUpdateList();
        },
        [project, forceUpdateList]
      );

      // KeyboardShortcuts callbacks are set dynamically in useEffect below
      // instead of here, because they depend on selectedResource which can change.
      // This ensures the callbacks always use the current selectedResource.
      const keyboardShortcutsRef = React.useRef<KeyboardShortcuts>(
        new KeyboardShortcuts({
          shortcutCallbacks: {},
        })
      );

      React.useEffect(
        () => {
          if (!keyboardShortcutsRef.current) return;
          if (!selectedResource) return;
          keyboardShortcutsRef.current.setShortcutCallback('onDelete', () => {
            deleteResource(selectedResource);
          });
          keyboardShortcutsRef.current.setShortcutCallback('onRename', () => {
            editName(selectedResource);
          });
        },
        [selectedResource, deleteResource, editName]
      );

      React.useImperativeHandle(ref, () => ({
        forceUpdateList,
        checkMissingPaths,
        focus: () => {
          if (listContainerRef.current) listContainerRef.current.focus();
        },
      }));

      // Check missing paths on mount and when project changes.
      React.useEffect(
        () => {
          checkMissingPaths();
        },
        [checkMissingPaths]
      );

      const resourcesManager = project.getResourcesManager();
      const allResourcesList = resourcesManager
        .getAllResourceNames()
        .toJSArray()
        .map(resourceName => resourcesManager.getResource(resourceName));
      const filteredList = filterResourcesList(allResourcesList, searchText);

      // Force List component to be mounted again if project
      // has been changed. Avoid accessing to invalid objects that could
      // crash the app.
      const listKey = project.ptr;

      return (
        <Background>
          <Line>
            <Column expand>
              <SearchBar
                value={searchText}
                onRequestSearch={() => {}}
                onChange={text => setSearchText(text)}
                placeholder={t`Search resources`}
              />
            </Column>
          </Line>
          <div
            ref={listContainerRef}
            style={styles.listContainer}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <AutoSizer>
              {({ height, width }) => (
                <I18n>
                  {({ i18n }) => (
                    <SortableVirtualizedItemList
                      key={listKey}
                      ref={sortableListRef}
                      fullList={filteredList}
                      width={width}
                      height={height}
                      getItemName={getResourceName}
                      getItemThumbnail={getResourceThumbnail}
                      selectedItems={selectedResource ? [selectedResource] : []}
                      onItemSelected={onSelectResource}
                      renamedItem={renamedResource}
                      onRename={renameResource}
                      onMoveSelectionToItem={moveSelectionTo}
                      buildMenuTemplate={renderResourceMenuTemplate(i18n)}
                      erroredItems={resourcesWithErrors}
                      reactDndType="GD_RESOURCE"
                    />
                  )}
                </I18n>
              )}
            </AutoSizer>
          </div>
          {!!infoBarContent && (
            <InfoBar
              duration={7000}
              visible
              hide={() => setInfoBarContent(null)}
              {...infoBarContent}
            />
          )}
        </Background>
      );
    }
  ),
  // Prevent any update if project or selectedResource
  // are not changed. This is important to avoid
  // too many re-renders of the list.
  (prevProps, nextProps) =>
    prevProps.project !== nextProps.project ||
    prevProps.selectedResource !== nextProps.selectedResource
);

export default ResourcesList;
