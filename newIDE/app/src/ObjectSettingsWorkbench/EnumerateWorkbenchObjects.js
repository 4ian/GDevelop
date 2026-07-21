// @flow
import { mapFor } from '../Utils/MapFor';

const gd: libGDevelop = global.gd;

export type ObjectOriginScope = 'scene' | 'global' | 'prefab';

/** Editor-only ownership metadata. It is deliberately separate from the
 * serialized object model and from ObjectsList's legacy `global` boolean. */
export type WorkbenchObject = {|
  key: string,
  objectName: string,
  objectType: string,
  object: gdObject,
  scope: ObjectOriginScope,
  ownerName: string,
  layout: gdLayout | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
|};

export const getWorkbenchObjectKey = (item: WorkbenchObject): string =>
  item.key;

export const getObjectOriginLabel = (item: WorkbenchObject): string => {
  if (item.scope === 'global') return 'Global';
  return `${item.scope === 'scene' ? 'Scene' : 'Prefab'} · ${item.ownerName}`;
};

export const getObjectOriginShortLabel = (item: WorkbenchObject): string =>
  item.scope === 'global'
    ? 'Global'
    : item.scope === 'scene'
    ? 'Scene'
    : 'Prefab';

export const getObjectOriginTooltip = (item: WorkbenchObject): string =>
  item.scope === 'global'
    ? 'Defined globally'
    : item.scope === 'scene'
    ? `Defined in scene ${item.ownerName}`
    : `Defined in prefab ${item.ownerName}`;

export const getWorkbenchObjectTypeLabel = (
  project: gdProject,
  object: gdObject
): string => getWorkbenchObjectTypeLabelFromType(project, object.getType());

export const getWorkbenchObjectTypeLabelFromType = (
  project: gdProject,
  objectType: string
): string => {
  const metadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    objectType
  );
  if (!metadata || gd.MetadataProvider.isBadObjectMetadata(metadata)) {
    return objectType;
  }
  return metadata.getFullName() || metadata.getName() || objectType;
};

export const getWorkbenchObjectIconUrl = (
  project: gdProject,
  object: gdObject
): string => getWorkbenchObjectIconUrlFromType(project, object.getType());

export const getWorkbenchObjectIconUrlFromType = (
  project: gdProject,
  objectType: string
): string => {
  const metadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    objectType
  );
  return metadata && !gd.MetadataProvider.isBadObjectMetadata(metadata)
    ? metadata.getIconFilename()
    : '';
};

/**
 * Build the effective, ungrouped object collection shown by Object Settings.
 * Scene definitions keep project/layout order. Globals shadowed by any scene
 * definition are omitted. Objects owned by prefabs are intentionally excluded:
 * this workbench only switches between objects that belong to a scene or to
 * the project globally.
 */
export const enumerateWorkbenchObjects = (
  project: gdProject
): Array<WorkbenchObject> => {
  const result: Array<WorkbenchObject> = [];
  const sceneObjectNames = new Set<string>();

  for (
    let layoutIndex = 0;
    layoutIndex < project.getLayoutsCount();
    layoutIndex++
  ) {
    const layout = project.getLayoutAt(layoutIndex);
    const objects = layout.getObjects();
    for (
      let objectIndex = 0;
      objectIndex < objects.getObjectsCount();
      objectIndex++
    ) {
      const object = objects.getObjectAt(objectIndex);
      const objectName = object.getName();
      sceneObjectNames.add(objectName);
      result.push({
        key: `scene:${layout.getName()}:${objectName}`,
        objectName,
        objectType: object.getType(),
        object,
        scope: 'scene',
        ownerName: layout.getName(),
        layout,
        eventsFunctionsExtension: null,
        eventsBasedObject: null,
      });
    }
  }

  const globalObjects = project.getObjects();
  mapFor(0, globalObjects.getObjectsCount(), objectIndex =>
    globalObjects.getObjectAt(objectIndex)
  ).forEach(object => {
    const objectName = object.getName();
    if (sceneObjectNames.has(objectName)) return;
    result.push({
      key: `global:${objectName}`,
      objectName,
      objectType: object.getType(),
      object,
      scope: 'global',
      ownerName: '',
      layout: null,
      eventsFunctionsExtension: null,
      eventsBasedObject: null,
    });
  });

  return result;
};

export const filterWorkbenchObjects = ({
  project,
  objects,
  query,
}: {|
  project: gdProject,
  objects: Array<WorkbenchObject>,
  query: string,
|}): Array<WorkbenchObject> => {
  // Keep this boundary defensive even though the standard enumeration already
  // excludes prefab children. Callers supplying a cached/custom collection
  // must not make prefab-owned objects searchable or keyboard-selectable.
  const selectableObjects = objects.filter(item => item.scope !== 'prefab');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return selectableObjects;

  return selectableObjects.filter(item =>
    [
      item.objectName,
      getWorkbenchObjectTypeLabelFromType(project, item.objectType),
      getObjectOriginLabel(item),
      item.ownerName,
      item.scope,
    ]
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalizedQuery)
  );
};
