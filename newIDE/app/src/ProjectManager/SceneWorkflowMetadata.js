// @flow

export const SCENE_WORKFLOW_METADATA_EXTENSION_NAME = 'GDevelopEditor';
export const SCENE_WORKFLOW_METADATA_PROPERTY_NAME = 'sceneWorkflowAndFolders';
export const SCENE_WORKFLOW_METADATA_VERSION = 1;

export type SceneWorkflowColumn = {|
  id: string,
  name: string,
  color: string,
  order: number,
|};

export type SceneWorkflowMetadata = {|
  version: number,
  workflow: {|
    columns: Array<SceneWorkflowColumn>,
    defaultColumnId: string,
  |},
  sceneStatus: { [sceneName: string]: {| columnId: string |} },
  sceneFolders: {|
    rootFolderIds: Array<string>,
    rootSceneNames: Array<string>,
    folders: Array<{|
      id: string,
      name: string,
      childFolderIds: Array<string>,
      sceneNames: Array<string>,
    |}>,
  |},
|};

const DEFAULT_COLUMNS: Array<SceneWorkflowColumn> = [
  { id: 'backlog', name: 'Backlog', color: '154;160;166', order: 0 },
  { id: 'in-progress', name: 'In progress', color: '91;141;239', order: 1 },
  { id: 'done', name: 'Done', color: '76;175;80', order: 2 },
];

const asArray = (value: any): Array<any> => (Array.isArray(value) ? value : []);
const asString = (value: any): string => (typeof value === 'string' ? value : '');
const asNumber = (value: any): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

export const createRandomId = (prefix: string): string =>
  `${prefix}-${Math.random()
    .toString(36)
    .slice(2, 8)}${Date.now().toString(36).slice(-4)}`;

export const createDefaultSceneWorkflowMetadata =
  (): SceneWorkflowMetadata => ({
    version: SCENE_WORKFLOW_METADATA_VERSION,
    workflow: {
      columns: DEFAULT_COLUMNS,
      defaultColumnId: DEFAULT_COLUMNS[0].id,
    },
    sceneStatus: {},
    sceneFolders: {
      rootFolderIds: [],
      rootSceneNames: [],
      folders: [],
    },
  });

const sanitizeColumns = (columns: Array<any>): Array<SceneWorkflowColumn> => {
  const sanitized = columns
    .map((column, index) => {
      const id = asString(column.id);
      if (!id) return null;
      return {
        id,
        name: asString(column.name) || id,
        color: asString(column.color) || DEFAULT_COLUMNS[0].color,
        order:
          typeof column.order === 'number' && Number.isFinite(column.order)
            ? column.order
            : index,
      };
    })
    .filter(Boolean);
  return sanitized.length ? sanitized : DEFAULT_COLUMNS;
};

export const sanitizeSceneWorkflowMetadata = (
  rawMetadata: any
): SceneWorkflowMetadata => {
  const workflow = rawMetadata && rawMetadata.workflow ? rawMetadata.workflow : {};
  const columns = sanitizeColumns(asArray(workflow.columns));
  const defaultColumnId = columns.find(
    column => column.id === asString(workflow.defaultColumnId)
  )
    ? asString(workflow.defaultColumnId)
    : columns[0].id;

  const sceneStatus = {};
  const rawSceneStatus = rawMetadata ? rawMetadata.sceneStatus : null;
  if (rawSceneStatus && typeof rawSceneStatus === 'object') {
    Object.keys(rawSceneStatus).forEach(sceneName => {
      const status = rawSceneStatus[sceneName];
      if (!status || typeof status !== 'object') return;
      const columnId = asString(status.columnId);
      if (!columnId) return;
      sceneStatus[sceneName] = { columnId };
    });
  }

  const rawSceneFolders = rawMetadata ? rawMetadata.sceneFolders : null;
  const rootFolderIds = asArray(
    rawSceneFolders && rawSceneFolders.rootFolderIds
  )
    .map(asString)
    .filter(Boolean);
  const rootSceneNames = asArray(
    rawSceneFolders && rawSceneFolders.rootSceneNames
  )
    .map(asString)
    .filter(Boolean);
  const folders = asArray(rawSceneFolders && rawSceneFolders.folders)
    .map(folder => {
      const id = asString(folder && folder.id);
      if (!id) return null;
      return {
        id,
        name: asString(folder.name) || id,
        childFolderIds: asArray(folder.childFolderIds)
          .map(asString)
          .filter(Boolean),
        sceneNames: asArray(folder.sceneNames)
          .map(asString)
          .filter(Boolean),
      };
    })
    .filter(Boolean);

  return {
    version: asNumber(rawMetadata && rawMetadata.version) ||
      SCENE_WORKFLOW_METADATA_VERSION,
    workflow: {
      columns,
      defaultColumnId,
    },
    sceneStatus,
    sceneFolders: {
      rootFolderIds,
      rootSceneNames,
      folders,
    },
  };
};

export const loadSceneWorkflowMetadata = (
  project: gdProject
): SceneWorkflowMetadata => {
  try {
    const rawValue = project
      .getExtensionProperties()
      .getValue(
        SCENE_WORKFLOW_METADATA_EXTENSION_NAME,
        SCENE_WORKFLOW_METADATA_PROPERTY_NAME
      );
    if (!rawValue) return createDefaultSceneWorkflowMetadata();
    const parsed = JSON.parse(rawValue);
    return sanitizeSceneWorkflowMetadata(parsed);
  } catch (error) {
    return createDefaultSceneWorkflowMetadata();
  }
};

export const saveSceneWorkflowMetadata = (
  project: gdProject,
  metadata: SceneWorkflowMetadata
): void => {
  project
    .getExtensionProperties()
    .setValue(
      SCENE_WORKFLOW_METADATA_EXTENSION_NAME,
      SCENE_WORKFLOW_METADATA_PROPERTY_NAME,
      JSON.stringify(metadata)
    );
};
