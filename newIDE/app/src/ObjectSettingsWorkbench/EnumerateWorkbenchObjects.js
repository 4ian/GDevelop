// @flow
import { mapFor } from '../Utils/MapFor';

const gd: libGDevelop = global.gd;

export type ObjectOriginScope = 'scene' | 'global' | 'prefab';

/** Editor-only ownership metadata. It is deliberately separate from the
 * serialized object model and from ObjectsList's legacy `global` boolean. */
export type WorkbenchObject = {|
  object: gdObject,
  scope: ObjectOriginScope,
  ownerName: string,
  layout: gdLayout | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
|};

export const getWorkbenchObjectKey = (item: WorkbenchObject): string =>
  `${item.scope}:${item.ownerName}:${item.object.ptr}`;

export const getObjectOriginLabel = (item: WorkbenchObject): string => {
  if (item.scope === 'global') return 'Global';
  return `${item.scope === 'scene' ? 'Scene' : 'Prefab'} · ${
    item.ownerName
  }`;
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
): string => {
  const metadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    object.getType()
  );
  if (!metadata || gd.MetadataProvider.isBadObjectMetadata(metadata)) {
    return object.getType();
  }
  return metadata.getFullName() || metadata.getName() || object.getType();
};

export const getWorkbenchObjectIconUrl = (
  project: gdProject,
  object: gdObject
): string => {
  const metadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    object.getType()
  );
  return metadata && !gd.MetadataProvider.isBadObjectMetadata(metadata)
    ? metadata.getIconFilename()
    : '';
};

/**
 * Build the effective, ungrouped object collection shown by Object Settings.
 * Scene definitions keep project/layout order. Globals shadowed by any scene
 * definition are omitted. Prefab children follow in extension/prefab order and
 * retain their definition owner rather than the scene instance using them.
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
      sceneObjectNames.add(object.getName());
      result.push({
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
    if (sceneObjectNames.has(object.getName())) return;
    result.push({
      object,
      scope: 'global',
      ownerName: '',
      layout: null,
      eventsFunctionsExtension: null,
      eventsBasedObject: null,
    });
  });

  for (
    let extensionIndex = 0;
    extensionIndex < project.getEventsFunctionsExtensionsCount();
    extensionIndex++
  ) {
    const eventsFunctionsExtension = project.getEventsFunctionsExtensionAt(
      extensionIndex
    );
    const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
    for (
      let prefabIndex = 0;
      prefabIndex < eventsBasedObjects.size();
      prefabIndex++
    ) {
      const eventsBasedObject = eventsBasedObjects.at(prefabIndex);
      const ownerName =
        eventsBasedObject.getFullName() || eventsBasedObject.getName();
      const objects = eventsBasedObject.getObjects();
      for (
        let objectIndex = 0;
        objectIndex < objects.getObjectsCount();
        objectIndex++
      ) {
        result.push({
          object: objects.getObjectAt(objectIndex),
          scope: 'prefab',
          ownerName,
          layout: null,
          eventsFunctionsExtension,
          eventsBasedObject,
        });
      }
    }
  }

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
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return objects;

  return objects.filter(item =>
    [
      item.object.getName(),
      getWorkbenchObjectTypeLabel(project, item.object),
      getObjectOriginLabel(item),
      item.ownerName,
      item.scope,
    ]
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalizedQuery)
  );
};
