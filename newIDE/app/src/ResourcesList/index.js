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
import { type ItemSelectionEvent } from '../UI/SortableVirtualizedItemList/ItemRow';

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
  selectedResources: Array<gdResource>,
  onSelectResources: (resources: Array<gdResource>) => void,
  onDeleteResources: (resources: Array<gdResource>) => Promise<void>,
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
        selectedResources,
        onSelectResources,
        onDeleteResources,
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
      const sortableListRef = React.useRef<?SortableVirtualizedItemList<gdResource>>(
        null
      );
      const listContainerRef = React.useRef(null);
      const isNavigatingRef = React.useRef(false);
      // Names are used instead of gdResource instances because the list of
      // instances is re-created at each render.
      const selectionAnchorResourceNameRef = React.useRef<?string>(null);
      const focusedResourceNameRef = React.useRef<?string>(null);

      const resourcesManager = project.getResourcesManager();
      // Calculate on every render to avoid stale data after deletion/rename
      const allResourcesList = resourcesManager
        .getAllResourceNames()
        .toJSArray()
        .map(resourceName => resourcesManager.getResource(resourceName));
      const filteredList = filterResourcesList(allResourcesList, searchText);

      const isResourceSelected = React.useCallback(
        (resource: gdResource) => {
          const resourceName = resource.getName();
          return selectedResources.some(
            selectedResource => selectedResource.getName() === resourceName
          );
        },
        [selectedResources]
      );

      const getFilteredListIndex = React.useCallback(
        (resourceName: ?string) =>
          resourceName
            ? filteredList.findIndex(
                resource => resource.getName() === resourceName
              )
            : -1,
        [filteredList]
      );

      const selectRange = React.useCallback(
        (anchorIndex: number, targetIndex: number) => {
          onSelectResources(
            filteredList.slice(
              Math.min(anchorIndex, targetIndex),
              Math.max(anchorIndex, targetIndex) + 1
            )
          );
        },
        [filteredList, onSelectResources]
      );

      const onItemSelected = React.useCallback(
        (resource: ?gdResource, event?: ItemSelectionEvent) => {
          if (!resource) {
            selectionAnchorResourceNameRef.current = null;
            focusedResourceNameRef.current = null;
            onSelectResources([]);
            return;
          }
          const resourceName = resource.getName();
          focusedResourceNameRef.current = resourceName;

          if (event && event.shiftKey) {
            const anchorIndex = getFilteredListIndex(
              selectionAnchorResourceNameRef.current
            );
            const targetIndex = getFilteredListIndex(resourceName);
            if (anchorIndex !== -1 && targetIndex !== -1) {
              selectRange(anchorIndex, targetIndex);
              return;
            }
          }

          selectionAnchorResourceNameRef.current = resourceName;
          if (event && (event.ctrlKey || event.metaKey)) {
            onSelectResources(
              isResourceSelected(resource)
                ? selectedResources.filter(
                    selectedResource =>
                      selectedResource.getName() !== resourceName
                  )
                : [...selectedResources, resource]
            );
            return;
          }

          const isTheOnlySelectedResource =
            selectedResources.length === 1 && isResourceSelected(resource);
          onSelectResources(isTheOnlySelectedResource ? [] : [resource]);
        },
        [
          selectedResources,
          onSelectResources,
          isResourceSelected,
          getFilteredListIndex,
          selectRange,
        ]
      );

      const selectAll = React.useCallback(
        () => {
          onSelectResources(filteredList);
        },
        [filteredList, onSelectResources]
      );

      const deselectAll = React.useCallback(
        () => {
          onItemSelected(null);
        },
        [onItemSelected]
      );

      const deleteResource = React.useCallback(
        (resource: gdResource) => {
          // Delete the whole selection if the resource is part of it.
          onDeleteResources(
            isResourceSelected(resource) ? selectedResources : [resource]
          );
        },
        [onDeleteResources, isResourceSelected, selectedResources]
      );

      const deleteSelection = React.useCallback(
        () => {
          if (selectedResources.length) onDeleteResources(selectedResources);
        },
        [onDeleteResources, selectedResources]
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
        (delta: number, extendSelection: boolean) => {
          const resourceCount = filteredList.length;
          if (resourceCount === 0) return;

          const currentIndex = getFilteredListIndex(
            focusedResourceNameRef.current
          );
          // If the focused resource is not in the filtered list, select the first one.
          const nextIndex =
            currentIndex === -1
              ? 0
              : Math.max(0, Math.min(resourceCount - 1, currentIndex + delta));
          const nextResource = filteredList[nextIndex];
          focusedResourceNameRef.current = nextResource.getName();

          const anchorIndex = getFilteredListIndex(
            selectionAnchorResourceNameRef.current
          );
          if (extendSelection && anchorIndex !== -1) {
            selectRange(anchorIndex, nextIndex);
            return;
          }

          selectionAnchorResourceNameRef.current = nextResource.getName();
          onSelectResources([nextResource]);
        },
        [filteredList, onSelectResources, getFilteredListIndex, selectRange]
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
            moveSelector(event.key === 'ArrowDown' ? 1 : -1, event.shiftKey);

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
        [moveSelector, renamedResource]
      );

      const moveSelectionTo = React.useCallback(
        (destinationResource: gdResource) => {
          const destinationName = destinationResource.getName();
          const selectedNames = new Set(
            selectedResources
              .map(resource => resource.getName())
              .filter(name => name !== destinationName)
          );
          if (selectedNames.size === 0) return;

          const resourcesManager = project.getResourcesManager();
          const allNames = resourcesManager.getAllResourceNames().toJSArray();
          const destinationIndex = allNames.indexOf(destinationName);
          if (destinationIndex === -1) return;

          // Like a single resource move: the selection lands after the
          // destination when moved down, before it when moved up.
          const isMovingDown =
            allNames.findIndex(name => selectedNames.has(name)) <
            destinationIndex;
          const remainingNames = allNames.filter(
            name => !selectedNames.has(name)
          );
          const insertionIndex =
            remainingNames.indexOf(destinationName) + (isMovingDown ? 1 : 0);
          const newOrder = [
            ...remainingNames.slice(0, insertionIndex),
            ...allNames.filter(name => selectedNames.has(name)),
            ...remainingNames.slice(insertionIndex),
          ];
          newOrder.forEach((name, index) => {
            const position = resourcesManager.getResourcePosition(name);
            if (position !== index)
              resourcesManager.moveResource(position, index);
          });
          forceUpdateList();
        },
        [project, selectedResources, forceUpdateList]
      );

      const renderResourceMenuTemplate = React.useCallback(
        (i18n: I18nType) => (
          resource: gdResource,
          _index: number
        ): Array<MenuItemTemplate> => {
          const selectedResourcesCount =
            isResourceSelected(resource) && selectedResources.length > 1
              ? selectedResources.length
              : 1;
          if (selectedResourcesCount > 1) {
            // Other actions only apply to a single resource.
            return [
              {
                label: i18n._(t`Delete ${selectedResourcesCount} resources`),
                click: () => deleteResource(resource),
              },
            ];
          }

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
                cleanUserSelectionOfResources: () => onSelectResources([]),
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
          onSelectResources,
          forceUpdateList,
          isResourceSelected,
          selectedResources,
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
      // instead of here, because they depend on the selection which can change.
      // This ensures the callbacks always use the current selection.
      const keyboardShortcutsRef = React.useRef<KeyboardShortcuts>(
        new KeyboardShortcuts({
          shortcutCallbacks: {},
        })
      );

      React.useEffect(
        () => {
          const keyboardShortcuts = keyboardShortcutsRef.current;
          keyboardShortcuts.setShortcutCallback('onDelete', deleteSelection);
          keyboardShortcuts.setShortcutCallback('onRename', () => {
            if (selectedResources.length === 1) editName(selectedResources[0]);
          });
          keyboardShortcuts.setShortcutCallback('onSelectAll', selectAll);
          keyboardShortcuts.setShortcutCallback('onDeselectAll', deselectAll);
        },
        [selectedResources, deleteSelection, editName, selectAll, deselectAll]
      );

      // Scroll to the focused item when selection changes.
      React.useEffect(
        () => {
          const sortableList = sortableListRef.current;
          if (!sortableList) return;
          const focusedResource =
            filteredList[getFilteredListIndex(focusedResourceNameRef.current)];
          if (focusedResource) sortableList.scrollToItem(focusedResource);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedResources]
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
                      selectedItems={selectedResources}
                      onItemSelected={onItemSelected}
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
  // Prevent any update if project or selectedResources
  // are not changed. This is important to avoid
  // too many re-renders of the list.
  (prevProps, nextProps) =>
    prevProps.project === nextProps.project &&
    prevProps.selectedResources === nextProps.selectedResources
);

export default ResourcesList;
