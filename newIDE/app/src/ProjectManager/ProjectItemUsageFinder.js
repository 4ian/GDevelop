// @flow
import { renderInstructionSentenceAsPlainText } from '../EventsSheet/EventsTree/TextRenderer';
import { mapFor } from '../Utils/MapFor';
import type { EventPath } from '../Utils/EventPath';
import {
  getSceneLifecycleEvents,
  getSceneLifecycleFunctionDisplayName,
  sceneLifecycleFunctionDefinitions,
} from '../SceneContextLifecycleFunctions';

const gd: libGDevelop = global.gd;

const externalLayoutActionType =
  'BuiltinExternalLayouts::CreateObjectsFromExternalLayout';

export type ProjectItemUsageTarget =
  | {|
      kind: 'custom-object',
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsBasedObject: gdEventsBasedObject,
    |}
  | {|
      kind: 'custom-object-variant',
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsBasedObject: gdEventsBasedObject,
      variant: gdEventsBasedObjectVariant,
    |}
  | {|
      kind: 'events-based-behavior',
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsBasedBehavior: gdEventsBasedBehavior,
    |}
  | {|
      kind: 'events-function',
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsFunction: gdEventsFunction,
    |}
  | {|
      kind: 'external-events',
      externalEvents: gdExternalEvents,
    |}
  | {|
      kind: 'external-layout',
      externalLayout: gdExternalLayout,
    |};

export type ProjectItemUsage = {|
  id: string,
  location: string,
  details: string,
|};

export type ProjectItemEventUsage = {|
  ...ProjectItemUsage,
  eventPath: EventPath,
|};

export type ProjectItemUsageReport = {|
  relatedUsages: Array<ProjectItemUsage>,
  objectUsages: Array<ProjectItemUsage>,
  eventUsages: Array<ProjectItemEventUsage>,
|};

type EventsListContext = {|
  label: string,
|};

const createEmptyReport = (): ProjectItemUsageReport => ({
  relatedUsages: [],
  objectUsages: [],
  eventUsages: [],
});

export const getProjectItemUsageTargetName = (
  target: ProjectItemUsageTarget
): string => {
  switch (target.kind) {
    case 'custom-object':
      return gd.PlatformExtension.getObjectFullType(
        target.eventsFunctionsExtension.getName(),
        target.eventsBasedObject.getName()
      );
    case 'custom-object-variant':
      return (
        gd.PlatformExtension.getObjectFullType(
          target.eventsFunctionsExtension.getName(),
          target.eventsBasedObject.getName()
        ) +
        ' / ' +
        target.variant.getName()
      );
    case 'events-based-behavior':
      return gd.PlatformExtension.getBehaviorFullType(
        target.eventsFunctionsExtension.getName(),
        target.eventsBasedBehavior.getName()
      );
    case 'events-function':
      return (
        target.eventsFunctionsExtension.getName() +
        gd.PlatformExtension.getNamespaceSeparator() +
        target.eventsFunction.getName()
      );
    case 'external-events':
      return target.externalEvents.getName();
    case 'external-layout':
      return target.externalLayout.getName();
    default:
      return '';
  }
};

const getInstructionSentence = (
  instruction: gdInstruction,
  isCondition: boolean
): string => {
  try {
    const metadata = isCondition
      ? gd.MetadataProvider.getConditionMetadata(
          gd.JsPlatform.get(),
          instruction.getType()
        )
      : gd.MetadataProvider.getActionMetadata(
          gd.JsPlatform.get(),
          instruction.getType()
        );
    if (gd.MetadataProvider.isBadInstructionMetadata(metadata)) {
      return instruction.getType();
    }
    return renderInstructionSentenceAsPlainText(instruction, metadata);
  } catch (error) {
    return instruction.getType();
  }
};

const getParameterPlainString = (
  instruction: gdInstruction,
  parameterIndex: number
): string => {
  if (parameterIndex >= instruction.getParametersCount()) return '';
  return instruction.getParameter(parameterIndex).getPlainString();
};

const parameterPlainStringMatchesName = (
  parameterPlainString: string,
  name: string
): boolean =>
  parameterPlainString === name ||
  parameterPlainString === JSON.stringify(name);

const instructionParametersContain = (
  instruction: gdInstruction,
  text: string
): boolean => {
  for (
    let parameterIndex = 0;
    parameterIndex < instruction.getParametersCount();
    parameterIndex++
  ) {
    if (
      getParameterPlainString(instruction, parameterIndex).indexOf(text) !== -1
    ) {
      return true;
    }
  }
  return false;
};

const forEachInstruction = (
  instructionsList: gdInstructionsList,
  isCondition: boolean,
  callback: (gdInstruction, boolean) => void
) => {
  for (let index = 0; index < instructionsList.size(); index++) {
    const instruction = instructionsList.get(index);
    callback(instruction, isCondition);

    const subInstructions = instruction.getSubInstructions();
    if (subInstructions.size() > 0) {
      forEachInstruction(subInstructions, isCondition, callback);
    }
  }
};

const forEachEventInstruction = (
  event: gdBaseEvent,
  callback: (gdInstruction, boolean) => void
) => {
  switch (event.getType()) {
    case 'BuiltinCommonInstructions::Standard': {
      const standardEvent = gd.asStandardEvent(event);
      forEachInstruction(standardEvent.getConditions(), true, callback);
      forEachInstruction(standardEvent.getActions(), false, callback);
      return;
    }
    case 'BuiltinCommonInstructions::Else': {
      const elseEvent = gd.asElseEvent(event);
      forEachInstruction(elseEvent.getConditions(), true, callback);
      forEachInstruction(elseEvent.getActions(), false, callback);
      return;
    }
    case 'BuiltinCommonInstructions::While': {
      const whileEvent = gd.asWhileEvent(event);
      forEachInstruction(whileEvent.getConditions(), true, callback);
      forEachInstruction(whileEvent.getActions(), false, callback);
      return;
    }
    case 'BuiltinCommonInstructions::Repeat': {
      const repeatEvent = gd.asRepeatEvent(event);
      forEachInstruction(repeatEvent.getConditions(), true, callback);
      forEachInstruction(repeatEvent.getActions(), false, callback);
      return;
    }
    case 'BuiltinCommonInstructions::ForEach': {
      const forEachEvent = gd.asForEachEvent(event);
      forEachInstruction(forEachEvent.getConditions(), true, callback);
      forEachInstruction(forEachEvent.getActions(), false, callback);
      return;
    }
    case 'BuiltinCommonInstructions::ForEachChildVariable': {
      const forEachChildVariableEvent = gd.asForEachChildVariableEvent(event);
      forEachInstruction(
        forEachChildVariableEvent.getConditions(),
        true,
        callback
      );
      forEachInstruction(
        forEachChildVariableEvent.getActions(),
        false,
        callback
      );
      return;
    }
    default:
      return;
  }
};

const formatEventPath = (eventPath: EventPath): string =>
  eventPath.map(index => `${index + 1}`).join('.');

const getEventUsageLocation = (
  context: EventsListContext,
  eventPath: EventPath
): string =>
  eventPath.length > 0
    ? `${context.label} - event ${formatEventPath(eventPath)}`
    : context.label;

const findEventInstructionUsagesInEventsList = (
  eventUsages: Array<ProjectItemEventUsage>,
  context: EventsListContext,
  eventsList: gdEventsList,
  instructionMatches: gdInstruction => boolean,
  parentPath: EventPath = []
) => {
  mapFor(0, eventsList.getEventsCount(), eventIndex => {
    const event = eventsList.getEventAt(eventIndex);
    const eventPath = [...parentPath, eventIndex];

    forEachEventInstruction(event, (instruction, isCondition) => {
      if (!instructionMatches(instruction)) return;

      eventUsages.push({
        id: `${context.label}-${eventPath.join('.')}-${eventUsages.length}`,
        location: getEventUsageLocation(context, eventPath),
        eventPath,
        details: getInstructionSentence(instruction, isCondition),
      });
    });

    if (event.canHaveSubEvents()) {
      findEventInstructionUsagesInEventsList(
        eventUsages,
        context,
        event.getSubEvents(),
        instructionMatches,
        eventPath
      );
    }
  });
};

const findLinkEventUsagesInEventsList = (
  eventUsages: Array<ProjectItemEventUsage>,
  context: EventsListContext,
  eventsList: gdEventsList,
  externalEventsName: string,
  parentPath: EventPath = []
) => {
  mapFor(0, eventsList.getEventsCount(), eventIndex => {
    const event = eventsList.getEventAt(eventIndex);
    const eventPath = [...parentPath, eventIndex];

    if (event.getType() === 'BuiltinCommonInstructions::Link') {
      const linkEvent = gd.asLinkEvent(event);
      if (linkEvent.getTarget() === externalEventsName) {
        eventUsages.push({
          id: `${context.label}-${eventPath.join('.')}-${eventUsages.length}`,
          location: getEventUsageLocation(context, eventPath),
          eventPath,
          details: `Link to external events "${externalEventsName}"`,
        });
      }
    }

    if (event.canHaveSubEvents()) {
      findLinkEventUsagesInEventsList(
        eventUsages,
        context,
        event.getSubEvents(),
        externalEventsName,
        eventPath
      );
    }
  });
};

const forEachProjectEventsList = (
  project: gdProject,
  callback: (EventsListContext, gdEventsList) => void
) => {
  mapFor(0, project.getLayoutsCount(), layoutIndex => {
    const layout = project.getLayoutAt(layoutIndex);
    sceneLifecycleFunctionDefinitions.forEach(({ name: role }) =>
      callback(
        {
          label: `Scene "${layout.getName()}" / ${getSceneLifecycleFunctionDisplayName(
            role
          )}`,
        },
        getSceneLifecycleEvents(layout, role)
      )
    );
  });

  mapFor(0, project.getExternalEventsCount(), externalEventsIndex => {
    const externalEvents = project.getExternalEventsAt(externalEventsIndex);
    sceneLifecycleFunctionDefinitions.forEach(({ name: role }) =>
      callback(
        {
          label: `External events "${externalEvents.getName()}" / ${getSceneLifecycleFunctionDisplayName(
            role
          )}`,
        },
        getSceneLifecycleEvents(externalEvents, role)
      )
    );
  });

  mapFor(0, project.getEventsFunctionsExtensionsCount(), extensionIndex => {
    const extension = project.getEventsFunctionsExtensionAt(extensionIndex);
    const extensionName = extension.getName();

    mapFor(
      0,
      extension.getEventsFunctions().getEventsFunctionsCount(),
      functionIndex => {
        const eventsFunction = extension
          .getEventsFunctions()
          .getEventsFunctionAt(functionIndex);
        callback(
          {
            label: `Extension "${extensionName}" function "${eventsFunction.getName()}"`,
          },
          eventsFunction.getEvents()
        );
      }
    );

    const eventsBasedBehaviors = extension.getEventsBasedBehaviors();
    mapFor(0, eventsBasedBehaviors.getCount(), behaviorIndex => {
      const eventsBasedBehavior = eventsBasedBehaviors.getAt(behaviorIndex);
      const eventsFunctions = eventsBasedBehavior.getEventsFunctions();
      mapFor(0, eventsFunctions.getEventsFunctionsCount(), functionIndex => {
        const eventsFunction = eventsFunctions.getEventsFunctionAt(
          functionIndex
        );
        callback(
          {
            label: `Extension "${extensionName}" behavior "${eventsBasedBehavior.getName()}" function "${eventsFunction.getName()}"`,
          },
          eventsFunction.getEvents()
        );
      });
    });

    const eventsBasedObjects = extension.getEventsBasedObjects();
    mapFor(0, eventsBasedObjects.getCount(), objectIndex => {
      const eventsBasedObject = eventsBasedObjects.getAt(objectIndex);
      const eventsFunctions = eventsBasedObject.getEventsFunctions();
      mapFor(0, eventsFunctions.getEventsFunctionsCount(), functionIndex => {
        const eventsFunction = eventsFunctions.getEventsFunctionAt(
          functionIndex
        );
        callback(
          {
            label: `Extension "${extensionName}" object "${eventsBasedObject.getName()}" function "${eventsFunction.getName()}"`,
          },
          eventsFunction.getEvents()
        );
      });
    });
  });
};

const findEventInstructionUsages = (
  project: gdProject,
  instructionMatches: gdInstruction => boolean
): Array<ProjectItemEventUsage> => {
  const eventUsages: Array<ProjectItemEventUsage> = [];
  forEachProjectEventsList(project, (context, eventsList) => {
    findEventInstructionUsagesInEventsList(
      eventUsages,
      context,
      eventsList,
      instructionMatches
    );
  });
  return eventUsages;
};

const findLinkEventUsages = (
  project: gdProject,
  externalEventsName: string
): Array<ProjectItemEventUsage> => {
  const eventUsages: Array<ProjectItemEventUsage> = [];
  forEachProjectEventsList(project, (context, eventsList) => {
    findLinkEventUsagesInEventsList(
      eventUsages,
      context,
      eventsList,
      externalEventsName
    );
  });
  return eventUsages;
};

const addObjectContainerUsages = (
  objectUsages: Array<ProjectItemUsage>,
  objectsContainer: gdObjectsContainer,
  containerLocation: string,
  objectType: string
) => {
  mapFor(0, objectsContainer.getObjectsCount(), objectIndex => {
    const object = objectsContainer.getObjectAt(objectIndex);
    if (object.getType() !== objectType) return;

    objectUsages.push({
      id: `${containerLocation}-${object.getName()}-${objectUsages.length}`,
      location: `${containerLocation} object "${object.getName()}"`,
      details: `Object type "${objectType}"`,
    });
  });
};

const addObjectVariantContainerUsages = (
  objectUsages: Array<ProjectItemUsage>,
  objectsContainer: gdObjectsContainer,
  containerLocation: string,
  objectType: string,
  variantName: string
) => {
  mapFor(0, objectsContainer.getObjectsCount(), objectIndex => {
    const object = objectsContainer.getObjectAt(objectIndex);
    if (object.getType() !== objectType) return;

    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      object.getConfiguration()
    );
    if (customObjectConfiguration.getVariantName() !== variantName) return;

    objectUsages.push({
      id: `${containerLocation}-${object.getName()}-${variantName}-${
        objectUsages.length
      }`,
      location: `${containerLocation} object "${object.getName()}"`,
      details: `Object variant "${variantName}" of type "${objectType}"`,
    });
  });
};

const addBehaviorContainerUsages = (
  objectUsages: Array<ProjectItemUsage>,
  objectsContainer: gdObjectsContainer,
  containerLocation: string,
  behaviorType: string
) => {
  mapFor(0, objectsContainer.getObjectsCount(), objectIndex => {
    const object = objectsContainer.getObjectAt(objectIndex);
    object
      .getAllBehaviorNames()
      .toJSArray()
      .forEach(behaviorName => {
        const behavior = object.getBehavior(behaviorName);
        if (behavior.getTypeName() !== behaviorType) return;

        objectUsages.push({
          id: `${containerLocation}-${object.getName()}-${behaviorName}-${
            objectUsages.length
          }`,
          location: `${containerLocation} object "${object.getName()}"`,
          details: `Behavior "${behaviorName}" of type "${behaviorType}"`,
        });
      });
  });
};

const forEachProjectObjectContainer = (
  project: gdProject,
  callback: (gdObjectsContainer, string) => void
) => {
  callback(project.getObjects(), 'Global');

  mapFor(0, project.getLayoutsCount(), layoutIndex => {
    const layout = project.getLayoutAt(layoutIndex);
    callback(layout.getObjects(), `Scene "${layout.getName()}"`);
  });

  mapFor(0, project.getEventsFunctionsExtensionsCount(), extensionIndex => {
    const extension = project.getEventsFunctionsExtensionAt(extensionIndex);
    const extensionName = extension.getName();
    const eventsBasedObjects = extension.getEventsBasedObjects();

    mapFor(0, eventsBasedObjects.getCount(), objectIndex => {
      const eventsBasedObject = eventsBasedObjects.getAt(objectIndex);
      const objectName = eventsBasedObject.getName();

      callback(
        eventsBasedObject.getDefaultVariant().getObjects(),
        `Custom object "${extensionName} / ${objectName}"`
      );

      const variants = eventsBasedObject.getVariants();
      mapFor(0, variants.getVariantsCount(), variantIndex => {
        const variant = variants.getVariantAt(variantIndex);
        callback(
          variant.getObjects(),
          `Custom object "${extensionName} / ${objectName}" variant "${variant.getName()}"`
        );
      });
    });
  });
};

const findObjectUsages = (
  project: gdProject,
  objectType: string
): Array<ProjectItemUsage> => {
  const objectUsages: Array<ProjectItemUsage> = [];
  forEachProjectObjectContainer(project, (objectsContainer, location) => {
    addObjectContainerUsages(
      objectUsages,
      objectsContainer,
      location,
      objectType
    );
  });
  return objectUsages;
};

const findObjectVariantUsages = (
  project: gdProject,
  objectType: string,
  variantName: string
): Array<ProjectItemUsage> => {
  const objectUsages: Array<ProjectItemUsage> = [];
  forEachProjectObjectContainer(project, (objectsContainer, location) => {
    addObjectVariantContainerUsages(
      objectUsages,
      objectsContainer,
      location,
      objectType,
      variantName
    );
  });
  return objectUsages;
};

const findBehaviorUsages = (
  project: gdProject,
  behaviorType: string
): Array<ProjectItemUsage> => {
  const objectUsages: Array<ProjectItemUsage> = [];
  forEachProjectObjectContainer(project, (objectsContainer, location) => {
    addBehaviorContainerUsages(
      objectUsages,
      objectsContainer,
      location,
      behaviorType
    );
  });
  return objectUsages;
};

const findExternalLayoutInstructionUsages = (
  project: gdProject,
  externalLayoutName: string
): Array<ProjectItemEventUsage> =>
  findEventInstructionUsages(project, instruction => {
    return (
      instruction.getType() === externalLayoutActionType &&
      parameterPlainStringMatchesName(
        getParameterPlainString(instruction, 1),
        externalLayoutName
      )
    );
  });

export const findProjectItemUsages = (
  project: gdProject,
  target: ProjectItemUsageTarget
): ProjectItemUsageReport => {
  const report = createEmptyReport();

  switch (target.kind) {
    case 'custom-object': {
      const objectType = getProjectItemUsageTargetName(target);
      report.objectUsages = findObjectUsages(project, objectType);
      report.eventUsages = findEventInstructionUsages(project, instruction => {
        return (
          instruction.getType().indexOf(`${objectType}::`) === 0 ||
          instructionParametersContain(instruction, objectType)
        );
      });
      break;
    }
    case 'custom-object-variant': {
      const objectType = gd.PlatformExtension.getObjectFullType(
        target.eventsFunctionsExtension.getName(),
        target.eventsBasedObject.getName()
      );
      report.objectUsages = findObjectVariantUsages(
        project,
        objectType,
        target.variant.getName()
      );
      break;
    }
    case 'events-based-behavior': {
      const behaviorType = getProjectItemUsageTargetName(target);
      report.objectUsages = findBehaviorUsages(project, behaviorType);
      report.eventUsages = findEventInstructionUsages(project, instruction => {
        return (
          instruction.getType().indexOf(`${behaviorType}::`) === 0 ||
          instructionParametersContain(instruction, behaviorType)
        );
      });
      break;
    }
    case 'events-function': {
      const functionType = getProjectItemUsageTargetName(target);
      report.eventUsages = findEventInstructionUsages(project, instruction => {
        return (
          instruction.getType() === functionType ||
          instructionParametersContain(instruction, functionType)
        );
      });
      break;
    }
    case 'external-events': {
      const externalEventsName = target.externalEvents.getName();
      const associatedLayout = target.externalEvents.getAssociatedLayout();
      if (associatedLayout) {
        report.relatedUsages.push({
          id: 'associated-layout',
          location: `Scene "${associatedLayout}"`,
          details: 'Associated external events',
        });
      }
      report.eventUsages = findLinkEventUsages(project, externalEventsName);
      break;
    }
    case 'external-layout': {
      const externalLayoutName = target.externalLayout.getName();
      const associatedLayout = target.externalLayout.getAssociatedLayout();
      if (associatedLayout) {
        report.relatedUsages.push({
          id: 'associated-layout',
          location: `Scene "${associatedLayout}"`,
          details: 'Associated external layout',
        });
      }
      report.eventUsages = findExternalLayoutInstructionUsages(
        project,
        externalLayoutName
      );
      break;
    }
    default:
      break;
  }

  return report;
};
