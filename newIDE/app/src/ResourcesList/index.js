// @flow
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
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
export const getDefaultResourceThumbnail = (resource: gdResource): string => {
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
    // $FlowFixMe[invalid-compare]
    case 'bitmapFont':
      return 'JsPlatform/Extensions/bitmapfont32.png';
    case 'model3D':
      return 'JsPlatform/Extensions/3d_model.svg';
    // $FlowFixMe[invalid-compare]
    case 'javascript':
      return 'res/javascript.svg';
    default:
      return 'res/unknown32.png';
  }
};

export type ResourcesListInterface = {|
  forceUpdateList: () => void,
  checkMissingPaths: () => void,
  focusList: () => void,
|};

type Props = {|
  project: gdProject,
  selectedResource: ?gdResource,
  onSelectResource: (resource: ?gdResource) => void,
  onDeleteResource: (resource: gdResource) => void,
  onRenameResource: (resource: gdResource, newName: string) => void,
  fileMetadata: ?FileMetadata,
  onRemoveUnusedResources: ResourceKind => void,
  onRemoveAllResourcesWithInvalidPath: () => void,
  getResourceActionsSpecificToStorageProvider?: ?ResourcesActionsMenuBuilder,
|};

const ResourcesList: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<ResourcesListInterface>,
  // $FlowFixMe[incompatible-type]
}> = React.memo<Props, ResourcesListInterface>(
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[incompatible-exact]
  React.forwardRef<Props, ResourcesListInterface>(
    (
      {
        project,
        selectedResource,
        onSelectResource,
        onDeleteResource,
        onRenameResource,
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
      const isNavigatingRef = React.useRef(false);

      const resourcesManager = project.getResourcesManager();
      // Calculate on every render to avoid stale data after deletion/rename
      const allResourcesList = resourcesManager
        .getAllResourceNames()
        .toJSArray()
        .map(resourceName => resourcesManager.getResource(resourceName));
      const filteredList = filterResourcesList(allResourcesList, searchText);

      const deleteResource = React.useCallback(
        (resource: gdResource) => {
          onDeleteResource(resource);
        },
        [onDeleteResource]
      );

      const editName = React.useCallback((resource: ?gdResource) => {
        // $FlowFixMe[incompatible-type]
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
          // Force grid to re-render with updated data
          if (sortableListRef.current)
            sortableListRef.current.forceUpdateGrid();
        },
        [forceUpdate]
      );

      const focusList = React.useCallback(() => {
        if (listContainerRef.current) {
          listContainerRef.current.focus();
        }
      }, []);

      const renameResource = React.useCallback(
        (resource: gdResource, newName: string) => {
          setRenamedResource(null);
          onRenameResource(resource, newName);
        },
        [onRenameResource]
      );

      const moveSelector = React.useCallback(
        (delta: number, filteredList: Array<gdResource>) => {
          const resourceCount = filteredList.length;

          if (resourceCount === 0) return;

          let nextIndex = 0;
          if (selectedResource) {
            const currentIndex = filteredList.indexOf(selectedResource);
            if (currentIndex === -1) {
              // Selected resource is not in filtered list, select the first one.
              nextIndex = 0;
            } else {
              nextIndex = Math.max(
                0,
                Math.min(resourceCount - 1, currentIndex + delta)
              );
            }
          }

          const nextResource = filteredList[nextIndex];
          onSelectResource(nextResource);
        },
        [selectedResource, onSelectResource]
      );

      const handleKeyDown = React.useCallback(
        (event: KeyboardEvent) => {
          // Check if we should handle arrow key navigation
          const isArrowKey =
            event.key === 'ArrowDown' || event.key === 'ArrowUp';

          // Always prevent default scroll behavior for arrow keys
          if (isArrowKey && !renamedResource) {
            event.preventDefault();
          }

          const shouldNavigate =
            isArrowKey && !renamedResource && !isNavigatingRef.current;

          if (shouldNavigate) {
            // Throttle navigation to allow list to scroll and render
            isNavigatingRef.current = true;
            moveSelector(event.key === 'ArrowDown' ? 1 : -1, filteredList);

            setTimeout(() => {
              isNavigatingRef.current = false;
            }, 5); // Throttle to avoid too many updates when holding down the key.
            return;
          }

          // Handle other keyboard shortcuts (skip if arrow key already handled)
          if (!isArrowKey || renamedResource) {
            keyboardShortcutsRef.current.onKeyDown(event);
          }
        },
        [moveSelector, filteredList, renamedResource]
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
                    // $FlowFixMe[incompatible-type]
                    onRemoveUnusedResources(kind);
                  },
                }))
                .concat([
                  {
                    label: i18n._(t`Resources (any kind)`),
                    click: () => {
                      allResourceKindsAndMetadata.forEach(
                        resourceKindAndMetadata => {
                          // $FlowFixMe[incompatible-type]
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
            // $FlowFixMe[incompatible-type]
            menu = menu.concat(
              getResourceActionsSpecificToStorageProvider({
                project,
                fileMetadata,
                resource,
                i18n,
                // $FlowFixMe[incompatible-type]
                informUser: setInfoBarContent,
                updateInterface: () => forceUpdateList(),
                cleanUserSelectionOfResources: () => onSelectResource(null),
              })
            );
          }
          // $FlowFixMe[incompatible-type]
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
            // $FlowFixMe[prop-missing]
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

      // Scroll to selected item when selection changes
      React.useEffect(
        () => {
          if (!selectedResource || !sortableListRef.current) return;

          if (sortableListRef.current.scrollToItem) {
            sortableListRef.current.scrollToItem(selectedResource);
          }
        },
        [selectedResource]
      );

      // Refocus list when rename ends (confirmed or canceled)
      const previousRenamedResource = React.useRef(renamedResource);
      React.useEffect(
        () => {
          if (previousRenamedResource.current && !renamedResource) {
            // Rename was ended (either confirmed or canceled)
            focusList();
          }
          previousRenamedResource.current = renamedResource;
        },
        [renamedResource, focusList]
      );

      React.useImperativeHandle(ref, () => ({
        forceUpdateList,
        checkMissingPaths,
        focusList,
      }));

      // Check missing paths on mount and when project changes.
      React.useEffect(
        () => {
          checkMissingPaths();
        },
        [checkMissingPaths]
      );

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
            // $FlowFixMe[incompatible-type]
            ref={listContainerRef}
            style={styles.listContainer}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onKeyUp={keyboardShortcutsRef.current.onKeyUp}
          >
            <AutoSizer>
              {({ height, width }) => (
                <I18n>
                  {({ i18n }) => (
                    <SortableVirtualizedItemList
                      key={listKey}
                      // $FlowFixMe[incompatible-type]
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
          {/* $FlowFixMe[constant-condition] */}
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
