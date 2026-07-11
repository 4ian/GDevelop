// @flow

import { type CreateExtensionItemPayload } from './CreateEventsFunctionExtensionItemDialog';
import { initializeEventsFunctionDisplayName } from '../EventsFunctionsList/InitializeEventsFunction';

const gd: libGDevelop = global.gd;

export type CreatedExtensionItem =
  | {|
      itemKind: 'prefab',
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsBasedObject: gdEventsBasedObject,
    |}
  | {|
      itemKind: 'behavior',
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsBasedBehavior: gdEventsBasedBehavior,
    |}
  | {|
      itemKind: 'function',
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsFunction: gdEventsFunction,
    |};

type ReloadExtensionMetadata = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension
) => void;

export const createEventsFunctionExtensionItem = ({
  project,
  payload,
  reloadExtensionMetadata,
}: {|
  project: gdProject,
  payload: CreateExtensionItemPayload,
  reloadExtensionMetadata: ReloadExtensionMetadata,
|}): CreatedExtensionItem => {
  const eventsFunctionsExtension = payload.newExtensionName
    ? project.insertNewEventsFunctionsExtension(
        payload.newExtensionName,
        project.getEventsFunctionsExtensionsCount()
      )
    : project.getEventsFunctionsExtension(payload.extensionName);

  let createdItem: CreatedExtensionItem;
  if (payload.itemKind === 'prefab') {
    const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
    const eventsBasedObject = eventsBasedObjects.insertNew(
      payload.itemName,
      eventsBasedObjects.getCount()
    );
    eventsBasedObject.setFullName(payload.itemName);
    eventsBasedObject.markAsRenderedIn3D(
      payload.prefabObjectDimension === '3d'
    );
    createdItem = {
      itemKind: 'prefab',
      eventsFunctionsExtension,
      eventsBasedObject,
    };
  } else if (payload.itemKind === 'behavior') {
    const eventsBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
    const eventsBasedBehavior = eventsBasedBehaviors.insertNew(
      payload.itemName,
      eventsBasedBehaviors.getCount()
    );
    eventsBasedBehavior.setFullName(payload.itemName);
    createdItem = {
      itemKind: 'behavior',
      eventsFunctionsExtension,
      eventsBasedBehavior,
    };
  } else {
    const eventsFunctionsContainer = eventsFunctionsExtension.getEventsFunctions();
    const rootFolder = eventsFunctionsContainer.getRootFolder();
    const eventsFunction = eventsFunctionsContainer.insertNewEventsFunctionInFolder(
      payload.itemName,
      rootFolder,
      rootFolder.getChildrenCount()
    );
    eventsFunction.setFunctionType(payload.functionType);
    initializeEventsFunctionDisplayName(eventsFunction, payload.itemName);
    if (eventsFunction.isCondition() && !eventsFunction.isExpression()) {
      gd.PropertyFunctionGenerator.generateConditionSkeleton(
        project,
        eventsFunction
      );
    }
    createdItem = {
      itemKind: 'function',
      eventsFunctionsExtension,
      eventsFunction,
    };
  }

  // Searches use the generated platform extension metadata rather than the
  // mutable project model. Refresh it before this creation action returns.
  reloadExtensionMetadata(project, eventsFunctionsExtension);
  return createdItem;
};
