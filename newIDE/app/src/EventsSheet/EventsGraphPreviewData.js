// @flow
/* eslint-disable no-use-before-define */
import { type EventContext } from './SelectionHandler';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { renderInstructionSentenceAsPlainText } from './EventsTree/TextRenderer';
import {
  isElseEventValid,
  getPreviousExecutableEventIndex,
} from './EventsTree/helpers';

const gd: libGDevelop = global.gd;

export type EventsGraphPreviewEventItem = {|
  itemType: 'event',
  id: string,
  path: Array<number>,
  pathString: string,
  displayPath: string,
  title: string,
  summaryTitle: string,
  typeLabel: string,
  disabled: boolean,
  disabledBecauseOfAncestor: boolean,
  isInvalidElse: boolean,
  elseOfPathString: ?string,
  conditionLines: Array<string>,
  relatedCommentLines: Array<string>,
  children: Array<EventsGraphPreviewItem>,
  eventContext: EventContext,
|};

export type EventsGraphPreviewGroupItem = {|
  itemType: 'group',
  id: string,
  path: Array<number>,
  pathString: string,
  displayPath: string,
  title: string,
  typeLabel: string,
  backgroundColor: string,
  disabled: boolean,
  disabledBecauseOfAncestor: boolean,
  relatedCommentLines: Array<string>,
  children: Array<EventsGraphPreviewItem>,
  eventContext: EventContext,
|};

// $FlowFixMe[recursive-definition]
export type EventsGraphPreviewItem =
  | EventsGraphPreviewEventItem
  | EventsGraphPreviewGroupItem;

const joinPath = (path: Array<number>): string => path.join('.');

const getDisplayPath = (path: Array<number>): string =>
  path.map(index => index + 1).join('.');

const getConditionMetadata = (
  instruction: gdInstruction
): gdInstructionMetadata =>
  gd.MetadataProvider.getConditionMetadata(
    gd.JsPlatform.get(),
    instruction.getType()
  );

const renderConditionLines = (
  instructionsList: gdInstructionsList,
  prefix: string = ''
): Array<string> => {
  const lines = [];
  for (let index = 0; index < instructionsList.size(); index++) {
    const instruction = instructionsList.get(index);
    const metadata = getConditionMetadata(instruction);
    const invertedText = instruction.isInverted() ? '(inverted) ' : '';
    lines.push(
      `${prefix}${invertedText}${renderInstructionSentenceAsPlainText(
        instruction,
        metadata
      )}`
    );

    if (metadata.canHaveSubInstructions()) {
      lines.push(
        ...renderConditionLines(instruction.getSubInstructions(), `${prefix}  `)
      );
    }
  }

  return lines;
};

const appendConditionLines = (
  conditionLines: Array<string>,
  instructionsList: gdInstructionsList
) => {
  conditionLines.push(...renderConditionLines(instructionsList));
};

const truncateSummaryTitle = (text: string): string => {
  const normalizedText = text.trim().replace(/\s+/g, ' ');
  return normalizedText.length > 52
    ? `${normalizedText.slice(0, 49).trim()}...`
    : normalizedText;
};

const summarizeConditionLine = (line: string): string => {
  const normalizedLine = line.trim().replace(/\s+/g, ' ');
  const isInverted = normalizedLine.indexOf('(inverted) ') === 0;
  const conditionLine = isInverted
    ? normalizedLine.replace('(inverted) ', '')
    : normalizedLine;
  let summary = conditionLine;

  if (conditionLine === 'At the beginning of the scene') {
    summary = 'Scene starts';
  } else if (conditionLine === 'The device has a touchscreen') {
    summary = 'Touchscreen';
  } else {
    const touchStartedMatch = conditionLine.match(
      /^A new touch has started on the "([^"]+)" side/
    );
    const keyPressedMatch = conditionLine.match(/^(.+) key is pressed$/);
    const fallingMatch = conditionLine.match(/^(.+) is falling$/);
    const collisionMatch = conditionLine.match(
      /^(.+) is in collision with (.+)$/
    );

    if (touchStartedMatch) {
      summary = `${touchStartedMatch[1]} touch started`;
    } else if (keyPressedMatch) {
      const keyName = keyPressedMatch[1].trim();
      summary = keyName.toLowerCase().endsWith('key')
        ? `${keyName} pressed`
        : `${keyName} key pressed`;
    } else if (fallingMatch) {
      summary = `${fallingMatch[1]} falling`;
    } else if (collisionMatch) {
      summary = `${collisionMatch[1]} collides with ${collisionMatch[2]}`;
    }
  }

  return truncateSummaryTitle(isInverted ? `Not ${summary}` : summary);
};

const getEventSummaryTitle = (
  title: string,
  conditionLines: Array<string>
): string =>
  conditionLines.length > 0 ? summarizeConditionLine(conditionLines[0]) : title;

const normalizeCatalogSearchText = (text: string): string =>
  text
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

const normalizeCatalogCommentText = (text: string): string =>
  text.trim().replace(/\s+/g, ' ');

const getGroupBackgroundColor = (groupEvent: gdGroupEvent): string =>
  `rgb(${groupEvent.getBackgroundColorR()}, ${groupEvent.getBackgroundColorG()}, ${groupEvent.getBackgroundColorB()})`;

const getItemSearchTextWithoutComments = (
  item: EventsGraphPreviewItem
): string => {
  if (item.itemType === 'group') {
    return normalizeCatalogSearchText(
      [item.displayPath, item.title, item.typeLabel].join(' ')
    );
  }

  return normalizeCatalogSearchText(
    [
      item.displayPath,
      item.title,
      item.summaryTitle,
      item.typeLabel,
      ...item.conditionLines,
    ].join(' ')
  );
};

const getMatchingRelatedCommentLines = (
  item: EventsGraphPreviewItem,
  query: string
): Array<string> =>
  item.relatedCommentLines.filter(
    commentLine => normalizeCatalogSearchText(commentLine).indexOf(query) !== -1
  );

const keepOnlyMatchingRelatedCommentLines = (
  items: Array<EventsGraphPreviewItem>,
  query: string
): Array<EventsGraphPreviewItem> =>
  items.map(item => ({
    ...item,
    relatedCommentLines: getMatchingRelatedCommentLines(item, query),
    children: keepOnlyMatchingRelatedCommentLines(item.children, query),
  }));

export const filterEventsGraphPreviewItemsBySearch = (
  items: Array<EventsGraphPreviewItem>,
  searchText: string
): Array<EventsGraphPreviewItem> => {
  const query = normalizeCatalogSearchText(searchText);
  if (!query) return items;

  const filteredItems = [];
  items.forEach(item => {
    const matchingRelatedCommentLines = getMatchingRelatedCommentLines(
      item,
      query
    );
    const filteredChildren = filterEventsGraphPreviewItemsBySearch(
      item.children,
      query
    );

    if (getItemSearchTextWithoutComments(item).indexOf(query) !== -1) {
      filteredItems.push({
        ...item,
        relatedCommentLines: matchingRelatedCommentLines,
        children: keepOnlyMatchingRelatedCommentLines(item.children, query),
      });
      return;
    }

    if (matchingRelatedCommentLines.length > 0) {
      filteredItems.push({
        ...item,
        relatedCommentLines: matchingRelatedCommentLines,
        children: filteredChildren,
      });
      return;
    }

    if (filteredChildren.length > 0) {
      filteredItems.push({
        ...item,
        relatedCommentLines: [],
        children: filteredChildren,
      });
    }
  });

  return filteredItems;
};

const buildEventDetails = ({
  event,
  eventsList,
  eventIndex,
  path,
}: {|
  event: gdBaseEvent,
  eventsList: gdEventsList,
  eventIndex: number,
  path: Array<number>,
|}): ?{|
  title: string,
  typeLabel: string,
  isInvalidElse: boolean,
  elseOfPathString: ?string,
  summaryTitle: string,
  conditionLines: Array<string>,
|} => {
  const eventType = event.getType();
  const conditionLines = [];
  let title = 'Event';
  let typeLabel = 'Event';
  let isInvalidElse = false;
  let elseOfPathString = null;

  if (
    eventType === 'BuiltinCommonInstructions::Comment' ||
    eventType === 'BuiltinCommonInstructions::Group'
  ) {
    return null;
  }

  switch (eventType) {
    case 'BuiltinCommonInstructions::Standard': {
      const standardEvent = gd.asStandardEvent(event);
      appendConditionLines(conditionLines, standardEvent.getConditions());
      break;
    }
    case 'BuiltinCommonInstructions::While': {
      const whileEvent = gd.asWhileEvent(event);
      title = 'While';
      typeLabel = 'Loop';
      appendConditionLines(conditionLines, whileEvent.getWhileConditions());
      appendConditionLines(conditionLines, whileEvent.getConditions());
      break;
    }
    case 'BuiltinCommonInstructions::Repeat': {
      const repeatEvent = gd.asRepeatEvent(event);
      const expression = repeatEvent.getRepeatExpression().getPlainString();
      title = `Repeat ${expression || '0'} times`;
      typeLabel = 'Loop';
      if (expression) conditionLines.push(`Repeat ${expression} times`);
      appendConditionLines(conditionLines, repeatEvent.getConditions());
      break;
    }
    case 'BuiltinCommonInstructions::ForEach': {
      const forEachEvent = gd.asForEachEvent(event);
      const objectName = forEachEvent.getObjectToPick();
      title = `For each ${objectName || 'object'}`;
      typeLabel = 'Loop';
      if (objectName) conditionLines.push(`For each ${objectName}`);
      appendConditionLines(conditionLines, forEachEvent.getConditions());
      break;
    }
    case 'BuiltinCommonInstructions::ForEachChildVariable': {
      const forEachChildVariableEvent = gd.asForEachChildVariableEvent(event);
      const iterableName = forEachChildVariableEvent.getIterableVariableName();
      title = `For each child in ${iterableName || '(no variable)'}`;
      typeLabel = 'Loop';
      if (iterableName) {
        conditionLines.push(`For each child in ${iterableName}`);
      }
      appendConditionLines(
        conditionLines,
        forEachChildVariableEvent.getConditions()
      );
      break;
    }
    case 'BuiltinCommonInstructions::Else': {
      const elseEvent = gd.asElseEvent(event);
      const hasConditions = elseEvent.getConditions().size() > 0;
      title = hasConditions ? 'Else if' : 'Else';
      typeLabel = 'Branch';
      isInvalidElse = !isElseEventValid(eventsList, eventIndex);
      if (!isInvalidElse) {
        const previousIndex = getPreviousExecutableEventIndex(
          eventsList,
          eventIndex
        );
        elseOfPathString =
          previousIndex >= 0
            ? joinPath(path.slice(0, -1).concat(previousIndex))
            : null;
      }
      appendConditionLines(conditionLines, elseEvent.getConditions());
      break;
    }
    case 'BuiltinCommonInstructions::Link': {
      const linkEvent = gd.asLinkEvent(event);
      title = `Link to ${linkEvent.getTarget() || '(no target)'}`;
      typeLabel = 'Link';
      break;
    }
    case 'BuiltinCommonInstructions::JsCode': {
      title = 'JavaScript code';
      typeLabel = 'Code';
      break;
    }
    default:
      title = 'Unsupported event';
      typeLabel = 'Unsupported';
      conditionLines.push(eventType);
      break;
  }

  return {
    title,
    typeLabel,
    isInvalidElse,
    elseOfPathString,
    summaryTitle: getEventSummaryTitle(title, conditionLines),
    conditionLines,
  };
};

export const buildEventsGraphPreviewItems = ({
  eventsList,
  projectScopedContainersAccessor,
  parentPath = [],
  parentDisplayPath = [],
  isAncestorDisabled = false,
}: {|
  eventsList: gdEventsList,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  parentPath?: Array<number>,
  parentDisplayPath?: Array<number>,
  isAncestorDisabled?: boolean,
|}): Array<EventsGraphPreviewItem> => {
  const items: Array<EventsGraphPreviewItem> = [];
  let visibleIndex = 0;
  let pendingRelatedCommentLines: Array<string> = [];

  const attachPendingComments = (
    item: EventsGraphPreviewItem
  ): EventsGraphPreviewItem => {
    if (pendingRelatedCommentLines.length === 0) {
      return item;
    }

    const itemWithRelatedComments = {
      ...item,
      relatedCommentLines: pendingRelatedCommentLines,
    };
    pendingRelatedCommentLines = [];
    return itemWithRelatedComments;
  };

  for (let index = 0; index < eventsList.getEventsCount(); index++) {
    const event = eventsList.getEventAt(index);
    const eventType = event.getType();
    if (eventType === 'BuiltinCommonInstructions::Comment') {
      const commentText = normalizeCatalogCommentText(
        gd.asCommentEvent(event).getComment()
      );
      if (commentText) {
        pendingRelatedCommentLines.push(commentText);
      }
      continue;
    }

    const path = parentPath.concat(index);
    const displayPathParts = parentDisplayPath.concat(visibleIndex);
    const pathString = joinPath(path);
    const displayPath = getDisplayPath(displayPathParts);
    const eventProjectScopedContainersAccessor = event.canHaveVariables()
      ? projectScopedContainersAccessor.makeNewProjectScopedContainersWithLocalVariables(
          event
        )
      : projectScopedContainersAccessor;
    const eventContext = {
      eventsList,
      event,
      indexInList: index,
      projectScopedContainersAccessor: eventProjectScopedContainersAccessor,
    };

    const disabledBecauseOfAncestor = !event.isDisabled() && isAncestorDisabled;
    const childItems = event.canHaveSubEvents()
      ? buildEventsGraphPreviewItems({
          eventsList: event.getSubEvents(),
          projectScopedContainersAccessor: eventProjectScopedContainersAccessor,
          parentPath: path,
          parentDisplayPath: displayPathParts,
          isAncestorDisabled: isAncestorDisabled || event.isDisabled(),
        })
      : [];

    if (eventType === 'BuiltinCommonInstructions::Group') {
      const groupEvent = gd.asGroupEvent(event);
      items.push(
        attachPendingComments({
          itemType: 'group',
          id: `group-${pathString}`,
          path,
          pathString,
          displayPath,
          title: groupEvent.getName() || 'Group',
          typeLabel: 'Group',
          backgroundColor: getGroupBackgroundColor(groupEvent),
          disabled: event.isDisabled(),
          disabledBecauseOfAncestor,
          relatedCommentLines: [],
          children: childItems,
          eventContext,
        })
      );
      visibleIndex++;
      continue;
    }

    const details = buildEventDetails({
      event,
      eventsList,
      eventIndex: index,
      path,
    });

    if (!details) {
      continue;
    }

    items.push(
      attachPendingComments({
        itemType: 'event',
        id: `event-${pathString}`,
        path,
        pathString,
        displayPath,
        disabled: event.isDisabled(),
        disabledBecauseOfAncestor,
        relatedCommentLines: [],
        children: childItems,
        eventContext,
        ...details,
      })
    );
    visibleIndex++;
  }

  if (pendingRelatedCommentLines.length > 0 && items.length > 0) {
    const lastItemIndex = items.length - 1;
    const lastItem = items[lastItemIndex];
    items[lastItemIndex] = {
      ...lastItem,
      relatedCommentLines: lastItem.relatedCommentLines.concat(
        pendingRelatedCommentLines
      ),
    };
  }

  return items;
};
