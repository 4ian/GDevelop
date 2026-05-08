// @flow
import * as React from 'react';
import { ObjectStoreContext } from '../AssetStore/ObjectStoreContext';
import { type ObjectShortHeader } from '../Utils/GDevelopServices/Extension';

/**
 * Returns a synchronous accessor for the `ObjectShortHeader` of a given full
 * object type (e.g. `"Sprite"`, `"StarRatingBar::StarRatingBar"`).
 *
 * Headers come from the remote extension/object registry pre-fetched by
 * `ObjectStoreStateProvider`, so this works even for object types whose
 * extension is not yet installed in the project. Returns `null` if the
 * registry has not loaded yet (cold start) or if the type is unknown.
 */
export const useGetObjectShortHeader = (): ((
  objectType: string
) => ?ObjectShortHeader) => {
  const { translatedObjectShortHeadersByType, fetchObjects } = React.useContext(
    ObjectStoreContext
  );
  React.useEffect(
    () => {
      fetchObjects();
    },
    [fetchObjects]
  );
  return React.useCallback(
    (objectType: string): ?ObjectShortHeader =>
      translatedObjectShortHeadersByType[objectType] || null,
    [translatedObjectShortHeadersByType]
  );
};
