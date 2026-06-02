// @flow
import { t, Trans } from '@lingui/macro';

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import MiniToolbar, { MiniToolbarText } from '../UI/MiniToolbar';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import optionalRequire from '../Utils/OptionalRequire';
import { serializeToJSObject } from '../Utils/Serializer';
import { type FileMetadata } from '../ProjectsStorage';
import type { StorageProvider } from '../ProjectsStorage';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import FileIcon from '../UI/CustomSvgIcons/File';
import FileWithLines from '../UI/CustomSvgIcons/FileWithLines';
import FolderIcon from '../UI/CustomSvgIcons/Folder';
import MusicIcon from '../UI/CustomSvgIcons/Music';
import PictureIcon from '../UI/CustomSvgIcons/Picture';
import RefreshIcon from '../UI/CustomSvgIcons/Refresh';
import VideoIcon from '../UI/CustomSvgIcons/Video';
import FolderNameDialog from './FolderNameDialog';
import MarkdownFileNameDialog from './MarkdownFileNameDialog';
import ContextMenu, { type ContextMenuInterface } from '../UI/Menu/ContextMenu';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import useAlertDialog from '../UI/Alert/useAlertDialog';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const url = optionalRequire('url');
const remote = optionalRequire('@electron/remote');
const shell = remote ? remote.shell : null;

const MAX_SCANNED_FILES = 8000;
const ignoredDirectoryNames = new Set([
  '.git',
  '.svn',
  'node_modules',
  '.cache',
]);

export type ProjectFileNode = {
  id: string,
  name: string,
  absolutePath: string,
  relativePath: string,
  type: 'folder' | 'file',
  extension: string,
  children?: Array<ProjectFileNode>,
  resourceName?: ?string,
  resourceKind?: ?string,
  error?: ?string,
};

export type ProjectFileSelection = {|
  node: ProjectFileNode,
  resource: ?gdResource,
|};

export type ProjectFilesPanelInterface = {|
  refresh: () => Promise<?ProjectFileNode>,
|};

type ResourceReference = {|
  resourceName: string,
  resourceKind: string,
|};

type ProjectFileUsage = {|
  location: string,
  value: string,
|};

type FileDeletionCheck = {|
  blockers: Array<ProjectFileUsage>,
|};

type Props = {|
  project: gdProject,
  fileMetadata: ?FileMetadata,
  storageProvider: StorageProvider,
  selectedItem: ?ProjectFileSelection,
  onSelectProjectFile: (?ProjectFileSelection) => void,
  onViewProjectFileProperties: ProjectFileSelection => void,
|};

const projectFilesLayoutStorageKey =
  'gdevelop.resourcesEditor.projectFiles.layout.v1';
const defaultTreeWidth = 320;
const minTreeWidth = 220;
const minThumbnailsWidth = 320;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const getPersistedTreeWidth = (): number => {
  try {
    const serializedLayout = window.localStorage.getItem(
      projectFilesLayoutStorageKey
    );
    if (!serializedLayout) return defaultTreeWidth;
    const layout = JSON.parse(serializedLayout);
    return typeof layout.treeWidth === 'number'
      ? layout.treeWidth
      : defaultTreeWidth;
  } catch (error) {
    return defaultTreeWidth;
  }
};

const persistTreeWidth = (treeWidth: number) => {
  try {
    window.localStorage.setItem(
      projectFilesLayoutStorageKey,
      JSON.stringify({ treeWidth })
    );
  } catch (error) {
    // Ignore local storage errors.
  }
};

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    minHeight: 32,
  },
  content: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
  treePane: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    minWidth: minTreeWidth,
    overflow: 'hidden',
  },
  treeResizeHandle: {
    flex: '0 0 6px',
    cursor: 'ew-resize',
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
    borderLeft: '1px solid rgba(128, 128, 128, 0.2)',
    borderRight: '1px solid rgba(128, 128, 128, 0.2)',
  },
  scrollContainer: {
    overflow: 'auto',
    flex: 1,
    minHeight: 0,
    outline: 'none',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    height: 28,
    paddingRight: 8,
    cursor: 'default',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  },
  rowDropTarget: {
    outline: '1px solid var(--theme-primary-color)',
    outlineOffset: -1,
  },
  disclosure: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 6,
    flexShrink: 0,
  },
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badge: {
    marginLeft: 8,
    padding: '1px 5px',
    borderRadius: 4,
    fontSize: 11,
    lineHeight: '16px',
    flexShrink: 0,
  },
  registeredBadge: {
    backgroundColor: 'rgba(69, 217, 161, 0.22)',
    color: 'var(--theme-success-color)',
    border: '1px solid rgba(69, 217, 161, 0.55)',
  },
  thumbnailBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    marginLeft: 0,
    zIndex: 2,
  },
  path: {
    marginLeft: 6,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    opacity: 0.65,
    fontSize: 12,
  },
  thumbnailsPane: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: minThumbnailsWidth,
    overflow: 'hidden',
  },
  thumbnailsHeader: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 30,
    padding: '0 12px',
    borderBottom: '1px solid rgba(128, 128, 128, 0.18)',
    boxSizing: 'border-box',
  },
  thumbnailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gridAutoRows: 'minmax(166px, auto)',
    gap: 12,
    padding: 12,
    overflow: 'auto',
    flex: 1,
    minHeight: 0,
    boxSizing: 'border-box',
  },
  thumbnailCard: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    height: 166,
    borderRadius: 6,
    border: '1px solid rgba(128, 128, 128, 0.24)',
    overflow: 'hidden',
    cursor: 'default',
    userSelect: 'none',
  },
  thumbnailDropTarget: {
    outline: '2px solid var(--theme-primary-color)',
    outlineOffset: -2,
  },
  thumbnailPreview: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 auto',
    minHeight: 0,
    padding: 8,
    boxSizing: 'border-box',
  },
  thumbnailImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  thumbnailIcon: {
    width: 52,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.82,
  },
  thumbnailFooter: {
    display: 'flex',
    flexDirection: 'column',
    padding: '7px 8px 8px',
    borderTop: '1px solid rgba(128, 128, 128, 0.16)',
    minHeight: 44,
    boxSizing: 'border-box',
  },
  thumbnailName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  emptyFolderState: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flex: 1,
    minHeight: 0,
    padding: 18,
    boxSizing: 'border-box',
  },
};

export const getProjectRootPath = (project: gdProject): ?string => {
  if (!path) return null;
  const projectFile = project.getProjectFile();
  if (!projectFile) return null;
  return path.dirname(projectFile);
};

export const normalizeSlashes = (filePath: string): string =>
  filePath.replace(/\\/g, '/');

export const getFileUrl = (absolutePath: string): string => {
  if (url && url.pathToFileURL)
    return url.pathToFileURL(absolutePath).toString();
  return 'file://' + normalizeSlashes(absolutePath);
};

const normalizeAbsolutePath = (filePath: string): string =>
  normalizeSlashes(path.resolve(filePath)).toLowerCase();

const normalizeProjectPath = (filePath: string): string =>
  normalizeSlashes(filePath)
    .replace(/^\.\//, '')
    .toLowerCase();

const isExternalResourceFile = (file: string): boolean =>
  file.indexOf('http://') === 0 ||
  file.indexOf('https://') === 0 ||
  file.indexOf('data:') === 0 ||
  file.indexOf('blob:') === 0;

const buildResourcesByAbsolutePath = (
  project: gdProject
): Map<string, ResourceReference> => {
  const resourcesByPath: Map<string, ResourceReference> = new Map();
  const projectRoot = getProjectRootPath(project);
  if (!path || !projectRoot) return resourcesByPath;

  const resourcesManager = project.getResourcesManager();
  resourcesManager
    .getAllResourceNames()
    .toJSArray()
    .forEach(resourceName => {
      const resource = resourcesManager.getResource(resourceName);
      const resourceFile = resource.getFile();
      if (!resourceFile || isExternalResourceFile(resourceFile)) return;

      const absolutePath = path.isAbsolute(resourceFile)
        ? resourceFile
        : path.join(projectRoot, resourceFile);
      resourcesByPath.set(normalizeAbsolutePath(absolutePath), {
        resourceName,
        resourceKind: resource.getKind(),
      });
    });

  return resourcesByPath;
};

const findResourceReferencesForAbsolutePath = (
  project: gdProject,
  absolutePath: string
): Array<ResourceReference> => {
  const projectRoot = getProjectRootPath(project);
  if (!path || !projectRoot) return [];

  const normalizedTargetPath = normalizeAbsolutePath(absolutePath);
  const resourcesManager = project.getResourcesManager();
  const resourceReferences: Array<ResourceReference> = [];
  resourcesManager
    .getAllResourceNames()
    .toJSArray()
    .forEach(resourceName => {
      const resource = resourcesManager.getResource(resourceName);
      const resourceFile = resource.getFile();
      if (!resourceFile || isExternalResourceFile(resourceFile)) return;

      const resourceAbsolutePath = path.isAbsolute(resourceFile)
        ? resourceFile
        : path.join(projectRoot, resourceFile);
      if (normalizeAbsolutePath(resourceAbsolutePath) !== normalizedTargetPath)
        return;

      resourceReferences.push({
        resourceName,
        resourceKind: resource.getKind(),
      });
    });

  return resourceReferences;
};

const getExtension = (fileName: string): string =>
  path ? path.extname(fileName).toLowerCase() : '';

export const isImageFile = (node: ProjectFileNode): boolean =>
  node.type === 'file' &&
  ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg'].includes(
    node.extension
  );

export const isAudioFile = (node: ProjectFileNode): boolean =>
  node.type === 'file' &&
  ['.mp3', '.ogg', '.wav', '.flac', '.m4a', '.aac'].includes(node.extension);

export const isVideoFile = (node: ProjectFileNode): boolean =>
  node.type === 'file' &&
  ['.mp4', '.webm', '.mov', '.m4v', '.ogv'].includes(node.extension);

export const isMarkdownFile = (node: ProjectFileNode): boolean =>
  node.type === 'file' && ['.md', '.markdown'].includes(node.extension);

export const isTextLikeFile = (node: ProjectFileNode): boolean =>
  node.type === 'file' &&
  [
    '.txt',
    '.json',
    '.js',
    '.ts',
    '.tsx',
    '.jsx',
    '.css',
    '.html',
    '.xml',
    '.yaml',
    '.yml',
    '.csv',
    '.md',
    '.markdown',
  ].includes(node.extension);

const getIconForNode = (node: ProjectFileNode): React.Node => {
  if (node.type === 'folder') return <FolderIcon />;
  if (isImageFile(node)) return <PictureIcon />;
  if (isAudioFile(node)) return <MusicIcon />;
  if (isVideoFile(node)) return <VideoIcon />;
  if (isMarkdownFile(node) || isTextLikeFile(node)) return <FileWithLines />;
  return <FileIcon />;
};

const sortNodes = (nodes: Array<ProjectFileNode>): Array<ProjectFileNode> =>
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });

const readDirectory = async ({
  absolutePath,
  relativePath,
  resourcesByPath,
  counter,
}: {|
  absolutePath: string,
  relativePath: string,
  resourcesByPath: Map<string, ResourceReference>,
  counter: {| count: number, truncated: boolean |},
|}): Promise<Array<ProjectFileNode>> => {
  if (!fs || !path || counter.truncated) return [];

  let dirents;
  try {
    dirents = await fs.promises.readdir(absolutePath, { withFileTypes: true });
  } catch (error) {
    return [
      {
        id: absolutePath + '#error',
        name: 'Unable to read folder',
        absolutePath,
        relativePath,
        type: 'file',
        extension: '',
        error: error.message,
      },
    ];
  }

  const nodes = [];
  for (const dirent of dirents) {
    if (counter.count >= MAX_SCANNED_FILES) {
      counter.truncated = true;
      break;
    }
    const name = dirent.name;
    if (dirent.isDirectory() && ignoredDirectoryNames.has(name)) continue;

    const childAbsolutePath = path.join(absolutePath, name);
    const childRelativePath = relativePath
      ? normalizeSlashes(path.join(relativePath, name))
      : name;
    const type = dirent.isDirectory() ? 'folder' : 'file';
    const resourceReference = resourcesByPath.get(
      normalizeAbsolutePath(childAbsolutePath)
    );
    counter.count++;

    const node: ProjectFileNode = {
      id: normalizeSlashes(childAbsolutePath),
      name,
      absolutePath: childAbsolutePath,
      relativePath: childRelativePath,
      type,
      extension: type === 'file' ? getExtension(name) : '',
      resourceName: resourceReference ? resourceReference.resourceName : null,
      resourceKind: resourceReference ? resourceReference.resourceKind : null,
    };

    if (type === 'folder') {
      node.children = await readDirectory({
        absolutePath: childAbsolutePath,
        relativePath: childRelativePath,
        resourcesByPath,
        counter,
      });
    }

    nodes.push(node);
  }

  return sortNodes(nodes);
};

const findNodeByAbsolutePath = (
  node: ProjectFileNode,
  absolutePath: string
): ?ProjectFileNode => {
  if (
    normalizeAbsolutePath(node.absolutePath) ===
    normalizeAbsolutePath(absolutePath)
  ) {
    return node;
  }
  if (!node.children) return null;
  for (const child of node.children) {
    const foundNode = findNodeByAbsolutePath(child, absolutePath);
    if (foundNode) return foundNode;
  }
  return null;
};

const findParentNodeByAbsolutePath = (
  node: ProjectFileNode,
  absolutePath: string,
  parentNode: ?ProjectFileNode = null
): ?ProjectFileNode => {
  if (
    normalizeAbsolutePath(node.absolutePath) ===
    normalizeAbsolutePath(absolutePath)
  ) {
    return parentNode;
  }
  if (!node.children) return null;
  for (const child of node.children) {
    const foundParentNode = findParentNodeByAbsolutePath(
      child,
      absolutePath,
      node
    );
    if (foundParentNode) return foundParentNode;
  }
  return null;
};

const getResourceFromNode = (
  project: gdProject,
  node: ProjectFileNode
): ?gdResource => {
  const { resourceName } = node;
  if (!resourceName) return null;
  const resourcesManager = project.getResourcesManager();
  return resourcesManager.hasResource(resourceName)
    ? resourcesManager.getResource(resourceName)
    : null;
};

const getValueAtPath = (root: any, pathSegments: Array<string | number>): any =>
  pathSegments.reduce((value, segment) => {
    if (!value) return null;
    return value[segment];
  }, root);

const getNamedItemLabel = (
  projectData: any,
  pathSegments: Array<string | number>,
  collectionName: string,
  label: string
): ?string => {
  const collectionIndex = pathSegments.indexOf(collectionName);
  if (collectionIndex === -1) return null;

  const itemIndex = pathSegments[collectionIndex + 1];
  if (typeof itemIndex !== 'number') return label;

  const item = getValueAtPath(
    projectData,
    pathSegments.slice(0, collectionIndex + 2)
  );
  if (item && typeof item.name === 'string' && item.name) {
    return `${label} "${item.name}"`;
  }

  return label;
};

const formatProjectReferenceLocation = (
  projectData: any,
  pathSegments: Array<string | number>
): string => {
  const locationParts = [];

  if (pathSegments.includes('resources')) {
    locationParts.push('Resources manager');
  }

  const sceneLabel = getNamedItemLabel(
    projectData,
    pathSegments,
    'layouts',
    'Scene'
  );
  if (sceneLabel) locationParts.push(sceneLabel);

  const externalLayoutLabel = getNamedItemLabel(
    projectData,
    pathSegments,
    'externalLayouts',
    'External layout'
  );
  if (externalLayoutLabel) locationParts.push(externalLayoutLabel);

  const extensionLabel = getNamedItemLabel(
    projectData,
    pathSegments,
    'eventsFunctionsExtensions',
    'Extension'
  );
  if (extensionLabel) locationParts.push(extensionLabel);

  const objectLabel = getNamedItemLabel(
    projectData,
    pathSegments,
    'objects',
    'Object'
  );
  if (objectLabel) locationParts.push(objectLabel);

  const layerLabel = getNamedItemLabel(
    projectData,
    pathSegments,
    'layers',
    'Layer'
  );
  if (layerLabel) locationParts.push(layerLabel);

  if (pathSegments.includes('events')) locationParts.push('Events');
  if (pathSegments.includes('actions')) locationParts.push('Actions');
  if (pathSegments.includes('conditions')) locationParts.push('Conditions');
  if (pathSegments.includes('effects')) locationParts.push('Effects');
  if (pathSegments.includes('sourceFiles')) locationParts.push('Source files');
  if (pathSegments.includes('loadingScreen'))
    locationParts.push('Loading screen');
  if (pathSegments.includes('platformSpecificAssets'))
    locationParts.push('Platform assets');

  const serializedPath = pathSegments
    .slice(Math.max(0, pathSegments.length - 4))
    .join('.');

  if (!locationParts.length) return serializedPath || 'Project data';
  return `${Array.from(new Set(locationParts)).join(
    ' - '
  )} (${serializedPath})`;
};

const shouldMatchSerializedStringValue = (
  rawValue: string,
  candidateValues: Set<string>,
  candidatePaths: Set<string>
): boolean => {
  const normalizedValue = normalizeProjectPath(rawValue);
  if (candidateValues.has(normalizedValue)) return true;

  for (const candidatePath of candidatePaths) {
    if (
      normalizedValue === candidatePath ||
      normalizedValue.endsWith('/' + candidatePath)
    ) {
      return true;
    }
  }

  return false;
};

const findSerializedStringReferences = (
  projectData: any,
  candidateValues: Set<string>,
  candidatePaths: Set<string>
): Array<ProjectFileUsage> => {
  const references: Array<ProjectFileUsage> = [];
  const visit = (value: any, pathSegments: Array<string | number>) => {
    if (typeof value === 'string') {
      if (
        shouldMatchSerializedStringValue(value, candidateValues, candidatePaths)
      ) {
        references.push({
          location: formatProjectReferenceLocation(projectData, pathSegments),
          value,
        });
      }
      return;
    }

    if (!value || typeof value !== 'object') return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, [...pathSegments, index]));
      return;
    }

    Object.keys(value).forEach(key => {
      visit(value[key], [...pathSegments, key]);
    });
  };

  visit(projectData, []);
  return references;
};

const getObjectUsageLocations = (
  project: gdProject,
  resourceName: string
): Array<ProjectFileUsage> => {
  if (!gd.ObjectsUsingResourceCollector || !gd.ProjectBrowserHelper) return [];

  const collector = new gd.ObjectsUsingResourceCollector(
    project.getResourcesManager(),
    resourceName
  );
  gd.ProjectBrowserHelper.exposeProjectObjects(project, (collector: any));
  const objectNames = collector.getObjectNames().toJSArray();
  collector.delete();

  return objectNames.map(objectName => ({
    location: `Object "${objectName}"`,
    value: resourceName,
  }));
};

const getResourceUsageLocations = (
  project: gdProject,
  projectData: any,
  resourceReference: ResourceReference
): Array<ProjectFileUsage> => {
  const unusedResourceNames = gd.ProjectResourcesAdder.getAllUseless(
    project,
    resourceReference.resourceKind
  ).toJSArray();
  if (unusedResourceNames.includes(resourceReference.resourceName)) {
    return [];
  }

  const candidateValues = new Set([
    normalizeProjectPath(resourceReference.resourceName),
  ]);
  const references = findSerializedStringReferences(
    projectData,
    candidateValues,
    new Set()
  ).filter(reference => reference.location.indexOf('Resources manager') !== 0);

  return [
    ...getObjectUsageLocations(project, resourceReference.resourceName),
    ...references,
  ];
};

const getFileDeletionCheck = (
  project: gdProject,
  node: ProjectFileNode
): FileDeletionCheck => {
  const blockers = [];
  const projectData = serializeToJSObject(project);
  const resourceReferences = findResourceReferencesForAbsolutePath(
    project,
    node.absolutePath
  );

  resourceReferences.forEach(resourceReference => {
    const usageLocations = getResourceUsageLocations(
      project,
      projectData,
      resourceReference
    );
    if (!usageLocations.length) {
      blockers.push({
        location: 'Resources manager',
        value: `${resourceReference.resourceName} (${
          resourceReference.resourceKind
        })`,
      });
      return;
    }

    usageLocations.forEach(usageLocation => blockers.push(usageLocation));
  });

  if (resourceReferences.length) {
    return { blockers };
  }

  if (!path) return { blockers };

  const projectRoot = getProjectRootPath(project);
  const absoluteCandidate = normalizeAbsolutePath(node.absolutePath);
  const relativeCandidate = projectRoot
    ? normalizeProjectPath(path.relative(projectRoot, node.absolutePath))
    : '';
  const fileNameCandidate = normalizeProjectPath(
    path.basename(node.absolutePath)
  );
  const candidateValues = new Set(
    [
      absoluteCandidate,
      relativeCandidate,
      relativeCandidate ? './' + relativeCandidate : '',
      fileNameCandidate,
    ].filter(Boolean)
  );
  const candidatePaths = new Set(
    [relativeCandidate, fileNameCandidate].filter(Boolean)
  );

  findSerializedStringReferences(projectData, candidateValues, candidatePaths)
    .filter(reference => reference.location.indexOf('Resources manager') !== 0)
    .forEach(reference => blockers.push(reference));

  return { blockers };
};

const formatFileDeletionBlockers = (
  blockers: Array<ProjectFileUsage>
): string => {
  const uniqueBlockers = Array.from(
    new Map(
      blockers.map(blocker => [
        `${blocker.location}\n${blocker.value}`,
        blocker,
      ])
    ).values()
  );
  const visibleBlockers = uniqueBlockers.slice(0, 12);
  const hiddenCount = uniqueBlockers.length - visibleBlockers.length;
  return (
    visibleBlockers
      .map(blocker => `- ${blocker.location}: ${blocker.value}`)
      .join('\n') +
    (hiddenCount > 0 ? `\n- ...and ${hiddenCount} more reference(s).` : '')
  );
};

export const buildFileDeletionBlockersMessage = (
  blockers: Array<ProjectFileUsage>
): string =>
  `This file is still registered or referenced in the project. Remove these references first:\n\n${formatFileDeletionBlockers(
    blockers
  )}`;

export const buildDuplicateMarkdownCreationErrorMessage = (): string =>
  'A file with this name already exists.';

export const buildDuplicateFolderCreationErrorMessage = (): string =>
  'A file or folder with this name already exists.';

export const buildFolderCreationDiskErrorMessage = (
  errorMessage: string
): string => `The folder could not be created on disk:\n\n${errorMessage}`;

export const shouldSelectCreatedProjectFile = (
  node: ProjectFileNode
): boolean => node.type !== 'folder';

export const canDeleteProjectFolder = (node: ProjectFileNode): boolean =>
  node.type === 'folder' &&
  !!node.relativePath &&
  (!node.children || node.children.length === 0);

export const shouldSelectProjectFileNode = (node: ProjectFileNode): boolean =>
  node.type === 'file' || node.type === 'folder';

export const canMoveProjectFileToFolder = ({
  sourceNode,
  targetFolderNode,
}: {|
  sourceNode: ?ProjectFileNode,
  targetFolderNode: ProjectFileNode,
|}): boolean => {
  if (!path || !sourceNode) return false;
  if (sourceNode.type !== 'file' || targetFolderNode.type !== 'folder') {
    return false;
  }

  return (
    normalizeAbsolutePath(path.dirname(sourceNode.absolutePath)) !==
    normalizeAbsolutePath(targetFolderNode.absolutePath)
  );
};

export const getProjectFileDragEffectAllowed = (): string => 'copyMove';

export const getMovedProjectFilePath = ({
  sourceNode,
  targetFolderNode,
}: {|
  sourceNode: ProjectFileNode,
  targetFolderNode: ProjectFileNode,
|}): string =>
  path
    ? path.join(targetFolderNode.absolutePath, sourceNode.name)
    : `${targetFolderNode.absolutePath}/${sourceNode.name}`;

export const getResourceFileAfterProjectFileMove = ({
  projectRootPath,
  previousResourceFile,
  movedAbsolutePath,
}: {|
  projectRootPath: string,
  previousResourceFile: string,
  movedAbsolutePath: string,
|}): string => {
  if (!path || isExternalResourceFile(previousResourceFile)) {
    return previousResourceFile;
  }

  return path.isAbsolute(previousResourceFile)
    ? movedAbsolutePath
    : normalizeSlashes(path.relative(projectRootPath, movedAbsolutePath));
};

const getFileMoveCheck = (
  project: gdProject,
  node: ProjectFileNode
): FileDeletionCheck => {
  const blockers = [];
  if (!path) return { blockers };

  const projectData = serializeToJSObject(project);
  const projectRoot = getProjectRootPath(project);
  const absoluteCandidate = normalizeAbsolutePath(node.absolutePath);
  const relativeCandidate = projectRoot
    ? normalizeProjectPath(path.relative(projectRoot, node.absolutePath))
    : '';
  const fileNameCandidate = normalizeProjectPath(
    path.basename(node.absolutePath)
  );
  const candidateValues = new Set(
    [
      absoluteCandidate,
      relativeCandidate,
      relativeCandidate ? './' + relativeCandidate : '',
      fileNameCandidate,
    ].filter(Boolean)
  );
  const candidatePaths = new Set(
    [relativeCandidate, fileNameCandidate].filter(Boolean)
  );

  findSerializedStringReferences(projectData, candidateValues, candidatePaths)
    .filter(reference => reference.location.indexOf('Resources manager') !== 0)
    .forEach(reference => blockers.push(reference));

  return { blockers };
};

const buildFileMoveBlockersMessage = (
  blockers: Array<ProjectFileUsage>
): string =>
  `This file is referenced directly in the project. Remove or update these references first:\n\n${formatFileDeletionBlockers(
    blockers
  )}`;

const updateResourcesAfterProjectFileMove = ({
  project,
  sourceAbsolutePath,
  movedAbsolutePath,
}: {|
  project: gdProject,
  sourceAbsolutePath: string,
  movedAbsolutePath: string,
|}) => {
  if (!path) return;
  const projectRootPath = getProjectRootPath(project);
  if (!projectRootPath) return;

  const resourcesManager = project.getResourcesManager();
  findResourceReferencesForAbsolutePath(project, sourceAbsolutePath).forEach(
    ({ resourceName }) => {
      if (!resourcesManager.hasResource(resourceName)) return;

      const resource = resourcesManager.getResource(resourceName);
      resource.setFile(
        getResourceFileAfterProjectFileMove({
          projectRootPath,
          previousResourceFile: resource.getFile(),
          movedAbsolutePath,
        })
      );
    }
  );
};

const ProjectFilesPanel: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<ProjectFilesPanelInterface>,
}> = React.forwardRef<Props, ProjectFilesPanelInterface>(
  (
    {
      project,
      fileMetadata,
      storageProvider,
      selectedItem,
      onSelectProjectFile,
      onViewProjectFileProperties,
    },
    ref
  ) => {
    const theme = React.useContext(GDevelopThemeContext);
    const { showAlert, showDeleteConfirmation } = useAlertDialog();
    const contextMenu = React.useRef<?ContextMenuInterface>(null);
    const contentRef = React.useRef<?HTMLDivElement>(null);
    const [searchText, setSearchText] = React.useState('');
    const [rootNode, setRootNode] = React.useState<?ProjectFileNode>(null);
    const [openedNodeIds, setOpenedNodeIds] = React.useState<Array<string>>([]);
    const [treeWidth, setTreeWidth] = React.useState(getPersistedTreeWidth);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<?string>(null);
    const [isTruncated, setIsTruncated] = React.useState(false);
    const [isMarkdownDialogOpen, setIsMarkdownDialogOpen] = React.useState(
      false
    );
    const [
      markdownCreationTargetNode,
      setMarkdownCreationTargetNode,
    ] = React.useState<?ProjectFileNode>(null);
    const [
      markdownCreationError,
      setMarkdownCreationError,
    ] = React.useState<?string>(null);
    const [isFolderDialogOpen, setIsFolderDialogOpen] = React.useState(false);
    const [
      folderCreationTargetNode,
      setFolderCreationTargetNode,
    ] = React.useState<?ProjectFileNode>(null);
    const [
      folderCreationError,
      setFolderCreationError,
    ] = React.useState<?string>(null);
    const [
      draggedFileNode,
      setDraggedFileNode,
    ] = React.useState<?ProjectFileNode>(null);
    const [
      dropTargetFolderNodeId,
      setDropTargetFolderNodeId,
    ] = React.useState<?string>(null);

    const canBrowseProjectFiles =
      !!fs &&
      !!path &&
      !!fileMetadata &&
      storageProvider.internalName === 'LocalFile' &&
      !!getProjectRootPath(project);

    const refresh = React.useCallback(
      async (): Promise<?ProjectFileNode> => {
        const projectRoot = getProjectRootPath(project);
        if (!fs || !path || !projectRoot) return null;

        setIsLoading(true);
        setError(null);

        try {
          const resourcesByPath = buildResourcesByAbsolutePath(project);
          const counter = { count: 0, truncated: false };
          const children = await readDirectory({
            absolutePath: projectRoot,
            relativePath: '',
            resourcesByPath,
            counter,
          });
          const newRootNode: ProjectFileNode = {
            id: normalizeSlashes(projectRoot),
            name: path.basename(projectRoot),
            absolutePath: projectRoot,
            relativePath: '',
            type: 'folder',
            extension: '',
            children,
          };
          setRootNode(newRootNode);
          setOpenedNodeIds(openedNodeIds => {
            if (openedNodeIds.includes(newRootNode.id)) return openedNodeIds;
            return [newRootNode.id, ...openedNodeIds];
          });
          setIsTruncated(counter.truncated);
          return newRootNode;
        } catch (error) {
          setError(error.message);
          return null;
        } finally {
          setIsLoading(false);
        }
      },
      [project]
    );

    React.useImperativeHandle(ref, () => ({ refresh }));

    React.useEffect(
      () => {
        if (canBrowseProjectFiles) refresh();
      },
      [canBrowseProjectFiles, refresh]
    );

    const createMarkdownFile = React.useCallback(
      async (fileName: string) => {
        if (!fs || !path || !rootNode) return;

        const selectedNode =
          markdownCreationTargetNode ||
          (selectedItem ? selectedItem.node : null);
        const folderPath =
          selectedNode && selectedNode.type === 'folder'
            ? selectedNode.absolutePath
            : selectedNode
            ? path.dirname(selectedNode.absolutePath)
            : rootNode.absolutePath;
        const markdownPath = path.join(folderPath, fileName);
        try {
          await fs.promises.access(markdownPath);
          setMarkdownCreationError(
            buildDuplicateMarkdownCreationErrorMessage()
          );
          return;
        } catch (error) {
          // The file does not exist, which is what we want before creating it.
        }
        await fs.promises.writeFile(markdownPath, '# Notes\n\n', 'utf8');
        setMarkdownCreationError(null);
        setMarkdownCreationTargetNode(null);
        setIsMarkdownDialogOpen(false);
        const refreshedRoot = (await refresh()) || rootNode;
        const fallbackCreatedNode: ProjectFileNode = {
          id: normalizeSlashes(markdownPath),
          name: path.basename(markdownPath),
          absolutePath: markdownPath,
          relativePath: normalizeSlashes(
            path.relative(rootNode.absolutePath, markdownPath)
          ),
          type: 'file',
          extension: '.md',
          resourceName: null,
          resourceKind: null,
        };
        const createdNode: ProjectFileNode =
          findNodeByAbsolutePath(refreshedRoot, markdownPath) ||
          fallbackCreatedNode;
        if (shouldSelectCreatedProjectFile(createdNode)) {
          onSelectProjectFile({
            node: createdNode,
            resource: getResourceFromNode(project, createdNode),
          });
        }
      },
      [
        markdownCreationTargetNode,
        project,
        refresh,
        rootNode,
        selectedItem,
        onSelectProjectFile,
      ]
    );

    const openMarkdownDialogForNode = React.useCallback(
      (node: ProjectFileNode) => {
        setMarkdownCreationTargetNode(node);
        setMarkdownCreationError(null);
        setIsMarkdownDialogOpen(true);
      },
      []
    );

    const createFolder = React.useCallback(
      async (folderName: string) => {
        if (!fs || !path || !rootNode) return;

        const selectedNode =
          folderCreationTargetNode || (selectedItem ? selectedItem.node : null);
        const folderPath =
          selectedNode && selectedNode.type === 'folder'
            ? selectedNode.absolutePath
            : selectedNode
            ? path.dirname(selectedNode.absolutePath)
            : rootNode.absolutePath;
        const newFolderPath = path.join(folderPath, folderName);
        try {
          await fs.promises.access(newFolderPath);
          setFolderCreationError(buildDuplicateFolderCreationErrorMessage());
          return;
        } catch (error) {
          // The folder does not exist, which is what we want before creating it.
        }

        try {
          await fs.promises.mkdir(newFolderPath);
        } catch (error) {
          setFolderCreationError(
            buildFolderCreationDiskErrorMessage(
              error && error.message ? error.message : String(error)
            )
          );
          return;
        }

        setFolderCreationError(null);
        setFolderCreationTargetNode(null);
        setIsFolderDialogOpen(false);
        setOpenedNodeIds(openedNodeIds =>
          Array.from(
            new Set([
              normalizeSlashes(folderPath),
              normalizeSlashes(newFolderPath),
              ...openedNodeIds,
            ])
          )
        );
        const refreshedRoot = (await refresh()) || rootNode;
        const fallbackCreatedNode: ProjectFileNode = {
          id: normalizeSlashes(newFolderPath),
          name: path.basename(newFolderPath),
          absolutePath: newFolderPath,
          relativePath: normalizeSlashes(
            path.relative(rootNode.absolutePath, newFolderPath)
          ),
          type: 'folder',
          extension: '',
          children: [],
        };
        const createdNode: ProjectFileNode =
          findNodeByAbsolutePath(refreshedRoot, newFolderPath) ||
          fallbackCreatedNode;
        if (shouldSelectCreatedProjectFile(createdNode)) {
          onSelectProjectFile({
            node: createdNode,
            resource: null,
          });
        }
      },
      [
        folderCreationTargetNode,
        refresh,
        rootNode,
        selectedItem,
        onSelectProjectFile,
      ]
    );

    const openFolderDialogForNode = React.useCallback(
      (node: ProjectFileNode) => {
        setFolderCreationTargetNode(node);
        setFolderCreationError(null);
        setIsFolderDialogOpen(true);
      },
      []
    );

    const makeSelectionForNode = React.useCallback(
      (node: ProjectFileNode): ProjectFileSelection => ({
        node,
        resource: getResourceFromNode(project, node),
      }),
      [project]
    );

    const viewPropertiesForNode = React.useCallback(
      (node: ProjectFileNode) => {
        onViewProjectFileProperties(makeSelectionForNode(node));
      },
      [makeSelectionForNode, onViewProjectFileProperties]
    );

    const deleteProjectFile = React.useCallback(
      async (node: ProjectFileNode) => {
        if (!fs || node.type !== 'file') return;

        const { blockers } = getFileDeletionCheck(project, node);
        if (blockers.length) {
          await showAlert({
            title: t`Unable to delete this file`,
            message: buildFileDeletionBlockersMessage(blockers),
          });
          return;
        }

        const shouldDelete = await showDeleteConfirmation({
          title: t`Delete file`,
          message: `This will permanently delete "${
            node.name
          }" from disk. This can't be undone.`,
          fieldMessage: t`Type DELETE to confirm deletion.`,
          confirmText: 'DELETE',
          confirmButtonLabel: t`Delete`,
        });
        if (!shouldDelete) return;

        try {
          await fs.promises.unlink(node.absolutePath);
        } catch (error) {
          await showAlert({
            title: t`Unable to delete this file`,
            message: `The file could not be deleted from disk:\n\n${
              error.message
            }`,
          });
          return;
        }

        if (
          selectedItem &&
          normalizeAbsolutePath(selectedItem.node.absolutePath) ===
            normalizeAbsolutePath(node.absolutePath)
        ) {
          onSelectProjectFile(null);
        }
        await refresh();
      },
      [
        project,
        refresh,
        selectedItem,
        onSelectProjectFile,
        showAlert,
        showDeleteConfirmation,
      ]
    );

    const deleteProjectFolder = React.useCallback(
      async (node: ProjectFileNode) => {
        if (!fs || !canDeleteProjectFolder(node)) return;

        let folderEntries: Array<string> = [];
        try {
          folderEntries = await fs.promises.readdir(node.absolutePath);
        } catch (error) {
          await showAlert({
            title: t`Unable to delete this folder`,
            message: `The folder could not be read from disk:\n\n${
              error.message
            }`,
          });
          return;
        }

        if (folderEntries.length) {
          await showAlert({
            title: t`Unable to delete this folder`,
            message: t`Only empty folders can be deleted.`,
          });
          return;
        }

        const shouldDelete = await showDeleteConfirmation({
          title: t`Delete folder`,
          message: `This will permanently delete the empty folder "${
            node.name
          }" from disk. This can't be undone.`,
          fieldMessage: t`Type DELETE to confirm deletion.`,
          confirmText: 'DELETE',
          confirmButtonLabel: t`Delete`,
        });
        if (!shouldDelete) return;

        try {
          await fs.promises.rmdir(node.absolutePath);
        } catch (error) {
          await showAlert({
            title: t`Unable to delete this folder`,
            message: `The folder could not be deleted from disk:\n\n${
              error.message
            }`,
          });
          return;
        }

        if (
          selectedItem &&
          normalizeAbsolutePath(selectedItem.node.absolutePath) ===
            normalizeAbsolutePath(node.absolutePath)
        ) {
          onSelectProjectFile(null);
        }
        setOpenedNodeIds(openedNodeIds =>
          openedNodeIds.filter(
            openedNodeId => openedNodeId !== normalizeSlashes(node.absolutePath)
          )
        );
        await refresh();
      },
      [
        refresh,
        selectedItem,
        onSelectProjectFile,
        showAlert,
        showDeleteConfirmation,
      ]
    );

    const moveProjectFileToFolder = React.useCallback(
      async (
        sourceNode: ProjectFileNode,
        targetFolderNode: ProjectFileNode
      ) => {
        if (!fs || !path || !rootNode) return;
        if (
          !canMoveProjectFileToFolder({
            sourceNode,
            targetFolderNode,
          })
        ) {
          return;
        }

        const movedFilePath = getMovedProjectFilePath({
          sourceNode,
          targetFolderNode,
        });
        try {
          await fs.promises.access(movedFilePath);
          await showAlert({
            title: t`Unable to move this file`,
            message: `A file named "${sourceNode.name}" already exists in "${
              targetFolderNode.name
            }".`,
          });
          return;
        } catch (error) {
          // The destination does not exist, which is what we want before moving.
        }

        const { blockers } = getFileMoveCheck(project, sourceNode);
        if (blockers.length) {
          await showAlert({
            title: t`Unable to move this file`,
            message: buildFileMoveBlockersMessage(blockers),
          });
          return;
        }

        try {
          await fs.promises.rename(sourceNode.absolutePath, movedFilePath);
        } catch (error) {
          await showAlert({
            title: t`Unable to move this file`,
            message: `The file could not be moved on disk:\n\n${error.message}`,
          });
          return;
        }

        updateResourcesAfterProjectFileMove({
          project,
          sourceAbsolutePath: sourceNode.absolutePath,
          movedAbsolutePath: movedFilePath,
        });

        setOpenedNodeIds(openedNodeIds =>
          Array.from(
            new Set([
              normalizeSlashes(targetFolderNode.absolutePath),
              ...openedNodeIds,
            ])
          )
        );
        const refreshedRoot = (await refresh()) || rootNode;
        if (
          selectedItem &&
          normalizeAbsolutePath(selectedItem.node.absolutePath) ===
            normalizeAbsolutePath(sourceNode.absolutePath)
        ) {
          const movedNode = findNodeByAbsolutePath(
            refreshedRoot,
            movedFilePath
          );
          onSelectProjectFile(
            movedNode
              ? {
                  node: movedNode,
                  resource: getResourceFromNode(project, movedNode),
                }
              : null
          );
        }
      },
      [project, refresh, rootNode, selectedItem, onSelectProjectFile, showAlert]
    );

    const finishDraggingProjectFile = React.useCallback(() => {
      setDraggedFileNode(null);
      setDropTargetFolderNodeId(null);
    }, []);

    const startDraggingProjectFile = React.useCallback(
      (event: any, node: ProjectFileNode) => {
        if (node.type !== 'file') return;
        event.dataTransfer.effectAllowed = getProjectFileDragEffectAllowed();
        event.dataTransfer.setData(
          'application/x-gdevelop-project-file',
          JSON.stringify({
            id: node.id,
            type: node.type,
            absolutePath: node.absolutePath,
            name: node.name,
            extension: node.extension,
          })
        );
        event.dataTransfer.setData('text/plain', node.name);
        setDraggedFileNode(node);
      },
      []
    );

    const handleFolderDragOver = React.useCallback(
      (event: any, targetFolderNode: ProjectFileNode) => {
        if (
          !canMoveProjectFileToFolder({
            sourceNode: draggedFileNode,
            targetFolderNode,
          })
        ) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDropTargetFolderNodeId(targetFolderNode.id);
      },
      [draggedFileNode]
    );

    const handleFolderDragLeave = React.useCallback(
      (event: any, targetFolderNode: ProjectFileNode) => {
        const relatedTarget = event.relatedTarget;
        if (
          relatedTarget &&
          event.currentTarget &&
          event.currentTarget.contains(relatedTarget)
        ) {
          return;
        }
        setDropTargetFolderNodeId(dropTargetFolderNodeId =>
          dropTargetFolderNodeId === targetFolderNode.id
            ? null
            : dropTargetFolderNodeId
        );
      },
      []
    );

    const handleFolderDrop = React.useCallback(
      async (event: any, targetFolderNode: ProjectFileNode) => {
        if (
          !canMoveProjectFileToFolder({
            sourceNode: draggedFileNode,
            targetFolderNode,
          }) ||
          !draggedFileNode
        ) {
          finishDraggingProjectFile();
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        const sourceNode = draggedFileNode;
        finishDraggingProjectFile();
        await moveProjectFileToFolder(sourceNode, targetFolderNode);
      },
      [draggedFileNode, finishDraggingProjectFile, moveProjectFileToFolder]
    );

    const toggleNode = React.useCallback((node: ProjectFileNode) => {
      setOpenedNodeIds(openedNodeIds =>
        openedNodeIds.includes(node.id)
          ? openedNodeIds.filter(openedNodeId => openedNodeId !== node.id)
          : [...openedNodeIds, node.id]
      );
    }, []);

    const selectNode = React.useCallback(
      (node: ProjectFileNode) => {
        if (!shouldSelectProjectFileNode(node)) return;
        onSelectProjectFile(makeSelectionForNode(node));
      },
      [makeSelectionForNode, onSelectProjectFile]
    );

    const openNode = React.useCallback(
      (node: ProjectFileNode) => {
        if (node.type === 'folder') {
          toggleNode(node);
          return;
        }
        if (shell) shell.openPath(node.absolutePath);
      },
      [toggleNode]
    );

    const openProjectFolder = React.useCallback(
      () => {
        const projectRoot = getProjectRootPath(project);
        if (shell && projectRoot) shell.openPath(projectRoot);
      },
      [project]
    );

    const updateTreeWidth = React.useCallback((treeWidth: number) => {
      setTreeWidth(treeWidth);
      persistTreeWidth(treeWidth);
    }, []);

    const startTreeResize = React.useCallback(
      (event: SyntheticMouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        const content = contentRef.current;
        if (!content) return;
        const bounds = content.getBoundingClientRect();

        const onMouseMove = (event: MouseEvent) => {
          updateTreeWidth(
            clamp(
              event.clientX - bounds.left,
              minTreeWidth,
              Math.max(minTreeWidth, bounds.width - minThumbnailsWidth)
            )
          );
        };
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      },
      [updateTreeWidth]
    );

    const openContextMenu = React.useCallback(
      (event: SyntheticMouseEvent<HTMLDivElement>, node: ProjectFileNode) => {
        event.preventDefault();
        event.stopPropagation();
        selectNode(node);
        if (contextMenu.current) {
          contextMenu.current.open(event.clientX, event.clientY, { node });
        }
      },
      [selectNode]
    );

    const buildContextMenu = React.useCallback(
      (
        i18n: I18nType,
        options: { node: ProjectFileNode }
      ): Array<MenuItemTemplate> => {
        const node = options.node;
        if (!node) return [];

        return [
          {
            label: i18n._(t`View properties`),
            click: () => viewPropertiesForNode(node),
          },
          { type: 'separator' },
          {
            label: i18n._(t`Create folder`),
            click: () => openFolderDialogForNode(node),
          },
          {
            label: i18n._(t`New Markdown`),
            click: () => openMarkdownDialogForNode(node),
          },
          { type: 'separator' },
          {
            label:
              node.type === 'folder'
                ? i18n._(t`Delete folder`)
                : i18n._(t`Delete file`),
            enabled:
              node.type === 'file' ||
              (node.type === 'folder' && canDeleteProjectFolder(node)),
            click: () => {
              if (node.type === 'folder') {
                deleteProjectFolder(node);
                return;
              }

              deleteProjectFile(node);
            },
          },
        ];
      },
      [
        deleteProjectFolder,
        deleteProjectFile,
        openFolderDialogForNode,
        openMarkdownDialogForNode,
        viewPropertiesForNode,
      ]
    );

    const searchTextLowerCase = searchText.trim().toLowerCase();

    const nodeMatchesSearch = React.useCallback(
      (node: ProjectFileNode): boolean => {
        if (!searchTextLowerCase) return true;
        return (
          node.name.toLowerCase().includes(searchTextLowerCase) ||
          node.relativePath.toLowerCase().includes(searchTextLowerCase) ||
          (!!node.resourceName &&
            node.resourceName.toLowerCase().includes(searchTextLowerCase))
        );
      },
      [searchTextLowerCase]
    );

    const shouldDisplayNode: ProjectFileNode => boolean = React.useCallback(
      (node: ProjectFileNode): boolean => {
        if (!searchTextLowerCase) return true;
        if (nodeMatchesSearch(node)) return true;
        return !!(
          node.children && node.children.some(child => shouldDisplayNode(child))
        );
      },
      [nodeMatchesSearch, searchTextLowerCase]
    );

    const renderNode: (
      ProjectFileNode,
      number
    ) => React.Node = React.useCallback(
      (node: ProjectFileNode, depth: number): React.Node => {
        if (!shouldDisplayNode(node)) return null;

        const isSelected =
          !!selectedItem &&
          selectedItem.node.id === node.id &&
          shouldSelectProjectFileNode(node);
        const isDropTarget =
          node.type === 'folder' && dropTargetFolderNodeId === node.id;
        const hasChildren = !!node.children && node.children.length > 0;
        const isOpened =
          !!searchTextLowerCase || openedNodeIds.includes(node.id);
        const visibleChildren = node.children
          ? node.children.filter(shouldDisplayNode)
          : [];
        const rowBackgroundColor = isSelected
          ? theme.listItem.selectedBackgroundColor
          : undefined;
        const rowColor = isSelected
          ? theme.listItem.selectedTextColor
          : theme.text.color.primary;
        const registrationBadge =
          node.type === 'file' && node.resourceName ? (
            <span
              style={{
                ...styles.badge,
                ...styles.registeredBadge,
              }}
              title={`Registered as ${node.resourceName}`}
            >
              <Trans>Registered</Trans>
            </span>
          ) : null;

        return (
          <React.Fragment key={node.id}>
            <div
              style={{
                ...styles.row,
                ...(isDropTarget ? styles.rowDropTarget : undefined),
                paddingLeft: depth * 14,
                backgroundColor: rowBackgroundColor,
                color: rowColor,
              }}
              draggable={node.type === 'file'}
              onDragStart={event => startDraggingProjectFile(event, node)}
              onDragEnd={finishDraggingProjectFile}
              onDragOver={event => {
                if (node.type === 'folder') handleFolderDragOver(event, node);
              }}
              onDragLeave={event => {
                if (node.type === 'folder') handleFolderDragLeave(event, node);
              }}
              onDrop={event => {
                if (node.type === 'folder') handleFolderDrop(event, node);
              }}
              onClick={() => selectNode(node)}
              onDoubleClick={() => openNode(node)}
              onContextMenu={event => openContextMenu(event, node)}
              title={node.relativePath || node.absolutePath}
            >
              <div
                style={styles.disclosure}
                onClick={event => {
                  event.stopPropagation();
                  if (hasChildren) toggleNode(node);
                }}
              >
                {hasChildren ? (
                  isOpened ? (
                    <ChevronArrowBottom />
                  ) : (
                    <ChevronArrowRight />
                  )
                ) : null}
              </div>
              <span style={styles.icon}>{getIconForNode(node)}</span>
              <span style={styles.name}>{node.name}</span>
              {registrationBadge}
              {!!searchTextLowerCase && !!node.relativePath && (
                <span style={styles.path}>{node.relativePath}</span>
              )}
            </div>
            {hasChildren && isOpened
              ? visibleChildren.map(child => renderNode(child, depth + 1))
              : null}
          </React.Fragment>
        );
      },
      [
        openedNodeIds,
        dropTargetFolderNodeId,
        finishDraggingProjectFile,
        handleFolderDragLeave,
        handleFolderDragOver,
        handleFolderDrop,
        openContextMenu,
        openNode,
        searchTextLowerCase,
        selectNode,
        selectedItem,
        shouldDisplayNode,
        startDraggingProjectFile,
        theme,
        toggleNode,
      ]
    );

    const activeFolderNode = React.useMemo(
      (): ?ProjectFileNode => {
        if (!rootNode) return null;
        if (!selectedItem) return rootNode;
        if (selectedItem.node.type === 'folder') return selectedItem.node;
        return (
          findParentNodeByAbsolutePath(
            rootNode,
            selectedItem.node.absolutePath
          ) || rootNode
        );
      },
      [rootNode, selectedItem]
    );

    const thumbnailNodes = React.useMemo(
      (): Array<ProjectFileNode> => {
        if (!activeFolderNode || !activeFolderNode.children) return [];
        return activeFolderNode.children.filter(shouldDisplayNode);
      },
      [activeFolderNode, shouldDisplayNode]
    );

    const renderThumbnailPreview = React.useCallback(
      (node: ProjectFileNode): React.Node => {
        if (isImageFile(node)) {
          return (
            <img
              src={getFileUrl(node.absolutePath)}
              alt={node.name}
              draggable="false"
              style={styles.thumbnailImage}
            />
          );
        }

        const iconStyle = {
          width: 56,
          height: 56,
        };
        if (node.type === 'folder') return <FolderIcon style={iconStyle} />;
        if (isAudioFile(node)) return <MusicIcon style={iconStyle} />;
        if (isVideoFile(node)) return <VideoIcon style={iconStyle} />;
        if (isMarkdownFile(node) || isTextLikeFile(node)) {
          return <FileWithLines style={iconStyle} />;
        }
        return <FileIcon style={iconStyle} />;
      },
      []
    );

    const renderThumbnailNode = React.useCallback(
      (node: ProjectFileNode): React.Node => {
        const isSelected =
          !!selectedItem &&
          selectedItem.node.id === node.id &&
          shouldSelectProjectFileNode(node);
        const isDropTarget =
          node.type === 'folder' && dropTargetFolderNodeId === node.id;
        const rowColor = isSelected
          ? theme.listItem.selectedTextColor
          : theme.text.color.primary;
        const registrationBadge =
          node.type === 'file' && node.resourceName ? (
            <span
              style={{
                ...styles.badge,
                ...styles.thumbnailBadge,
                ...styles.registeredBadge,
              }}
              title={`Registered as ${node.resourceName}`}
            >
              <Trans>Registered</Trans>
            </span>
          ) : null;

        return (
          <div
            key={node.id}
            style={{
              ...styles.thumbnailCard,
              ...(isDropTarget ? styles.thumbnailDropTarget : undefined),
              backgroundColor: isSelected
                ? theme.listItem.selectedBackgroundColor
                : theme.paper.backgroundColor.dark,
              color: rowColor,
              borderColor: isSelected
                ? theme.palette.secondary
                : 'rgba(128, 128, 128, 0.24)',
            }}
            draggable={node.type === 'file'}
            onDragStart={event => startDraggingProjectFile(event, node)}
            onDragEnd={finishDraggingProjectFile}
            onDragOver={event => {
              if (node.type === 'folder') handleFolderDragOver(event, node);
            }}
            onDragLeave={event => {
              if (node.type === 'folder') handleFolderDragLeave(event, node);
            }}
            onDrop={event => {
              if (node.type === 'folder') handleFolderDrop(event, node);
            }}
            onClick={() => selectNode(node)}
            onDoubleClick={() => openNode(node)}
            onContextMenu={event => openContextMenu(event, node)}
            title={node.relativePath || node.absolutePath}
          >
            <div
              style={{
                ...styles.thumbnailPreview,
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
              }}
            >
              {renderThumbnailPreview(node)}
              {registrationBadge}
            </div>
            <div style={styles.thumbnailFooter}>
              <div style={styles.thumbnailName}>
                <Text noMargin>{node.name}</Text>
              </div>
            </div>
          </div>
        );
      },
      [
        dropTargetFolderNodeId,
        finishDraggingProjectFile,
        handleFolderDragLeave,
        handleFolderDragOver,
        handleFolderDrop,
        openContextMenu,
        openNode,
        renderThumbnailPreview,
        selectNode,
        selectedItem,
        startDraggingProjectFile,
        theme,
      ]
    );

    if (!canBrowseProjectFiles) {
      return (
        <Background>
          <div style={styles.header}>
            <Text noMargin>
              <Trans>Project files</Trans>
            </Text>
          </div>
          <PlaceholderMessage>
            <Text>
              <Trans>
                Project file browsing is available for local projects saved on
                disk.
              </Trans>
            </Text>
          </PlaceholderMessage>
        </Background>
      );
    }

    return (
      <Background>
        <div style={styles.header}>
          <Text noMargin>
            <Trans>Project files</Trans>
          </Text>
          <MiniToolbar noPadding>
            <IconButton
              size="small"
              onClick={openProjectFolder}
              tooltip={t`Open the project folder`}
            >
              <FolderIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                refresh();
              }}
              tooltip={t`Refresh project files`}
            >
              <RefreshIcon />
            </IconButton>
          </MiniToolbar>
        </div>
        <SearchBar
          value={searchText}
          onRequestSearch={() => {}}
          onChange={setSearchText}
          placeholder={t`Search project files`}
        />
        {isTruncated && (
          <MiniToolbar>
            <MiniToolbarText firstChild>
              <Trans>Only the first project files are shown.</Trans>
            </MiniToolbarText>
          </MiniToolbar>
        )}
        {isLoading ? (
          <PlaceholderLoader />
        ) : error ? (
          <PlaceholderMessage>
            <Text>{error}</Text>
          </PlaceholderMessage>
        ) : rootNode ? (
          <div
            style={styles.content}
            ref={contentRef}
            onContextMenu={event =>
              openContextMenu(event, activeFolderNode || rootNode)
            }
          >
            <div
              style={{
                ...styles.treePane,
                flex: `0 0 ${treeWidth}px`,
              }}
            >
              <div style={styles.scrollContainer}>
                {renderNode(rootNode, 0)}
              </div>
            </div>
            <div
              style={styles.treeResizeHandle}
              onMouseDown={startTreeResize}
            />
            <div style={styles.thumbnailsPane}>
              <div style={styles.thumbnailsHeader}>
                <Text noMargin style={{ overflowWrap: 'anywhere' }}>
                  {activeFolderNode
                    ? activeFolderNode.relativePath || activeFolderNode.name
                    : rootNode.name}
                </Text>
              </div>
              {thumbnailNodes.length ? (
                <div style={styles.thumbnailsGrid}>
                  {thumbnailNodes.map(renderThumbnailNode)}
                </div>
              ) : (
                <div style={styles.emptyFolderState}>
                  <Text noMargin color="secondary">
                    {searchTextLowerCase ? (
                      <Trans>No project files match the current search.</Trans>
                    ) : (
                      <Trans>No files here</Trans>
                    )}
                  </Text>
                </div>
              )}
            </div>
          </div>
        ) : (
          <PlaceholderMessage>
            <Text>
              <Trans>No project files found.</Trans>
            </Text>
          </PlaceholderMessage>
        )}
        <MarkdownFileNameDialog
          open={isMarkdownDialogOpen}
          error={markdownCreationError}
          onCancel={() => {
            setMarkdownCreationError(null);
            setMarkdownCreationTargetNode(null);
            setIsMarkdownDialogOpen(false);
          }}
          onCreate={createMarkdownFile}
        />
        <FolderNameDialog
          open={isFolderDialogOpen}
          error={folderCreationError}
          onCancel={() => {
            setFolderCreationError(null);
            setFolderCreationTargetNode(null);
            setIsFolderDialogOpen(false);
          }}
          onCreate={createFolder}
        />
        <ContextMenu ref={contextMenu} buildMenuTemplate={buildContextMenu} />
      </Background>
    );
  }
);

export default ProjectFilesPanel;
