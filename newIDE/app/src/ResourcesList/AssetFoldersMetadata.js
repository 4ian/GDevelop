// @flow

export const ASSET_FOLDERS_METADATA_EXTENSION_NAME = 'GDevelopEditor';
export const ASSET_FOLDERS_METADATA_PROPERTY_NAME = 'assetFolders';
export const ASSET_FOLDERS_METADATA_VERSION = 1;

export type AssetFolder = {|
  id: string,
  name: string,
  childFolderIds: Array<string>,
  resourceGuids: Array<string>,
|};

export type AssetFoldersMetadata = {|
  version: number,
  rootFolderIds: Array<string>,
  folders: Array<AssetFolder>,
|};

const asArray = (value: any): Array<any> => (Array.isArray(value) ? value : []);
const asString = (value: any): string => (typeof value === 'string' ? value : '');
const asNumber = (value: any): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const uniquePreserveOrder = (values: Array<string>): Array<string> => {
  const seen = new Set();
  const result = [];
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
};

export const createRandomId = (prefix: string): string =>
  `${prefix}-${Math.random()
    .toString(36)
    .slice(2, 8)}${Date.now().toString(36).slice(-4)}`;

export const createDefaultAssetFoldersMetadata =
  (): AssetFoldersMetadata => ({
    version: ASSET_FOLDERS_METADATA_VERSION,
    rootFolderIds: [],
    folders: [],
  });

export const sanitizeAssetFoldersMetadata = (
  rawMetadata: any,
  resourceGuidSet?: ?Set<string>
): AssetFoldersMetadata => {
  const rawFolders = asArray(rawMetadata && rawMetadata.folders)
    .map(folder => {
      const id = asString(folder && folder.id);
      if (!id) return null;
      return {
        id,
        name: asString(folder.name) || id,
        childFolderIds: uniquePreserveOrder(
          asArray(folder.childFolderIds).map(asString).filter(Boolean)
        ),
        resourceGuids: uniquePreserveOrder(
          asArray(folder.resourceGuids).map(asString).filter(Boolean)
        ),
      };
    })
    .filter(Boolean);

  const folderIds = new Set();
  rawFolders.forEach(folder => {
    folderIds.add(folder.id);
  });

  const rootFolderIds = uniquePreserveOrder(
    asArray(rawMetadata && rawMetadata.rootFolderIds)
      .map(asString)
      .filter(Boolean)
  ).filter(id => folderIds.has(id));

  const assignedGuids = new Set();
  const sanitizedFolders = rawFolders.map(folder => {
    const filteredChildFolderIds = uniquePreserveOrder(folder.childFolderIds)
      .filter(childId => childId !== folder.id && folderIds.has(childId));

    const filteredResourceGuids = uniquePreserveOrder(folder.resourceGuids)
      .filter(guid => {
        if (resourceGuidSet && !resourceGuidSet.has(guid)) return false;
        if (assignedGuids.has(guid)) return false;
        assignedGuids.add(guid);
        return true;
      });

    return {
      ...folder,
      childFolderIds: filteredChildFolderIds,
      resourceGuids: filteredResourceGuids,
    };
  });

  return {
    version:
      asNumber(rawMetadata && rawMetadata.version) ||
      ASSET_FOLDERS_METADATA_VERSION,
    rootFolderIds,
    folders: sanitizedFolders,
  };
};

export const loadAssetFoldersMetadata = (
  project: gdProject,
  resourceGuidSet?: ?Set<string>
): AssetFoldersMetadata => {
  try {
    const rawValue = project
      .getExtensionProperties()
      .getValue(
        ASSET_FOLDERS_METADATA_EXTENSION_NAME,
        ASSET_FOLDERS_METADATA_PROPERTY_NAME
      );
    if (!rawValue) return createDefaultAssetFoldersMetadata();
    const parsed = JSON.parse(rawValue);
    return sanitizeAssetFoldersMetadata(parsed, resourceGuidSet);
  } catch (error) {
    return createDefaultAssetFoldersMetadata();
  }
};

export const saveAssetFoldersMetadata = (
  project: gdProject,
  metadata: AssetFoldersMetadata
): void => {
  project
    .getExtensionProperties()
    .setValue(
      ASSET_FOLDERS_METADATA_EXTENSION_NAME,
      ASSET_FOLDERS_METADATA_PROPERTY_NAME,
      JSON.stringify(metadata)
    );
};
