// @flow
import { mapFor } from '../../../Utils/MapFor';
import {
  renderEventAsEventsScriptLines,
  renderEventsScriptHeaderLine,
  type EventsScriptRenderingError,
} from './EventsScriptRenderer';

const gd: libGDevelop = global.gd;

const INDENT = '  ';

type EventNode = {|
  path: string,
  event: gdBaseEvent,
|};

/**
 * The result of rendering a filtered "source view" of a scene's events as
 * EventScript. `text` is the EventScript (with `# event-N` annotations,
 * ancestors of selected events shown as header lines and skipped siblings
 * shown as `# ...` markers).
 */
export type EventsScriptSourceView = {|
  text: string,
  selectedEventIds: Array<string>,
  truncated: boolean,
  notes: Array<string>,
  renderingErrors: Array<EventsScriptRenderingError>,
|};

const indexEvents = (
  eventsList: gdEventsList,
  parentPath: string,
  nodesByPath: Map<string, EventNode>
) => {
  mapFor(0, eventsList.getEventsCount(), i => {
    const event = eventsList.getEventAt(i);
    const path = (parentPath ? parentPath + '.' : '') + i;
    nodesByPath.set(path, { path, event });
    if (event.canHaveSubEvents()) {
      indexEvents(event.getSubEvents(), path, nodesByPath);
    }
  });
};

const getParentPath = (path: string): string | null => {
  const lastDotIndex = path.lastIndexOf('.');
  return lastDotIndex === -1 ? null : path.slice(0, lastDotIndex);
};

const isDescendantPath = (path: string, ancestorPath: string): boolean =>
  path.startsWith(ancestorPath + '.');

const compareDocumentOrder = (pathA: string, pathB: string): number => {
  const partsA = pathA.split('.').map(Number);
  const partsB = pathB.split('.').map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const a = partsA[i];
    const b = partsB[i];
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    if (a !== b) return a - b;
  }
  return 0;
};

/**
 * The event's own EventScript lines (header, local variables, actions -
 * without its sub-events), used to match the search/object filters.
 */
const renderEventOwnTextForMatching = (
  event: gdBaseEvent,
  path: string
): string => {
  const renderingErrors: Array<EventsScriptRenderingError> = [];
  return renderEventAsEventsScriptLines({
    event,
    eventPath: path,
    indent: '',
    subEventsDepth: 0,
    renderingErrors,
  })
    .filter(line => !line.trim().startsWith('# ...'))
    .join('\n');
};

const makeWordBoundaryRegex = (name: string): RegExp => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z0-9_])${escaped}($|[^A-Za-z0-9_])`);
};

/**
 * Resolve an event id (`event-2.1`, `2.1`) or a group event name to event
 * paths. Returns an empty array when nothing matches.
 */
const resolveEventIdOrGroupName = (
  eventIdOrGroupName: string,
  nodesByPath: Map<string, EventNode>
): Array<string> => {
  const withoutPrefix = eventIdOrGroupName.startsWith('event-')
    ? eventIdOrGroupName.slice('event-'.length)
    : eventIdOrGroupName;
  if (/^\d+(\.\d+)*$/.test(withoutPrefix) && nodesByPath.has(withoutPrefix)) {
    return [withoutPrefix];
  }

  // Not a path: try to match the name of a group event (case-insensitive).
  const lowerCaseName = eventIdOrGroupName.toLowerCase().trim();
  const matchingPaths: Array<string> = [];
  for (const [path, node] of nodesByPath) {
    if (node.event.getType() === 'BuiltinCommonInstructions::Group') {
      const groupEvent = gd.asGroupEvent(node.event);
      if (
        groupEvent
          .getName()
          .toLowerCase()
          .trim() === lowerCaseName
      ) {
        matchingPaths.push(path);
      }
    }
  }
  return matchingPaths;
};

const renderFilteredTree = ({
  eventsList,
  parentPath,
  indent,
  selectedPathsSet,
  ancestorPathsSet,
  subEventsDepth,
  renderingErrors,
}: {|
  eventsList: gdEventsList,
  parentPath: string,
  indent: string,
  selectedPathsSet: Set<string>,
  ancestorPathsSet: Set<string>,
  subEventsDepth: number,
  renderingErrors: Array<EventsScriptRenderingError>,
|}): Array<string> => {
  const lines: Array<string> = [];
  let skippedPaths: Array<string> = [];
  const flushSkipped = () => {
    if (skippedPaths.length === 0) return;
    const shownIds = skippedPaths
      .slice(0, 3)
      .map(path => `event-${path}`)
      .join(', ');
    const ellipsis = skippedPaths.length > 3 ? ', ...' : '';
    lines.push(
      `${indent}# ... ${
        skippedPaths.length
      } other event(s) here (${shownIds}${ellipsis})`
    );
    skippedPaths = [];
  };

  mapFor(0, eventsList.getEventsCount(), i => {
    const event = eventsList.getEventAt(i);
    const path = (parentPath ? parentPath + '.' : '') + i;
    if (selectedPathsSet.has(path)) {
      flushSkipped();
      lines.push(
        ...renderEventAsEventsScriptLines({
          event,
          eventPath: path,
          indent,
          subEventsDepth,
          renderingErrors,
        })
      );
    } else if (ancestorPathsSet.has(path)) {
      flushSkipped();
      lines.push(
        renderEventsScriptHeaderLine({
          event,
          eventPath: path,
          indent,
          renderingErrors,
        })
      );
      if (event.canHaveSubEvents()) {
        lines.push(
          ...renderFilteredTree({
            eventsList: event.getSubEvents(),
            parentPath: path,
            indent: indent + INDENT,
            selectedPathsSet,
            ancestorPathsSet,
            subEventsDepth,
            renderingErrors,
          })
        );
      }
    } else {
      skippedPaths.push(path);
    }
  });
  flushSkipped();
  return lines;
};

/**
 * Build a filtered EventScript "source view" of a scene's events.
 *
 * - With no filter: every top-level event, sub-events collapsed beyond
 *   `subEventsDepth` (default 1).
 * - With `eventIds` (event ids or group names): those events, rendered in
 *   full by default, with their ancestors as header lines for context.
 * - With `searchText`/`objectNames`: events whose own lines (header,
 *   actions, local variables) match, rendered in full by default.
 *   Both compose with `eventIds` (the search is restricted to the subtrees).
 *
 * The result is kept under `maxChars` by first reducing the sub-events
 * depth, then dropping trailing selected events (with a note giving their
 * ids so they can be fetched with another call).
 */
export const buildEventsScriptSourceView = ({
  eventsList,
  eventIds,
  searchText,
  objectNames,
  subEventsDepth,
  maxChars,
}: {|
  eventsList: gdEventsList,
  eventIds?: Array<string> | null,
  searchText?: string | null,
  objectNames?: Array<string> | null,
  subEventsDepth?: number | null,
  maxChars: number,
|}): EventsScriptSourceView => {
  const notes: Array<string> = [];
  const renderingErrors: Array<EventsScriptRenderingError> = [];

  const nodesByPath: Map<string, EventNode> = new Map();
  indexEvents(eventsList, '', nodesByPath);

  const hasEventIds = !!eventIds && eventIds.length > 0;
  const hasSearch =
    (!!searchText && searchText.trim() !== '') ||
    (!!objectNames && objectNames.length > 0);

  // 1) Resolve the scope: subtrees given by `eventIds`, or the whole sheet.
  let scopeRootPaths: Array<string> = [];
  if (hasEventIds && eventIds) {
    for (const eventId of eventIds) {
      const paths = resolveEventIdOrGroupName(eventId, nodesByPath);
      if (paths.length === 0) {
        notes.push(
          `No event found for id or group name "${eventId}" (ids look like "event-2" or "event-2.1.0", as annotated in the source).`
        );
      }
      scopeRootPaths.push(...paths);
    }
    scopeRootPaths.sort(compareDocumentOrder);
    // Remove scope roots nested inside another scope root.
    scopeRootPaths = scopeRootPaths.filter(
      (path, index) =>
        !scopeRootPaths.some(
          (otherPath, otherIndex) =>
            otherIndex !== index && isDescendantPath(path, otherPath)
        )
    );
  }

  // 2) Resolve the selection: filter matches, or the scope roots themselves.
  let selectedPaths: Array<string> = [];
  if (hasSearch) {
    const lowerCaseSearchText = searchText ? searchText.toLowerCase() : null;
    const objectNameRegexes = (objectNames || []).map(makeWordBoundaryRegex);
    const isInScope = (path: string) =>
      !hasEventIds ||
      scopeRootPaths.some(
        rootPath => path === rootPath || isDescendantPath(path, rootPath)
      );

    for (const [path, node] of nodesByPath) {
      if (!isInScope(path)) continue;
      const ownText = renderEventOwnTextForMatching(node.event, path);
      if (
        lowerCaseSearchText &&
        !ownText.toLowerCase().includes(lowerCaseSearchText)
      ) {
        continue;
      }
      if (
        objectNameRegexes.length > 0 &&
        !objectNameRegexes.some(regex => regex.test(ownText))
      ) {
        continue;
      }
      selectedPaths.push(path);
    }
    selectedPaths.sort(compareDocumentOrder);
  } else if (hasEventIds) {
    selectedPaths = scopeRootPaths;
  } else {
    selectedPaths = [...nodesByPath.keys()]
      .filter(path => !path.includes('.'))
      .sort(compareDocumentOrder);
  }

  // Remove selected paths nested inside another selected path: they are
  // rendered as part of the ancestor's sub-events.
  selectedPaths = selectedPaths.filter(
    (path, index) =>
      !selectedPaths.some(
        (otherPath, otherIndex) =>
          otherIndex !== index && isDescendantPath(path, otherPath)
      )
  );

  const selectedEventIds = selectedPaths.map(path => `event-${path}`);
  if (selectedPaths.length === 0) {
    return {
      text: '',
      selectedEventIds,
      truncated: false,
      notes: [
        ...notes,
        hasSearch
          ? 'No event matches the given filters.'
          : 'The events sheet is empty.',
      ],
      renderingErrors,
    };
  }

  // 3) Render, degrading gracefully to stay under `maxChars`: reduce the
  // sub-events depth first, then drop trailing selected events.
  const isWholeSheet = !hasEventIds && !hasSearch;
  const requestedDepth =
    subEventsDepth !== null && subEventsDepth !== undefined
      ? subEventsDepth
      : isWholeSheet
      ? 1
      : Number.MAX_SAFE_INTEGER;

  const depthsToTry = [
    ...new Set([
      requestedDepth,
      ...([4, 2, 1, 0].filter(depth => depth < requestedDepth): Array<number>),
    ]),
  ];

  const renderWithSelection = (paths: Array<string>, depth: number): string => {
    const selectedPathsSet = new Set(paths);
    const ancestorPathsSet: Set<string> = new Set();
    for (const path of paths) {
      let parentPath = getParentPath(path);
      while (parentPath !== null) {
        ancestorPathsSet.add(parentPath);
        parentPath = getParentPath(parentPath);
      }
    }
    return renderFilteredTree({
      eventsList,
      parentPath: '',
      indent: '',
      selectedPathsSet,
      ancestorPathsSet,
      subEventsDepth: depth,
      renderingErrors,
    }).join('\n');
  };

  let text = '';
  let truncated = false;
  let fitted = false;
  for (const depth of depthsToTry) {
    text = renderWithSelection(selectedPaths, depth);
    if (text.length <= maxChars) {
      if (depth < requestedDepth) {
        notes.push(
          'Some sub-events were collapsed to keep the output small: read them with `event_ids` if needed.'
        );
      }
      fitted = true;
      break;
    }
  }

  if (!fitted) {
    // Even at depth 0 the output is too big: drop trailing selected events.
    const keptPaths = [...selectedPaths];
    const droppedPaths: Array<string> = [];
    while (keptPaths.length > 1) {
      const droppedPath = keptPaths.pop();
      if (droppedPath !== undefined) droppedPaths.unshift(droppedPath);
      text = renderWithSelection(keptPaths, 0);
      if (text.length <= maxChars) break;
    }
    if (text.length > maxChars) {
      // A single event still overflowing: hard-truncate as a last resort.
      text = text.slice(0, maxChars) + '\n# (output truncated)';
    }
    if (droppedPaths.length > 0) {
      const droppedIds = droppedPaths.map(path => `event-${path}`);
      notes.push(
        `Output too large: ${
          droppedIds.length
        } selected event(s) not shown (${droppedIds.slice(0, 10).join(', ')}${
          droppedIds.length > 10 ? ', ...' : ''
        }). Call again with \`event_ids\` (or a narrower filter) to read them.`
      );
    }
    truncated = true;
  }

  // Some events (like JavaScript code events) have no EventScript form and
  // are shown as `#` comments: replacing a subtree containing one from this
  // source would silently lose it - warn the reader.
  if (text.includes('cannot be shown as EventScript')) {
    notes.push(
      'This selection contains event(s) that cannot be expressed as EventScript (shown as `#` comments). Do not use `replace_entire_event_and_sub_events` on a subtree containing them (they would be lost): use `replace_event_but_keep_existing_sub_events`, or edit around them.'
    );
  }

  return {
    text,
    selectedEventIds,
    truncated,
    notes,
    renderingErrors,
  };
};
