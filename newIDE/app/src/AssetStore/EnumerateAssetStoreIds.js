// @flow

import { mapFor } from '../Utils/MapFor';

const enumerateObjectsContainerAssetStoreIds = (
  objectsContainer: gdObjectsContainer
): Set<string> => {
  const assetStoreIds = new Set<string>();
  mapFor(0, objectsContainer.getObjectsCount(), i => {
    const assetStoreId = objectsContainer.getObjectAt(i).getAssetStoreId();
    if (assetStoreId) assetStoreIds.add(assetStoreId);
  });

  return assetStoreIds;
};

export const enumerateAssetStoreIds = (
  project: gdProject,
  objectsContainer: ?gdObjectsContainer
): Set<string> => {
  // Add asset store ids of global objects.
  let allAssetStoreIds = enumerateObjectsContainerAssetStoreIds(project);

  if (objectsContainer) {
    // Add either the asset store ids of the specified objects container (i.e: a single scene)...
    const objectsContainerAssetStoreIds = enumerateObjectsContainerAssetStoreIds(
      objectsContainer
    );
    allAssetStoreIds = new Set([
      ...allAssetStoreIds,
      ...objectsContainerAssetStoreIds,
    ]);
  } else {
    // Or the asset store ids of all the objects of all the scenes of the project.
    mapFor(0, project.getLayoutsCount(), i => {
      const scene = project.getLayoutAt(i);

      allAssetStoreIds = new Set([
        ...allAssetStoreIds,
        ...enumerateObjectsContainerAssetStoreIds(scene),
      ]);
    });
  }

  return allAssetStoreIds;
};
