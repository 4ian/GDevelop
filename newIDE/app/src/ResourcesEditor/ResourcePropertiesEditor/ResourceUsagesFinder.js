// @flow
const gd: libGDevelop = global.gd;

export type ResourceObjectUsage =
  | {|
      kind: 'global',
      objectName: string,
      object: gdObject,
    |}
  | {|
      kind: 'scene',
      sceneName: string,
      objectName: string,
      object: gdObject,
    |}
  | {|
      kind: 'custom-object',
      extensionName: string,
      extensionFullName: string,
      eventsBasedObjectName: string,
      eventsBasedObjectFullName: string,
      variantName: string,
      objectName: string,
      object: gdObject,
    |};

const getObjectNamesUsingResourceInContainer = (
  resourcesManager: gdResourcesContainer,
  objectsContainer: gdObjectsContainer,
  resourceName: string
): Array<string> => {
  const objectsCollector = new gd.ObjectsUsingResourceCollector(
    resourcesManager,
    resourceName
  );
  try {
    objectsCollector.launch(objectsContainer);
    return objectsCollector.getObjectNames().toJSArray();
  } finally {
    objectsCollector.delete();
  }
};

export const findResourceObjectUsages = (
  project: gdProject,
  resourceName: string
): Array<ResourceObjectUsage> => {
  if (!resourceName) return [];

  const resourcesManager = project.getResourcesManager();
  const usages: Array<ResourceObjectUsage> = [];

  // 1. Global objects
  const globalObjects = project.getObjects();
  const globalObjectNames = getObjectNamesUsingResourceInContainer(
    resourcesManager,
    globalObjects,
    resourceName
  );
  for (const objectName of globalObjectNames) {
    if (globalObjects.hasObjectNamed(objectName)) {
      usages.push({
        kind: 'global',
        objectName,
        object: globalObjects.getObject(objectName),
      });
    }
  }

  // 2. Scene objects
  const layoutsCount = project.getLayoutsCount();
  for (let i = 0; i < layoutsCount; i++) {
    const layout = project.getLayoutAt(i);
    const sceneName = layout.getName();
    const layoutObjects = layout.getObjects();
    const layoutObjectNames = getObjectNamesUsingResourceInContainer(
      resourcesManager,
      layoutObjects,
      resourceName
    );
    for (const objectName of layoutObjectNames) {
      if (layoutObjects.hasObjectNamed(objectName)) {
        usages.push({
          kind: 'scene',
          sceneName,
          objectName,
          object: layoutObjects.getObject(objectName),
        });
      }
    }
  }

  // 3. Custom objects (events-based objects and their variants)
  const extensionsCount = project.getEventsFunctionsExtensionsCount();
  for (let e = 0; e < extensionsCount; e++) {
    const extension = project.getEventsFunctionsExtensionAt(e);
    const extensionName = extension.getName();
    const extensionFullName = extension.getFullName() || extensionName;
    const eventsBasedObjects = extension.getEventsBasedObjects();
    const eventsBasedObjectsCount = eventsBasedObjects.getCount();

    for (let o = 0; o < eventsBasedObjectsCount; o++) {
      const eventsBasedObject = eventsBasedObjects.getAt(o);
      const eventsBasedObjectName = eventsBasedObject.getName();
      const eventsBasedObjectFullName =
        eventsBasedObject.getFullName() || eventsBasedObjectName;

      const defaultObjects = eventsBasedObject.getObjects();
      const defaultObjectNames = getObjectNamesUsingResourceInContainer(
        resourcesManager,
        defaultObjects,
        resourceName
      );
      for (const objectName of defaultObjectNames) {
        if (defaultObjects.hasObjectNamed(objectName)) {
          usages.push({
            kind: 'custom-object',
            extensionName,
            extensionFullName,
            eventsBasedObjectName,
            eventsBasedObjectFullName,
            variantName: '',
            objectName,
            object: defaultObjects.getObject(objectName),
          });
        }
      }

      const variants = eventsBasedObject.getVariants();
      const variantsCount = variants.getVariantsCount();
      for (let v = 0; v < variantsCount; v++) {
        const variant = variants.getVariantAt(v);
        const variantName = variant.getName();
        const variantObjects = variant.getObjects();
        const variantObjectNames = getObjectNamesUsingResourceInContainer(
          resourcesManager,
          variantObjects,
          resourceName
        );
        for (const objectName of variantObjectNames) {
          if (variantObjects.hasObjectNamed(objectName)) {
            usages.push({
              kind: 'custom-object',
              extensionName,
              extensionFullName,
              eventsBasedObjectName,
              eventsBasedObjectFullName,
              variantName,
              objectName,
              object: variantObjects.getObject(objectName),
            });
          }
        }
      }
    }
  }

  return usages;
};
