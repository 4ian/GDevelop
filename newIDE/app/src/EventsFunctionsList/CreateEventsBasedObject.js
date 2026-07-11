// @flow

import newNameGenerator from '../Utils/NewNameGenerator';

export const insertNewEventsBasedObject = ({
  eventsFunctionsExtension,
  isRenderedIn3D,
}: {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  isRenderedIn3D: boolean,
|}): gdEventsBasedObject => {
  const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
  const name = newNameGenerator('MyObject', tentativeName =>
    eventsBasedObjects.has(tentativeName)
  );
  const eventsBasedObject = eventsBasedObjects.insertNew(
    name,
    eventsBasedObjects.getCount()
  );
  // Keep the display name aligned with the generated identifier so the first
  // inline rename updates both values and extension metadata is searchable.
  eventsBasedObject.setFullName(name);
  eventsBasedObject.markAsRenderedIn3D(isRenderedIn3D);
  return eventsBasedObject;
};
