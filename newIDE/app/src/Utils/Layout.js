// @flow
const gd: libGDevelop = global.gd;

export const getInstancesInLayoutForObject = (
  layout: gdLayout,
  objectName: string
): Array<gdInitialInstance> => {
  const instances = layout.getInitialInstances();
  if (instances.getInstancesCount() === 0) return [];
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
  instances.iterateOverInstances(instanceGetter);

  return objectInstances;
};

export const getInstanceCountInLayoutForObject = (
  layout: gdLayout,
  objectName: string
): number => {
  return getInstancesInLayoutForObject(layout, objectName).length;
};
