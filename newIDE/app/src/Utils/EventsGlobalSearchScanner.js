// @flow
import { mapFor } from './MapFor';

const gd: libGDevelop = global.gd;

export type GlobalSearchMatch = {|
  id: string,
  eventPath: Array<number>,
  positionInList: number,
  context: string,
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
  parentPath: Array<number> = []
): Map<number, Array<number>> => {
  const map = new Map<number, Array<number>>();
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
  path: Array<number>
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
  );

  // Phase 1: Extract lightweight data from the C++ vector.
  // Avoid any heavy C++ calls (like getEventContext) while the vector is alive,
  // because they can trigger emscripten heap growth and invalidate the vector's memory.
  type RawEntry = {|
    eventPath: Array<number>,
    positionInList: number,
    index: number,
  |};
  const rawEntries: Array<RawEntry> = [];
  try {
    mapFor(0, rawResults.size(), index => {
      const searchResult = rawResults.at(index);
      if (!searchResult.isEventValid()) return;

      const event = searchResult.getEvent();
      const eventPath = eventPtrToPathMap.get(event.ptr);
      if (!eventPath) return;

      rawEntries.push({
        eventPath,
        positionInList: searchResult.getPositionInList(),
        index,
      });
    });
  } finally {
    rawResults.delete();
  }

  // Phase 2: Now that the C++ vector is freed, it is safe to do heavy C++
  // operations (formatting instruction sentences, metadata lookups, etc.).
  return rawEntries.map(entry => {
    const event = getEventAtPath(eventsList, entry.eventPath);
    return {
      id: `${entry.eventPath.join('-')}-${entry.positionInList}-${entry.index}`,
      eventPath: entry.eventPath,
      positionInList: entry.positionInList,
      context: event
        ? getEventContext(event, inputs.searchText, inputs.matchCase)
        : 'Event',
    };
  });
};

const truncate = (text: string, maxLength: number = 140): string =>
  text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;

const getInstructionSentence = (
  instruction: gdInstruction,
  isCondition: boolean
): string => {
  const instructionType = instruction.getType();
  if (!instructionType) return '';

  const metadata = isCondition
    ? gd.MetadataProvider.getConditionMetadata(
        gd.JsPlatform.get(),
        instructionType
      )
    : gd.MetadataProvider.getActionMetadata(
        gd.JsPlatform.get(),
        instructionType
      );
  if (gd.MetadataProvider.isBadInstructionMetadata(metadata)) {
    return instructionType;
  }

  const formatter = gd.InstructionSentenceFormatter.get();
  const formattedTexts = formatter.getAsFormattedText(instruction, metadata);
  let sentence = '';
  mapFor(0, formattedTexts.size(), i => {
    sentence += formattedTexts.getString(i);
  });
  return sentence.trim() || instructionType;
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
): string => {
  // Find the instruction that actually contains the search match,
  // falling back to the first instruction if the match is in event strings
  // rather than instruction sentences.
  const conditionSentence =
    findMatchingInstructionSentence(conditions, true, searchText, matchCase) ||
    getFirstInstructionSentence(conditions, true);
  const actionSentence =
    findMatchingInstructionSentence(actions, false, searchText, matchCase) ||
    getFirstInstructionSentence(actions, false);

  if (conditionSentence && actionSentence) {
    return truncate(`If ${conditionSentence} then ${actionSentence}`);
  }
  if (conditionSentence) {
    return truncate(`Condition: ${conditionSentence}`);
  }
  if (actionSentence) {
    return truncate(`Action: ${actionSentence}`);
  }
  return 'Event';
};

const getEventContext = (
  event: gdBaseEvent,
  searchText: string,
  matchCase: boolean
): string => {
  const eventType = event.getType();
  switch (eventType) {
    case 'BuiltinCommonInstructions::Comment': {
      const comment = gd
        .asCommentEvent(event)
        .getComment()
        .trim();
      return comment ? truncate(comment) : 'Comment';
    }
    case 'BuiltinCommonInstructions::Group': {
      const groupName = gd
        .asGroupEvent(event)
        .getName()
        .trim();
      return groupName ? truncate(`Group: ${groupName}`) : 'Group';
    }
    case 'BuiltinCommonInstructions::JsCode': {
      const inlineCode = gd
        .asJsCodeEvent(event)
        .getInlineCode()
        .trim();
      return inlineCode
        ? truncate(`JavaScript: ${inlineCode}`)
        : 'JavaScript event';
    }
    case 'BuiltinCommonInstructions::Link': {
      const target = gd
        .asLinkEvent(event)
        .getTarget()
        .trim();
      return target ? truncate(`Link to: ${target}`) : 'Link event';
    }
    case 'BuiltinCommonInstructions::Standard':
      return getEventContextFromConditionsAndActions(
        gd.asStandardEvent(event).getConditions(),
        gd.asStandardEvent(event).getActions(),
        searchText,
        matchCase
      );
    case 'BuiltinCommonInstructions::Else':
      return getEventContextFromConditionsAndActions(
        gd.asElseEvent(event).getConditions(),
        gd.asElseEvent(event).getActions(),
        searchText,
        matchCase
      );
    case 'BuiltinCommonInstructions::While':
      return getEventContextFromConditionsAndActions(
        gd.asWhileEvent(event).getConditions(),
        gd.asWhileEvent(event).getActions(),
        searchText,
        matchCase
      );
    case 'BuiltinCommonInstructions::Repeat':
      return getEventContextFromConditionsAndActions(
        gd.asRepeatEvent(event).getConditions(),
        gd.asRepeatEvent(event).getActions(),
        searchText,
        matchCase
      );
    case 'BuiltinCommonInstructions::ForEach':
      return getEventContextFromConditionsAndActions(
        gd.asForEachEvent(event).getConditions(),
        gd.asForEachEvent(event).getActions(),
        searchText,
        matchCase
      );
    case 'BuiltinCommonInstructions::ForEachChildVariable':
      return getEventContextFromConditionsAndActions(
        gd.asForEachChildVariableEvent(event).getConditions(),
        gd.asForEachChildVariableEvent(event).getActions(),
        searchText,
        matchCase
      );
    default:
      return truncate(`Event type: ${eventType}`);
  }
};

const pushIfMatches = (
  groups: Array<GlobalSearchGroup>,
  createGroup: (matches: Array<GlobalSearchMatch>) => GlobalSearchGroup,
  matches: Array<GlobalSearchMatch>
) => {
  if (matches.length > 0) groups.push(createGroup(matches));
};

export const scanProjectForGlobalEventsSearch = (
  project: gdProject,
  inputs: GlobalSearchInputs
): Array<GlobalSearchGroup> => {
  const groups: Array<GlobalSearchGroup> = [];

  if (!inputs.searchText.trim()) return groups;

  mapFor(0, project.getLayoutsCount(), index => {
    const layout = project.getLayoutAt(index);
    const name = layout.getName();
    const matches = searchInEventsList(layout.getEvents(), inputs);
    pushIfMatches(
      groups,
      matches => ({
        id: `layout:${name}`,
        label: name,
        targetType: 'layout',
        name,
        matches,
      }),
      matches
    );
  });

  mapFor(0, project.getExternalEventsCount(), index => {
    const externalEvents = project.getExternalEventsAt(index);
    const name = externalEvents.getName();
    const matches = searchInEventsList(externalEvents.getEvents(), inputs);
    pushIfMatches(
      groups,
      matches => ({
        id: `external-events:${name}`,
        label: name,
        targetType: 'external-events',
        name,
        matches,
      }),
      matches
    );
  });

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

    const scanFunctionContainer = ({
      functionsContainer,
      behaviorName,
      objectName,
    }: {|
      functionsContainer: gdEventsFunctionsContainer,
      behaviorName: ?string,
      objectName: ?string,
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
            id: `extension:${extensionName}:${behaviorName ||
              ''}:${objectName || ''}:${functionName}`,
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

    scanFunctionContainer({
      functionsContainer: extension.getEventsFunctions(),
      behaviorName: null,
      objectName: null,
    });

    const eventsBasedBehaviors = extension.getEventsBasedBehaviors();
    mapFor(0, eventsBasedBehaviors.getCount(), behaviorIndex => {
      const behavior = eventsBasedBehaviors.getAt(behaviorIndex);
      scanFunctionContainer({
        functionsContainer: behavior.getEventsFunctions(),
        behaviorName: behavior.getName(),
        objectName: null,
      });
    });

    const eventsBasedObjects = extension.getEventsBasedObjects();
    mapFor(0, eventsBasedObjects.getCount(), objectIndex => {
      const object = eventsBasedObjects.getAt(objectIndex);
      scanFunctionContainer({
        functionsContainer: object.getEventsFunctions(),
        behaviorName: null,
        objectName: object.getName(),
      });
    });
  });

  return groups;
};
