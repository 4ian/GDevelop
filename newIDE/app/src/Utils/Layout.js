// @flow
const gd: libGDevelop = global.gd;

export const getInstanceInLayoutWithPersistentUuid = (
  initialInstancesContainer: gdInitialInstancesContainer,
  persistentUuid: string
): gdInitialInstance | null => {
  if (initialInstancesContainer.getInstancesCount() === 0) return null;
  let matchingInstance = null;
  const instanceGetter = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe[incompatible-type] - invoke is not writable
  // $FlowFixMe[cannot-write]
  instanceGetter.invoke = instancePtr => {
    // $FlowFixMe[incompatible-type] - wrapPointer is not exposed
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type]
      instancePtr,
      gd.InitialInstance
    );
    if (instance.getPersistentUuid() === persistentUuid) {
      matchingInstance = instance;
    }
  };
  // $FlowFixMe[incompatible-type] - JSFunctor is incompatible with Functor
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
  // $FlowFixMe[incompatible-type] - invoke is not writable
  // $FlowFixMe[cannot-write]
  instanceGetter.invoke = instancePtr => {
    // $FlowFixMe[incompatible-type] - wrapPointer is not exposed
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type]
      instancePtr,
      gd.InitialInstance
    );
    if (instance.getObjectName() === objectName) {
      objectInstances.push(instance);
    }
  };
  // $FlowFixMe[incompatible-type] - JSFunctor is incompatible with Functor
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
  // $FlowFixMe[incompatible-type] - invoke is not writable
  // $FlowFixMe[cannot-write]
  instanceGetter.invoke = instancePtr => {
    // $FlowFixMe[incompatible-type] - wrapPointer is not exposed
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type]
      instancePtr,
      gd.InitialInstance
    );
    if (instance.getLayer() === layerName) {
      objectInstances.push(instance);
    }
  };
  // $FlowFixMe[incompatible-type] - JSFunctor is incompatible with Functor
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
