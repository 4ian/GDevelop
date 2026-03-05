// @flow
import { renderInstructionSentenceAsPlainText } from '../EventsSheet/EventsTree/TextRenderer';
import type { EventPath } from './EventPath';

import { mapFor } from './MapFor';

const gd: libGDevelop = global.gd;

export type GlobalSearchMatchContext = {|
  conditionText: string,
  actionText: string,
  otherText: string,
|};

export type GlobalSearchMatch = {|
  id: string,
  eventPath: EventPath,
  positionInList: number,
  context: GlobalSearchMatchContext,
|};

type BaseGroup = {|
  id: string,
  label: string,
  matches: Array<GlobalSearchMatch>,
|};

export type LayoutSearchGroup = {|
  ...BaseGroup,
  targetType: 'layout',
  name: string,
|};

export type ExternalEventsSearchGroup = {|
  ...BaseGroup,
  targetType: 'external-events',
  name: string,
|};

export type ExtensionSearchGroup = {|
  ...BaseGroup,
  targetType: 'extension',
  extensionName: string,
  functionName: string,
  behaviorName: ?string,
  objectName: ?string,
|};

export type GlobalSearchGroup =
  | LayoutSearchGroup
  | ExternalEventsSearchGroup
  | ExtensionSearchGroup;

export type GlobalSearchInputs = {|
  searchText: string,
  matchCase: boolean,
  searchInConditions: boolean,
  searchInActions: boolean,
  searchInEventStrings: boolean,
  searchInEventSentences: boolean,
  includeStoreExtensions: boolean,
|};

const buildEventPtrToPathMap = (
  eventsList: gdEventsList,
  parentPath: EventPath = []
): Map<number, EventPath> => {
  const map = new Map<number, EventPath>();
  mapFor(0, eventsList.getEventsCount(), index => {
    const event = eventsList.getEventAt(index);
    const currentPath = [...parentPath, index];
    map.set(event.ptr, currentPath);

    if (event.canHaveSubEvents()) {
      const subEventsMap = buildEventPtrToPathMap(
        event.getSubEvents(),
        currentPath
      );
      subEventsMap.forEach((path, ptr) => map.set(ptr, path));
    }
  });
  return map;
};

const getEventAtPath = (
  eventsList: gdEventsList,
  path: EventPath
): ?gdBaseEvent => {
  let currentList = eventsList;
  for (let i = 0; i < path.length; i++) {
    const index = path[i];
    if (index >= currentList.getEventsCount()) return null;
    const event = currentList.getEventAt(index);
    if (i === path.length - 1) return event;
    if (!event.canHaveSubEvents()) return null;
    currentList = event.getSubEvents();
  }
  return null;
};

const searchInEventsList = (
  eventsList: gdEventsList,
  inputs: GlobalSearchInputs
): Array<GlobalSearchMatch> => {
  if (!inputs.searchText.trim()) return [];

  const eventPtrToPathMap = buildEventPtrToPathMap(eventsList);
  const rawResults = gd.EventsRefactorer.searchInEvents(
    gd.JsPlatform.get(),
    eventsList,
    inputs.searchText,
    inputs.matchCase,
    inputs.searchInConditions,
    inputs.searchInActions,
    inputs.searchInEventStrings,
    inputs.searchInEventSentences
  ).clone();

  // Phase 1: Extract paths and positions from the C++ search results,
  // then free the C++ vector promptly.
  type RawEntry = {|
    eventPath: EventPath,
    positionInList: number,
    index: number,
  |};
  const rawEntries: Array<RawEntry> = mapFor(0, rawResults.size(), index => {
    const searchResult = rawResults.at(index);
    if (!searchResult.isEventValid()) return null;

    const event = searchResult.getEvent();
    const eventPath = eventPtrToPathMap.get(event.ptr);
    if (!eventPath) return;

    return {
      eventPath,
      positionInList: searchResult.getPositionInList(),
      index,
    };
  }).filter(Boolean);
  rawResults.delete();

  // Phase 2: Build rich context (instruction sentences, metadata) from
  // the raw entries — doing more calls to C++ here to complete the context.
  return rawEntries.map(entry => {
    const event = getEventAtPath(eventsList, entry.eventPath);
    return {
      id: `${entry.eventPath.join('-')}-${entry.positionInList}-${entry.index}`,
      eventPath: entry.eventPath,
      positionInList: entry.positionInList,
      context: event
        ? getEventContext(event, inputs.searchText, inputs.matchCase)
        : { conditionText: '', actionText: '', otherText: 'Event' },
    };
  });
};

const getInstructionSentence = (
  instruction: gdInstruction,
  isCondition: boolean
): string => {
  const instructionType = instruction.getType();

  const metadata = isCondition
    ? gd.MetadataProvider.getConditionMetadata(
        gd.JsPlatform.get(),
        instructionType
      )
    : gd.MetadataProvider.getActionMetadata(
        gd.JsPlatform.get(),
        instructionType
      );

  return renderInstructionSentenceAsPlainText(instruction, metadata);
};

const getFirstInstructionSentence = (
  instructionsList: gdInstructionsList,
  isCondition: boolean
): string => {
  if (instructionsList.size() === 0) return '';
  return getInstructionSentence(instructionsList.get(0), isCondition);
};

const findMatchingInstructionSentence = (
  instructionsList: gdInstructionsList,
  isCondition: boolean,
  searchText: string,
  matchCase: boolean
): string => {
  const needle = matchCase ? searchText : searchText.toLowerCase();
  const count = instructionsList.size();
  for (let i = 0; i < count; i++) {
    const sentence = getInstructionSentence(
      instructionsList.get(i),
      isCondition
    );
    const haystack = matchCase ? sentence : sentence.toLowerCase();
    if (haystack.includes(needle)) {
      return sentence;
    }
  }
  return '';
};

const getEventContextFromConditionsAndActions = (
  conditions: gdInstructionsList,
  actions: gdInstructionsList,
  searchText: string,
  matchCase: boolean
): GlobalSearchMatchContext => {
  const conditionSentence =
    findMatchingInstructionSentence(conditions, true, searchText, matchCase) ||
    getFirstInstructionSentence(conditions, true);
  const actionSentence =
    findMatchingInstructionSentence(actions, false, searchText, matchCase) ||
    getFirstInstructionSentence(actions, false);

  return {
    conditionText: conditionSentence,
    actionText: actionSentence,
    otherText: '',
  };
};

const otherContext = (text: string): GlobalSearchMatchContext => ({
  conditionText: '',
  actionText: '',
  otherText: text,
});

const getEventContext = (
  event: gdBaseEvent,
  searchText: string,
  matchCase: boolean
): GlobalSearchMatchContext => {
  const eventType = event.getType();
  switch (eventType) {
    case 'BuiltinCommonInstructions::Comment': {
      const comment = gd
        .asCommentEvent(event)
        .getComment()
        .trim();
      return otherContext(comment);
    }
    case 'BuiltinCommonInstructions::Group': {
      const groupName = gd
        .asGroupEvent(event)
        .getName()
        .trim();
      return otherContext(groupName ? `Group: ${groupName}` : 'Group');
    }
    case 'BuiltinCommonInstructions::JsCode': {
      const inlineCode = gd
        .asJsCodeEvent(event)
        .getInlineCode()
        .trim();
      return otherContext(
        inlineCode ? `JavaScript: ${inlineCode}` : 'JavaScript event'
      );
    }
    case 'BuiltinCommonInstructions::Link': {
      const target = gd
        .asLinkEvent(event)
        .getTarget()
        .trim();
      return otherContext(target ? `Link to: ${target}` : 'Link event');
    }
    case 'BuiltinCommonInstructions::Standard': {
      const standartEvent = gd.asStandardEvent(event);
      return getEventContextFromConditionsAndActions(
        standartEvent.getConditions(),
        standartEvent.getActions(),
        searchText,
        matchCase
      );
    }
    case 'BuiltinCommonInstructions::Else': {
      const elseEvent = gd.asElseEvent(event);
      return getEventContextFromConditionsAndActions(
        elseEvent.getConditions(),
        elseEvent.getActions(),
        searchText,
        matchCase
      );
    }
    case 'BuiltinCommonInstructions::While': {
      const whileEvent = gd.asWhileEvent(event);
      return getEventContextFromConditionsAndActions(
        whileEvent.getConditions(),
        whileEvent.getActions(),
        searchText,
        matchCase
      );
    }
    case 'BuiltinCommonInstructions::Repeat': {
      const repeatEvent = gd.asRepeatEvent(event);
      return getEventContextFromConditionsAndActions(
        repeatEvent.getConditions(),
        repeatEvent.getActions(),
        searchText,
        matchCase
      );
    }
    case 'BuiltinCommonInstructions::ForEach': {
      const forEachEvent = gd.asForEachEvent(event);
      return getEventContextFromConditionsAndActions(
        forEachEvent.getConditions(),
        forEachEvent.getActions(),
        searchText,
        matchCase
      );
    }
    case 'BuiltinCommonInstructions::ForEachChildVariable': {
      const forEachChildVariableEvent = gd.asForEachChildVariableEvent(event);
      return getEventContextFromConditionsAndActions(
        forEachChildVariableEvent.getConditions(),
        forEachChildVariableEvent.getActions(),
        searchText,
        matchCase
      );
    }
    default:
      return otherContext(`Event type: ${eventType}`);
  }
};

const pushIfMatches = (
  groups: Array<GlobalSearchGroup>,
  createGroup: (matches: Array<GlobalSearchMatch>) => GlobalSearchGroup,
  matches: Array<GlobalSearchMatch>
) => {
  if (matches.length > 0) groups.push(createGroup(matches));
};

const scanFunctionContainer = ({
  functionsContainer,
  behaviorName,
  objectName,
  inputs,
  groups,
  extensionName,
  extensionFullName,
}: {|
  functionsContainer: gdEventsFunctionsContainer,
  behaviorName: ?string,
  objectName: ?string,
  inputs: GlobalSearchInputs,
  groups: Array<GlobalSearchGroup>,
  extensionName: string,
  extensionFullName: string,
|}) => {
  mapFor(0, functionsContainer.getEventsFunctionsCount(), functionIndex => {
    const eventsFunction = functionsContainer.getEventsFunctionAt(
      functionIndex
    );
    const functionName = eventsFunction.getName();
    const matches = searchInEventsList(eventsFunction.getEvents(), inputs);

    pushIfMatches(
      groups,
      matches => ({
        id: `extension:${extensionName}:${behaviorName || ''}:${objectName ||
          ''}:${functionName}`,
        label: behaviorName
          ? `${extensionFullName} / ${behaviorName} / ${functionName}`
          : objectName
          ? `${extensionFullName} / ${objectName} / ${functionName}`
          : `${extensionFullName} / ${functionName}`,
        targetType: 'extension',
        extensionName,
        functionName,
        behaviorName,
        objectName,
        matches,
      }),
      matches
    );
  });
};

const scanEvents = ({
  project,
  inputs,
  groups,
  where,
}: {
  project: gdProject,
  inputs: GlobalSearchInputs,
  groups: Array<GlobalSearchGroup>,
  where: 'layout' | 'external-events',
}) => {
  if (where === 'layout') {
    mapFor(0, project.getLayoutsCount(), index => {
      const layout = project.getLayoutAt(index);
      const name = layout.getName();
      const matches = searchInEventsList(layout.getEvents(), inputs);
      pushIfMatches(
        groups,
        matches => ({
          id: `${where}:${name}`,
          label: name,
          targetType: where,
          name,
          matches,
        }),
        matches
      );
    });
  } else if (where === 'external-events') {
    mapFor(0, project.getExternalEventsCount(), index => {
      const externalEvents = project.getExternalEventsAt(index);
      const name = externalEvents.getName();
      const matches = searchInEventsList(externalEvents.getEvents(), inputs);
      pushIfMatches(
        groups,
        matches => ({
          id: `${where}:${name}`,
          label: name,
          targetType: where,
          name,
          matches,
        }),
        matches
      );
    });
  }
};

export const scanProjectForGlobalEventsSearch = (
  project: gdProject,
  inputs: GlobalSearchInputs
): Array<GlobalSearchGroup> => {
  const groups: Array<GlobalSearchGroup> = [];

  if (!inputs.searchText.trim()) return groups;

  scanEvents({ project, inputs, groups, where: 'layout' });
  scanEvents({ project, inputs, groups, where: 'external-events' });

  mapFor(0, project.getEventsFunctionsExtensionsCount(), extensionIndex => {
    const extension = project.getEventsFunctionsExtensionAt(extensionIndex);
    if (
      !inputs.includeStoreExtensions &&
      extension.getOriginName() === 'gdevelop-extension-store'
    ) {
      return;
    }
    const extensionName = extension.getName();
    const extensionFullName = extension.getFullName() || extensionName;

    scanFunctionContainer({
      functionsContainer: extension.getEventsFunctions(),
      behaviorName: null,
      objectName: null,
      inputs,
      groups,
      extensionFullName,
      extensionName,
    });

    const eventsBasedBehaviors = extension.getEventsBasedBehaviors();
    mapFor(0, eventsBasedBehaviors.getCount(), behaviorIndex => {
      const behavior = eventsBasedBehaviors.getAt(behaviorIndex);
      scanFunctionContainer({
        functionsContainer: behavior.getEventsFunctions(),
        behaviorName: behavior.getName(),
        objectName: null,
        inputs,
        groups,
        extensionFullName,
        extensionName,
      });
    });

    const eventsBasedObjects = extension.getEventsBasedObjects();
    mapFor(0, eventsBasedObjects.getCount(), objectIndex => {
      const object = eventsBasedObjects.getAt(objectIndex);
      scanFunctionContainer({
        functionsContainer: object.getEventsFunctions(),
        behaviorName: null,
        objectName: object.getName(),
        inputs,
        groups,
        extensionFullName,
        extensionName,
      });
    });
  });

  return groups;
};
