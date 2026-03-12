// @flow
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import { getResourceFilePathStatus, isURL } from './ResourceUtils';
import {
  ensureResourceGuidInMetadata,
  getResourceGuidFromResource,
} from './AssetDatabase';
import {
  createRandomId,
  loadAssetFoldersMetadata,
  sanitizeAssetFoldersMetadata,
  saveAssetFoldersMetadata,
  type AssetFoldersMetadata,
} from './AssetFoldersMetadata';
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
import optionalRequire from '../Utils/OptionalRequire';
import newNameGenerator from '../Utils/NewNameGenerator';
import CompactSelectField from '../UI/CompactSelectField';
import CompactToggleButtons from '../UI/CompactToggleButtons';
import TreeView, { type TreeViewInterface } from '../UI/TreeView';
import { BoxSearchResults } from '../UI/Search/BoxSearchResults';
import { ProjectResourceCard } from './ProjectResources/ProjectResourceCard';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import EmptyMessage from '../UI/EmptyMessage';
import Text from '../UI/Text';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import IconButton from '../UI/IconButton';
import AddFolderIcon from '../UI/CustomSvgIcons/AddFolder';
import ViewModule from '@material-ui/icons/ViewModule';
import ViewList from '@material-ui/icons/ViewList';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Breadcrumbs from '../UI/Breadcrumbs';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  listContainer: {
    flex: 1,
    outline: 'none',
  },
  toolbar: {
    padding: '6px 8px',
  },
  toolbarHeaderRow: {
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 600,
  },
  breadcrumbRow: {
    marginTop: 4,
  },
  breadcrumbCount: {
    marginLeft: 8,
  },
  treeContainer: {
    width: 240,
    minWidth: 200,
    maxWidth: 280,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  treeHeader: {
    padding: '6px 8px',
  },
  treeHeaderTitle: {
    fontSize: 12,
    fontWeight: 600,
  },
  treeList: {
    flex: 1,
    minHeight: 0,
  },
  folderCount: {
    marginRight: 8,
  },
};

const fs = optionalRequire('fs');
const path = optionalRequire('path');

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

type ResourceEntry = {|
  resource: gdResource,
  name: string,
  kind: ResourceKind,
  resourceGuid: ?string,
  folderId: ?string,
  size: ?number,
  mtime: ?number,
|};

type FolderTreeItem = {|
  id: string,
  name: string,
  children: Array<FolderTreeItem>,
  isRoot?: boolean,
|};

const ROOT_FOLDER_ID = 'resource-folder-root';

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
      const gdevelopTheme = React.useContext(GDevelopThemeContext);
      const { showConfirmation } = useAlertDialog();
      const forceUpdate = useForceUpdate();
      const [renamedResource, setRenamedResource] = React.useState(null);
      const [searchText, setSearchText] = React.useState('');
      const [resourcesWithErrors, setResourcesWithErrors] = React.useState({});
      const [infoBarContent, setInfoBarContent] = React.useState(null);
      const sortableListRef = React.useRef(null);
      const listContainerRef = React.useRef(null);
      const isNavigatingRef = React.useRef(false);
      const folderTreeRef = React.useRef<?TreeViewInterface<FolderTreeItem>>(
        null
      );
      const [selectedFolderId, setSelectedFolderId] = React.useState(
        ROOT_FOLDER_ID
      );
      const [
        assetFoldersMetadata,
        setAssetFoldersMetadata,
      ] = React.useState<AssetFoldersMetadata>(() =>
        loadAssetFoldersMetadata(project)
      );
      const [pendingFolderRenameId, setPendingFolderRenameId] = React.useState<?string>(
        null
      );
      const [resourceKindFilter, setResourceKindFilter] = React.useState('all');
      const [sortKey, setSortKey] = React.useState('order');
      const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
      const [viewMode, setViewMode] = React.useState<'grid' | 'details'>(
        'grid'
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

      const resourcesManager = project.getResourcesManager();
      const resourceNames = resourcesManager.getAllResourceNames().toJSArray();
      // Calculate on every render to avoid stale data after deletion/rename
      const allResourcesList = resourceNames.map(resourceName =>
        resourcesManager.getResource(resourceName)
      );
      const projectFilePath = project.getProjectFile();
      const projectFolderPath =
        projectFilePath && path ? path.dirname(projectFilePath) : null;

      React.useEffect(
        () => {
          setAssetFoldersMetadata(loadAssetFoldersMetadata(project));
          setSelectedFolderId(ROOT_FOLDER_ID);
        },
        [project]
      );

      React.useEffect(
        () => {
          let didUpdate = false;
          allResourcesList.forEach(resource => {
            if (!getResourceGuidFromResource(resource)) {
              ensureResourceGuidInMetadata(resource);
              didUpdate = true;
            }
          });
          if (didUpdate) forceUpdateList();
        },
        [allResourcesList, forceUpdateList]
      );

      const {
        resourceGuidByName,
        resourceGuids,
      }: {|
        resourceGuidByName: Map<string, string>,
        resourceGuids: Array<string>,
      |} = React.useMemo(
        () => {
          const map = new Map();
          const list = [];
          allResourcesList.forEach(resource => {
            const guid = getResourceGuidFromResource(resource);
            if (!guid) return;
            map.set(resource.getName(), guid);
            list.push(guid);
          });
          return { resourceGuidByName: map, resourceGuids: list };
        },
        [allResourcesList]
      );

      React.useEffect(
        () => {
          const guidSet = new Set(resourceGuids);
          setAssetFoldersMetadata(previous => {
            const sanitized = sanitizeAssetFoldersMetadata(
              previous,
              guidSet
            );
            if (
              JSON.stringify(previous) === JSON.stringify(sanitized)
            ) {
              return previous;
            }
            return sanitized;
          });
        },
        [resourceGuids]
      );

      React.useEffect(
        () => {
          saveAssetFoldersMetadata(project, assetFoldersMetadata);
        },
        [project, assetFoldersMetadata]
      );

      const resourceFolderIdByGuid = React.useMemo(() => {
        const map = new Map();
        assetFoldersMetadata.folders.forEach(folder => {
          folder.resourceGuids.forEach(resourceGuid => {
            if (!map.has(resourceGuid)) {
              map.set(resourceGuid, folder.id);
            }
          });
        });
        return map;
      }, [assetFoldersMetadata]);

      const resourceEntries: Array<ResourceEntry> = React.useMemo(
        () =>
          allResourcesList.map(resource => {
            const name = resource.getName();
            // $FlowFixMe[incompatible-type]
            const kind: ResourceKind = resource.getKind();
            const filePath = resource.getFile();
            const resourceGuid = resourceGuidByName.get(name) || null;
            const folderId =
              resourceGuid && resourceFolderIdByGuid.has(resourceGuid)
                ? resourceFolderIdByGuid.get(resourceGuid)
                : null;
            let size = null;
            let mtime = null;

            if (filePath && !isURL(filePath) && projectFolderPath && path) {
              const normalizedPath = filePath.replace(/^file:\/\//, '');
              const absolutePath = path.isAbsolute(normalizedPath)
                ? normalizedPath
                : path.resolve(projectFolderPath, normalizedPath);

              if (
                fs &&
                fs.existsSync &&
                fs.statSync &&
                fs.existsSync(absolutePath)
              ) {
                try {
                  const stats = fs.statSync(absolutePath);
                  size = stats.size;
                  // $FlowFixMe[prop-missing]
                  mtime = stats.mtimeMs || stats.mtime.getTime();
                } catch (error) {
                  size = null;
                  mtime = null;
                }
              }
            }

            return {
              resource,
              name,
              kind,
              resourceGuid,
              folderId,
              size,
              mtime,
            };
          }),
        [
          allResourcesList,
          projectFolderPath,
          resourceGuidByName,
          resourceFolderIdByGuid,
        ]
      );

      const {
        folderTreeRoot,
        folderIdToItem,
        folderDescendantsById,
        folderPathsForMenu,
        folderParentById,
        foldersById,
      } = React.useMemo(() => {
        const foldersById = new Map();
        assetFoldersMetadata.folders.forEach(folder => {
          foldersById.set(folder.id, folder);
        });

        const folderParentById = new Map();
        assetFoldersMetadata.folders.forEach(folder => {
          folder.childFolderIds.forEach(childId => {
            if (foldersById.has(childId) && !folderParentById.has(childId)) {
              folderParentById.set(childId, folder.id);
            }
          });
        });

        const buildTreeItem = (
          folderId: string,
          visited: Set<string>
        ): ?FolderTreeItem => {
          if (visited.has(folderId)) return null;
          const folder = foldersById.get(folderId);
          if (!folder) return null;
          visited.add(folderId);
          const children = folder.childFolderIds
            .filter(childId => foldersById.has(childId))
            .map(childId => buildTreeItem(childId, visited))
            .filter(Boolean);
          visited.delete(folderId);
          return {
            id: folder.id,
            name: folder.name,
            children,
          };
        };

        const root: FolderTreeItem = {
          id: ROOT_FOLDER_ID,
          name: 'Assets',
          children: [],
          isRoot: true,
        };

        root.children = assetFoldersMetadata.rootFolderIds
          .filter(folderId => foldersById.has(folderId))
          .map(folderId => buildTreeItem(folderId, new Set()))
          .filter(Boolean);

        const folderIdToItem = new Map();
        const registerItem = (item: FolderTreeItem) => {
          folderIdToItem.set(item.id, item);
          item.children.forEach(child => registerItem(child));
        };
        registerItem(root);

        const folderPathsForMenu = [];
        const collectPaths = (
          folderId: string,
          parentPath: string,
          visited: Set<string>
        ) => {
          if (visited.has(folderId)) return;
          const folder = foldersById.get(folderId);
          if (!folder) return;
          visited.add(folderId);
          const path = parentPath ? `${parentPath}/${folder.name}` : folder.name;
          folderPathsForMenu.push({ id: folder.id, path });
          folder.childFolderIds.forEach(childId =>
            collectPaths(childId, path, visited)
          );
          visited.delete(folderId);
        };

        assetFoldersMetadata.rootFolderIds.forEach(folderId =>
          collectPaths(folderId, '', new Set())
        );
        folderPathsForMenu.sort((a, b) => a.path.localeCompare(b.path));

        const descendantCache: Map<string, Set<string>> = new Map();
        const collectDescendants = (
          folderId: string,
          visiting: Set<string>
        ): Set<string> => {
          if (descendantCache.has(folderId)) {
            // $FlowFixMe[incompatible-return] - Map guarantees Set<string>.
            return descendantCache.get(folderId);
          }
          if (visiting.has(folderId)) {
            const cycleSet = new Set([folderId]);
            descendantCache.set(folderId, cycleSet);
            return cycleSet;
          }
          visiting.add(folderId);
          const folder = foldersById.get(folderId);
          const collected = new Set([folderId]);
          if (folder) {
            folder.childFolderIds.forEach(childId => {
              if (!foldersById.has(childId)) return;
              const childDescendants = collectDescendants(childId, visiting);
              childDescendants.forEach(id => collected.add(id));
            });
          }
          visiting.delete(folderId);
          descendantCache.set(folderId, collected);
          return collected;
        };

        const folderDescendantsById = new Map();
        assetFoldersMetadata.folders.forEach(folder => {
          folderDescendantsById.set(
            folder.id,
            collectDescendants(folder.id, new Set())
          );
        });

        return {
          folderTreeRoot: root,
          folderIdToItem,
          folderDescendantsById,
          folderPathsForMenu,
          folderParentById,
          foldersById,
        };
      }, [assetFoldersMetadata]);

      const selectedFolderPathIds = React.useMemo(
        () => {
          const path = [];
          let currentId = selectedFolderId;
          while (currentId && currentId !== ROOT_FOLDER_ID) {
            path.unshift(currentId);
            currentId = folderParentById.get(currentId);
          }
          return [ROOT_FOLDER_ID, ...path];
        },
        [selectedFolderId, folderParentById]
      );

      const folderResourceCountById = React.useMemo(() => {
        const directCounts = new Map();
        assetFoldersMetadata.folders.forEach(folder => {
          directCounts.set(folder.id, folder.resourceGuids.length);
        });

        const totalCounts = new Map();
        assetFoldersMetadata.folders.forEach(folder => {
          const descendants =
            folderDescendantsById.get(folder.id) || new Set([folder.id]);
          let total = 0;
          descendants.forEach(descendantId => {
            total += directCounts.get(descendantId) || 0;
          });
          totalCounts.set(folder.id, total);
        });
        return totalCounts;
      }, [assetFoldersMetadata, folderDescendantsById]);

      React.useEffect(
        () => {
          if (!folderIdToItem.has(selectedFolderId)) {
            setSelectedFolderId(ROOT_FOLDER_ID);
          }
        },
        [folderIdToItem, selectedFolderId]
      );

      const selectedFolderDescendants =
        selectedFolderId === ROOT_FOLDER_ID
          ? null
          : folderDescendantsById.get(selectedFolderId);

      const filteredEntries = React.useMemo(
        () => {
          const searchLower = searchText.toLowerCase();
          return resourceEntries.filter(entry => {
            const matchesSearch =
              !searchText ||
              entry.name.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;

            const matchesKind =
              resourceKindFilter === 'all' || entry.kind === resourceKindFilter;
            if (!matchesKind) return false;

            if (selectedFolderId === ROOT_FOLDER_ID) return true;
            if (!selectedFolderDescendants || !entry.folderId) return false;
            return selectedFolderDescendants.has(entry.folderId);
          });
        },
        [
          resourceEntries,
          searchText,
          resourceKindFilter,
          selectedFolderId,
          selectedFolderDescendants,
        ]
      );

      const sortedEntries = React.useMemo(
        () => {
          const entries = [...filteredEntries];
          if (sortKey !== 'order') {
            entries.sort((a, b) => {
              let compare = 0;
              if (sortKey === 'name') {
                compare = a.name.localeCompare(b.name);
              } else if (sortKey === 'date') {
                if (a.mtime == null && b.mtime == null) compare = 0;
                else if (a.mtime == null) compare = 1;
                else if (b.mtime == null) compare = -1;
                else compare = a.mtime - b.mtime;
              } else if (sortKey === 'size') {
                if (a.size == null && b.size == null) compare = 0;
                else if (a.size == null) compare = 1;
                else if (b.size == null) compare = -1;
                else compare = a.size - b.size;
              }
              return sortOrder === 'desc' ? -compare : compare;
            });
          }
          return entries;
        },
        [filteredEntries, sortKey, sortOrder]
      );

      const filteredList = sortedEntries.map(entry => entry.resource);
      const totalResourcesCount = resourceEntries.length;

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

      const editFolderName = React.useCallback((folderId: string) => {
        const treeView = folderTreeRef.current;
        if (!treeView) return;
        treeView.renameItemFromId(folderId);
      }, []);

      const addFolder = React.useCallback(
        (parentFolderId: ?string, defaultName: string) => {
          const newFolderId = createRandomId('asset-folder');
          setAssetFoldersMetadata(previous => {
            const existingNames = previous.folders.map(folder => folder.name);
            const uniqueName = newNameGenerator(
              defaultName,
              candidateName => existingNames.includes(candidateName)
            );

            const newFolder = {
              id: newFolderId,
              name: uniqueName,
              childFolderIds: [],
              resourceGuids: [],
            };

            const nextFolders = [...previous.folders, newFolder];
            let nextRootFolderIds = previous.rootFolderIds;
            if (
              parentFolderId &&
              previous.folders.some(folder => folder.id === parentFolderId)
            ) {
              return {
                ...previous,
                folders: nextFolders.map(folder =>
                  folder.id === parentFolderId
                    ? {
                        ...folder,
                        childFolderIds: [
                          ...folder.childFolderIds,
                          newFolderId,
                        ],
                      }
                    : folder
                ),
              };
            }
            nextRootFolderIds = [...previous.rootFolderIds, newFolderId];
            return {
              ...previous,
              rootFolderIds: nextRootFolderIds,
              folders: nextFolders,
            };
          });
          setSelectedFolderId(newFolderId);
          setPendingFolderRenameId(newFolderId);
        },
        []
      );

      const renameFolder = React.useCallback((folderId: string, newName: string) => {
        setAssetFoldersMetadata(previous => ({
          ...previous,
          folders: previous.folders.map(folder =>
            folder.id === folderId ? { ...folder, name: newName } : folder
          ),
        }));
      }, []);

      const getDestinationParentId = React.useCallback(
        (destinationId: string, where: 'before' | 'inside' | 'after') => {
          if (destinationId === ROOT_FOLDER_ID) return null;
          if (where === 'inside') return destinationId;
          return folderParentById.get(destinationId) || null;
        },
        [folderParentById]
      );

      const moveFolderToDestination = React.useCallback(
        (
          sourceFolderId: string,
          destinationId: string,
          where: 'before' | 'inside' | 'after'
        ) => {
          if (!sourceFolderId || sourceFolderId === ROOT_FOLDER_ID) return;
          if (sourceFolderId === destinationId) return;

          const destinationParentId = getDestinationParentId(destinationId, where);
          if (destinationParentId === sourceFolderId) return;

          const sourceDescendants = folderDescendantsById.get(sourceFolderId);
          if (
            destinationParentId &&
            sourceDescendants &&
            sourceDescendants.has(destinationParentId)
          ) {
            return;
          }

          setAssetFoldersMetadata(previous => {
            const insertIntoList = (
              list: Array<string>,
              insertId: string,
              index?: ?number
            ) => {
              const filtered = list.filter(id => id !== insertId);
              if (typeof index !== 'number' || index < 0) {
                return [...filtered, insertId];
              }
              const clampedIndex = Math.min(index, filtered.length);
              return [
                ...filtered.slice(0, clampedIndex),
                insertId,
                ...filtered.slice(clampedIndex),
              ];
            };

            const withoutSource = previous.folders.map(folder => ({
              ...folder,
              childFolderIds: folder.childFolderIds.filter(
                id => id !== sourceFolderId
              ),
            }));

            let nextRootFolderIds = previous.rootFolderIds.filter(
              id => id !== sourceFolderId
            );

            if (destinationParentId) {
              const destinationFolder = withoutSource.find(
                folder => folder.id === destinationParentId
              );
              const destinationList = destinationFolder
                ? destinationFolder.childFolderIds
                : [];

              const destinationIndex =
                where === 'inside'
                  ? null
                  : destinationList.indexOf(destinationId);
              const insertIndex =
                destinationIndex === -1 || destinationIndex === null
                  ? null
                  : where === 'before'
                  ? destinationIndex
                  : destinationIndex + 1;

              return {
                ...previous,
                rootFolderIds: nextRootFolderIds,
                folders: withoutSource.map(folder =>
                  folder.id === destinationParentId
                    ? {
                        ...folder,
                        childFolderIds: insertIntoList(
                          destinationList,
                          sourceFolderId,
                          insertIndex
                        ),
                      }
                    : folder
                ),
              };
            }

            const rootDestinationIndex =
              where === 'inside'
                ? null
                : nextRootFolderIds.indexOf(destinationId);
            const rootInsertIndex =
              rootDestinationIndex === -1 || rootDestinationIndex === null
                ? null
                : where === 'before'
                ? rootDestinationIndex
                : rootDestinationIndex + 1;

            nextRootFolderIds = insertIntoList(
              nextRootFolderIds,
              sourceFolderId,
              rootInsertIndex
            );

            return {
              ...previous,
              rootFolderIds: nextRootFolderIds,
              folders: withoutSource,
            };
          });
        },
        [folderDescendantsById, getDestinationParentId]
      );

      const deleteFolder = React.useCallback(
        async (folderId: string) => {
          const folder = foldersById.get(folderId);
          if (!folder) return;
          const hasContent =
            folder.childFolderIds.length > 0 || folder.resourceGuids.length > 0;
          if (hasContent) {
            const shouldDelete = await showConfirmation({
              title: t`Delete folder?`,
              message: t`This folder is not empty. Its contents will be moved to the parent folder (or root if none).`,
              confirmButtonLabel: t`Delete`,
            });
            if (!shouldDelete) return;
          }

          const parentId = folderParentById.get(folderId) || null;
          setAssetFoldersMetadata(previous => {
            const nextFolders = previous.folders
              .filter(current => current.id !== folderId)
              .map(current => {
                if (current.id === parentId) {
                  const nextChildFolderIds = [
                    ...current.childFolderIds.filter(id => id !== folderId),
                    ...folder.childFolderIds.filter(
                      childId => !current.childFolderIds.includes(childId)
                    ),
                  ];
                  const nextResourceGuids = [
                    ...current.resourceGuids,
                    ...folder.resourceGuids.filter(
                      resourceGuid => !current.resourceGuids.includes(resourceGuid)
                    ),
                  ];
                  return {
                    ...current,
                    childFolderIds: nextChildFolderIds,
                    resourceGuids: nextResourceGuids,
                  };
                }

                return {
                  ...current,
                  childFolderIds: current.childFolderIds.filter(
                    id => id !== folderId
                  ),
                };
              });

            let nextRootFolderIds = previous.rootFolderIds.filter(
              id => id !== folderId
            );

            if (!parentId) {
              const rootChildIds = folder.childFolderIds.filter(
                childId => !nextRootFolderIds.includes(childId)
              );
              nextRootFolderIds = [...nextRootFolderIds, ...rootChildIds];
            }

            return {
              ...previous,
              rootFolderIds: nextRootFolderIds,
              folders: nextFolders,
            };
          });
        },
        [foldersById, folderParentById, showConfirmation]
      );

      const moveResourceToFolder = React.useCallback(
        (resource: gdResource, destinationFolderId: ?string) => {
          const guid =
            getResourceGuidFromResource(resource) ||
            ensureResourceGuidInMetadata(resource);
          if (!guid) return;
          const targetFolderId =
            destinationFolderId && foldersById.has(destinationFolderId)
              ? destinationFolderId
              : null;

          setAssetFoldersMetadata(previous => {
            let didChange = false;
            const nextFolders = previous.folders.map(folder => {
              const isTarget = targetFolderId && folder.id === targetFolderId;
              const hasGuid = folder.resourceGuids.includes(guid);
              if (hasGuid && !isTarget) {
                didChange = true;
                return {
                  ...folder,
                  resourceGuids: folder.resourceGuids.filter(
                    resourceGuid => resourceGuid !== guid
                  ),
                };
              }
              if (!hasGuid && isTarget) {
                didChange = true;
                return {
                  ...folder,
                  resourceGuids: [...folder.resourceGuids, guid],
                };
              }
              return folder;
            });

            if (!didChange) return previous;
            return {
              ...previous,
              folders: nextFolders,
            };
          });
        },
        [foldersById]
      );

      React.useEffect(
        () => {
          if (!pendingFolderRenameId) return;
          const treeView = folderTreeRef.current;
          if (!treeView) return;

          const ancestors = [];
          let currentId = folderParentById.get(pendingFolderRenameId);
          while (currentId) {
            ancestors.unshift(currentId);
            currentId = folderParentById.get(currentId);
          }
          if (ancestors.length > 0) {
            treeView.openItems(ancestors);
          }

          treeView.scrollToItemFromId(pendingFolderRenameId, 'start');
          treeView.renameItemFromId(pendingFolderRenameId);
          setPendingFolderRenameId(null);
        },
        [pendingFolderRenameId, folderParentById]
      );

      const buildFolderMenuTemplate = React.useCallback(
        (i18n: I18nType, item: FolderTreeItem): Array<MenuItemTemplate> => {
          if (item.id === ROOT_FOLDER_ID) {
            return [
              {
                label: i18n._(t`New folder`),
                click: () => addFolder(null, i18n._(t`New folder`)),
              },
            ];
          }
          return [
            {
              label: i18n._(t`Add subfolder`),
              click: () => addFolder(item.id, i18n._(t`New folder`)),
            },
            { type: 'separator' },
            {
              label: i18n._(t`Rename`),
              click: () => editFolderName(item.id),
              accelerator: 'F2',
            },
            {
              label: i18n._(t`Delete`),
              click: () => deleteFolder(item.id),
              accelerator: 'Backspace',
            },
          ];
        },
        [addFolder, deleteFolder, editFolderName]
      );

      const renderFolderRightComponent = React.useCallback(
        (item: FolderTreeItem) => {
          if (item.id === ROOT_FOLDER_ID) return null;
          const count = folderResourceCountById.get(item.id) || 0;
          return (
            <Text
              size="body-small"
              color="secondary"
              noMargin
              displayInlineAsSpan
              style={styles.folderCount}
            >
              {count}
            </Text>
          );
        },
        [folderResourceCountById]
      );

      const onRenameFolderItem = React.useCallback(
        (item: FolderTreeItem, newName: string) => {
          if (item.id === ROOT_FOLDER_ID) return;
          renameFolder(item.id, newName);
        },
        [renameFolder]
      );

      const onEditFolderItem = React.useCallback(
        (item: FolderTreeItem) => {
          if (item.id === ROOT_FOLDER_ID) return;
          editFolderName(item.id);
        },
        [editFolderName]
      );

      const canMoveSelectionToFolder = React.useCallback(
        (
          destinationItem: FolderTreeItem,
          where: 'before' | 'inside' | 'after',
          draggedItem?: {|
            name?: string,
            treeItemId?: string,
          |}
        ) => {
          if (destinationItem.id === ROOT_FOLDER_ID && where !== 'inside')
            return false;

          const draggedResourceName = draggedItem && draggedItem.name;
          if (draggedResourceName) return true;

          const draggedFolderId =
            (draggedItem && draggedItem.treeItemId) || selectedFolderId;
          if (!draggedFolderId || draggedFolderId === ROOT_FOLDER_ID)
            return false;
          if (draggedFolderId === destinationItem.id) return false;

          const destinationParentId = getDestinationParentId(
            destinationItem.id,
            where
          );
          if (destinationParentId === draggedFolderId) return false;

          const descendants = folderDescendantsById.get(draggedFolderId);
          if (
            destinationParentId &&
            descendants &&
            descendants.has(destinationParentId)
          )
            return false;
          return true;
        },
        [
          folderDescendantsById,
          getDestinationParentId,
          selectedFolderId,
        ]
      );

      const onMoveSelectionToFolder = React.useCallback(
        (
          destinationItem: FolderTreeItem,
          where: 'before' | 'inside' | 'after',
          draggedItem?: {|
            name?: string,
            treeItemId?: string,
          |}
        ) => {
          const draggedResourceName = draggedItem && draggedItem.name;
          if (draggedResourceName) {
            if (!resourcesManager.hasResource(draggedResourceName)) return;
            const resource = resourcesManager.getResource(draggedResourceName);
            const destinationFolderId =
              destinationItem.id === ROOT_FOLDER_ID
                ? null
                : destinationItem.id;
            moveResourceToFolder(resource, destinationFolderId);
            return;
          }

          const draggedFolderId =
            (draggedItem && draggedItem.treeItemId) || selectedFolderId;
          if (!draggedFolderId) return;
          moveFolderToDestination(draggedFolderId, destinationItem.id, where);
        },
        [moveFolderToDestination, moveResourceToFolder, resourcesManager, selectedFolderId]
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
          const resourceGuid = resourceGuidByName.get(resource.getName()) || null;
          const currentFolderId =
            resourceGuid && resourceFolderIdByGuid.has(resourceGuid)
              ? resourceFolderIdByGuid.get(resourceGuid)
              : null;
          const moveToFolderSubmenu: Array<MenuItemTemplate> = [
            {
              type: 'checkbox',
              label: i18n._(t`No folder`),
              checked: !currentFolderId,
              click: () => moveResourceToFolder(resource, null),
            },
          ];

          if (folderPathsForMenu.length) {
            moveToFolderSubmenu.push({ type: 'separator' });
            folderPathsForMenu.forEach(folderPath => {
              moveToFolderSubmenu.push({
                type: 'checkbox',
                label: folderPath.path,
                checked: currentFolderId === folderPath.id,
                click: () => moveResourceToFolder(resource, folderPath.id),
              });
            });
          } else {
            moveToFolderSubmenu.push({
              label: i18n._(t`No folders yet`),
              enabled: false,
            });
          }

          let menu = [
            {
              label: i18n._(t`Rename`),
              click: () => editName(resource),
            },
            {
              label: i18n._(t`Move to folder`),
              submenu: moveToFolderSubmenu,
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
          resourceGuidByName,
          resourceFolderIdByGuid,
          folderPathsForMenu,
          moveResourceToFolder,
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
          <div style={styles.container}>
            <div
              style={{
                ...styles.toolbar,
                borderBottom: `1px solid ${gdevelopTheme.listItem.separatorColor}`,
              }}
            >
              <I18n>
                {({ i18n }) => (
                  <Line
                    noMargin
                    alignItems="center"
                    justifyContent="space-between"
                    style={styles.toolbarHeaderRow}
                  >
                    <Text noMargin style={styles.headerTitle}>
                      {i18n._(t`Resources`)}
                    </Text>
                    <Text size="body-small" color="secondary" noMargin>
                      {i18n._(t`Total`)}: {totalResourcesCount}
                    </Text>
                  </Line>
                )}
              </I18n>
              <Line noMargin alignItems="center">
                <Column expand>
                  <SearchBar
                    value={searchText}
                    onRequestSearch={() => {}}
                    onChange={text => setSearchText(text)}
                    placeholder={t`Search resources`}
                  />
                </Column>
                <Column noMargin>
                  <I18n>
                    {({ i18n }) => (
                      <CompactSelectField
                        value={resourceKindFilter}
                        onChange={value => setResourceKindFilter(value)}
                        leftIconTooltip={i18n._(t`Filter`)}
                      >
                        <option value="all">{i18n._(t`All types`)}</option>
                        {allResourceKindsAndMetadata.map(
                          ({ kind, displayName }) => (
                            <option key={kind} value={kind}>
                              {i18n._(displayName)}
                            </option>
                          )
                        )}
                      </CompactSelectField>
                    )}
                  </I18n>
                </Column>
                <Column noMargin>
                  <I18n>
                    {({ i18n }) => (
                      <CompactSelectField
                        value={sortKey}
                        onChange={value => setSortKey(value)}
                        leftIconTooltip={i18n._(t`Sort by`)}
                      >
                        <option value="order">
                          {i18n._(t`Project order`)}
                        </option>
                        <option value="name">{i18n._(t`Name`)}</option>
                        <option value="date">{i18n._(t`Date`)}</option>
                        <option value="size">{i18n._(t`Size`)}</option>
                      </CompactSelectField>
                    )}
                  </I18n>
                </Column>
                <Column noMargin>
                  <I18n>
                    {({ i18n }) => (
                      <CompactToggleButtons
                        id="resources-sort-order"
                        buttons={[
                          {
                            id: 'asc',
                            renderIcon: className => (
                              <ArrowUpward className={className} />
                            ),
                            tooltip: i18n._(t`Ascending`),
                            onClick: () => setSortOrder('asc'),
                            isActive: sortOrder === 'asc',
                          },
                          {
                            id: 'desc',
                            renderIcon: className => (
                              <ArrowDownward className={className} />
                            ),
                            tooltip: i18n._(t`Descending`),
                            onClick: () => setSortOrder('desc'),
                            isActive: sortOrder === 'desc',
                          },
                        ]}
                      />
                    )}
                  </I18n>
                </Column>
                <Column noMargin>
                  <I18n>
                    {({ i18n }) => (
                      <CompactToggleButtons
                        id="resources-view-mode"
                        buttons={[
                          {
                            id: 'grid',
                            renderIcon: className => (
                              <ViewModule className={className} />
                            ),
                            tooltip: i18n._(t`Grid view`),
                            onClick: () => setViewMode('grid'),
                            isActive: viewMode === 'grid',
                          },
                          {
                            id: 'details',
                            renderIcon: className => (
                              <ViewList className={className} />
                            ),
                            tooltip: i18n._(t`Details view`),
                            onClick: () => setViewMode('details'),
                            isActive: viewMode === 'details',
                          },
                        ]}
                      />
                    )}
                  </I18n>
                </Column>
              </Line>
              <div style={styles.breadcrumbRow}>
                <I18n>
                  {({ i18n }) => (
                    <Line
                      noMargin
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Column expand noMargin>
                        <Breadcrumbs
                          steps={selectedFolderPathIds.map(
                            (folderId, index) => {
                              const isLast =
                                index === selectedFolderPathIds.length - 1;
                              const label =
                                folderId === ROOT_FOLDER_ID
                                  ? i18n._(t`Assets`)
                                  : folderIdToItem.get(folderId)
                                  ? folderIdToItem.get(folderId).name
                                  : i18n._(t`Folder`);
                              return isLast
                                ? { label }
                                : {
                                    label,
                                    href: '#',
                                    onClick: () => {
                                      setSelectedFolderId(folderId);
                                    },
                                  };
                            }
                          )}
                        />
                      </Column>
                      <Column noMargin>
                        <Text
                          size="body-small"
                          color="secondary"
                          noMargin
                          displayInlineAsSpan
                          style={styles.breadcrumbCount}
                        >
                          {i18n._(t`Items`)}: {filteredList.length}
                        </Text>
                      </Column>
                    </Line>
                  )}
                </I18n>
              </div>
            </div>
            <Line expand noMargin useFullHeight overflow="hidden">
              <Column noMargin useFullHeight>
                <div
                  style={{
                    ...styles.treeContainer,
                    borderRight: `1px solid ${gdevelopTheme.listItem.separatorColor}`,
                  }}
                >
                  <div
                    style={{
                      ...styles.treeHeader,
                      color: gdevelopTheme.text.color.secondary,
                    }}
                  >
                    <I18n>
                      {({ i18n }) => (
                        <Line
                          noMargin
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Text
                            noMargin
                            color="secondary"
                            style={styles.treeHeaderTitle}
                          >
                            {i18n._(t`Folders`)}
                          </Text>
                          <IconButton
                            size="small"
                            tooltip={i18n._(t`New folder`)}
                            onClick={() => {
                              const targetFolderId =
                                selectedFolderId !== ROOT_FOLDER_ID
                                  ? selectedFolderId
                                  : null;
                              addFolder(
                                targetFolderId,
                                i18n._(t`New folder`)
                              );
                            }}
                          >
                            <AddFolderIcon />
                          </IconButton>
                        </Line>
                      )}
                    </I18n>
                  </div>
                  <div style={styles.treeList}>
                    <AutoSizer>
                      {({ height, width }) => (
                        <I18n>
                          {({ i18n }) => (
                            <TreeView
                              // $FlowFixMe[incompatible-type]
                              ref={folderTreeRef}
                              height={height}
                              width={width}
                              items={[folderTreeRoot]}
                              getItemName={item =>
                                item.id === ROOT_FOLDER_ID
                                  ? i18n._(t`Assets`)
                                  : item.name
                              }
                              getItemId={item => item.id}
                              getItemChildren={item => item.children}
                              getItemThumbnail={() => 'FOLDER'}
                              getItemDataset={() => null}
                              onEditItem={onEditFolderItem}
                              buildMenuTemplate={(item, index) =>
                                buildFolderMenuTemplate(i18n, item)
                              }
                              getItemRightButton={() => null}
                              renderRightComponent={renderFolderRightComponent}
                              onRenameItem={onRenameFolderItem}
                              onMoveSelectionToItem={onMoveSelectionToFolder}
                              canMoveSelectionToItem={canMoveSelectionToFolder}
                              reactDndType="RESOURCE_FOLDER"
                              dropTypes={['RESOURCE_FOLDER', 'GD_RESOURCE']}
                              selectedItems={
                                folderIdToItem.has(selectedFolderId)
                                  ? [folderIdToItem.get(selectedFolderId)]
                                  : []
                              }
                              onSelectItems={items => {
                                const item = items[0];
                                if (!item) return;
                                setSelectedFolderId(item.id);
                              }}
                              onClickItem={item => setSelectedFolderId(item.id)}
                              multiSelect={false}
                              shouldHideMenuIcon={() => false}
                            />
                          )}
                        </I18n>
                      )}
                    </AutoSizer>
                  </div>
                </div>
              </Column>
              <Column expand noMargin useFullHeight noOverflowParent>
                <div
                  // $FlowFixMe[incompatible-type]
                  ref={listContainerRef}
                  style={styles.listContainer}
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                  onKeyUp={keyboardShortcutsRef.current.onKeyUp}
                >
                  {viewMode === 'grid' ? (
                    <BoxSearchResults
                      baseSize={144}
                      spacing={12}
                      error={null}
                      onRetry={() => {}}
                      searchItems={filteredList}
                      renderSearchItem={(resource, size, index) => (
                        <ProjectResourceCard
                          project={project}
                          resource={resource}
                          size={size}
                          onChoose={() => onSelectResource(resource)}
                          isSelected={selectedResource === resource}
                        />
                      )}
                      noResultPlaceholder={
                        <EmptyMessage>
                          <I18n>
                            {({ i18n }) =>
                              i18n._(t`No resources found in this folder.`)
                            }
                          </I18n>
                        </EmptyMessage>
                      }
                    />
                  ) : (
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
                              selectedItems={
                                selectedResource ? [selectedResource] : []
                              }
                              onItemSelected={onSelectResource}
                              renamedItem={renamedResource}
                              onRename={renameResource}
                              onMoveSelectionToItem={moveSelectionTo}
                              canMoveSelectionToItem={
                                sortKey === 'order' ? undefined : () => false
                              }
                              buildMenuTemplate={renderResourceMenuTemplate(
                                i18n
                              )}
                              erroredItems={resourcesWithErrors}
                              reactDndType="GD_RESOURCE"
                            />
                          )}
                        </I18n>
                      )}
                    </AutoSizer>
                  )}
                </div>
              </Column>
            </Line>
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
