// @flow

import newNameGenerator from '../Utils/NewNameGenerator';

export const insertNewEventsBasedBehavior = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): gdEventsBasedBehavior => {
  const eventsBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
  const name = newNameGenerator('MyBehavior', tentativeName =>
    eventsBasedBehaviors.has(tentativeName)
  );
  const eventsBasedBehavior = eventsBasedBehaviors.insertNew(
    name,
    eventsBasedBehaviors.getCount()
  );
  eventsBasedBehavior.setFullName(name);
  return eventsBasedBehavior;
};
