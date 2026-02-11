// @flow
const gd: libGDevelop = global.gd;

export const getInstanceInLayoutWithPersistentUuid = (
  initialInstancesContainer: gdInitialInstancesContainer,
  persistentUuid: string
): gdInitialInstance | null => {
  if (initialInstancesContainer.getInstancesCount() === 0) return null;
  let matchingInstance = null;
  const instanceGetter = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe - invoke is not writable
  instanceGetter.invoke = instancePtr => {
    // $FlowFixMe - wrapPointer is not exposed
    const instance: gdInitialInstance = gd.wrapPointer(
      instancePtr,
      gd.InitialInstance
    );
    if (instance.getPersistentUuid() === persistentUuid) {
      matchingInstance = instance;
    }
  };
  // $FlowFixMe - JSFunctor is incompatible with Functor
  initialInstancesContainer.iterateOverInstances(instanceGetter);
  instanceGetter.delete();
  return matchingInstance;
};

export const getInstancesInLayoutForObject = (
  initialInstancesContainer: gdInitialInstancesContainer,
  objectName: string
): Array<gdInitialInstance> => {
  if (initialInstancesContainer.getInstancesCount() === 0) return [];
  const objectInstances = [];
  const instanceGetter = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe - invoke is not writable
  instanceGetter.invoke = instancePtr => {
    // $FlowFixMe - wrapPointer is not exposed
    const instance: gdInitialInstance = gd.wrapPointer(
      instancePtr,
      gd.InitialInstance
    );
    if (instance.getObjectName() === objectName) {
      objectInstances.push(instance);
    }
  };
  // $FlowFixMe - JSFunctor is incompatible with Functor
  initialInstancesContainer.iterateOverInstances(instanceGetter);
  instanceGetter.delete();
  return objectInstances;
};

export const getInstancesInLayoutForLayer = (
  initialInstancesContainer: gdInitialInstancesContainer,
  layerName: string
): Array<gdInitialInstance> => {
  if (initialInstancesContainer.getInstancesCount() === 0) return [];
  const objectInstances = [];
  const instanceGetter = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe - invoke is not writable
  instanceGetter.invoke = instancePtr => {
    // $FlowFixMe - wrapPointer is not exposed
    const instance: gdInitialInstance = gd.wrapPointer(
      instancePtr,
      gd.InitialInstance
    );
    if (instance.getLayer() === layerName) {
      objectInstances.push(instance);
    }
  };
  // $FlowFixMe - JSFunctor is incompatible with Functor
  initialInstancesContainer.iterateOverInstances(instanceGetter);
  instanceGetter.delete();
  return objectInstances;
};

export const getInstanceCountInLayoutForObject = (
  initialInstancesContainer: gdInitialInstancesContainer,
  objectName: string
): number => {
  return getInstancesInLayoutForObject(initialInstancesContainer, objectName)
    .length;
};
