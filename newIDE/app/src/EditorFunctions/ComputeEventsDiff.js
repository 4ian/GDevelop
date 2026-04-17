// @flow
import { unserializeFromJSObject } from '../Utils/Serializer';
import { renderNonTranslatedEventsAsText } from '../EventsSheet/EventsTree/TextRenderer';

const gd: libGDevelop = global.gd;

// Serialized event tree as produced by `serializeToJSObject(eventsList)`.
type EventJson = Object;

// Dot-separated 0-based path through the event tree (e.g. "0.1.2"),
// matching the `event-X.Y.Z` convention of the events text renderer.
type PathKey = string;

export type AddedEventEntry = {|
  path: PathKey,
  afterJson: EventJson,
|};

export type DeletedEventEntry = {|
  path: PathKey,
  beforeJson: EventJson,
|};

export type ModifiedEventEntry = {|
  path: PathKey,
  beforePath: PathKey,
  beforeJson: EventJson,
  afterJson: EventJson,
|};

export type MovedEventEntry = {|
  fromPath: PathKey,
  toPath: PathKey,
  json: EventJson,
|};

// Rendering-agnostic description of the changes between two events trees.
// Designed to be reused by both the text renderer below and any future visual
// consumer (e.g. a red/green/yellow gutter in the EventsSheet).
export type EventsDiff = {|
  added: Array<AddedEventEntry>,
  deleted: Array<DeletedEventEntry>,
  modified: Array<ModifiedEventEntry>,
  moved: Array<MovedEventEntry>,
  unchangedCount: number,
|};

export const isEventsDiffEmpty = (diff: EventsDiff): boolean =>
  diff.added.length === 0 &&
  diff.deleted.length === 0 &&
  diff.modified.length === 0 &&
  diff.moved.length === 0;

type FlatEntry = {| path: PathKey, json: EventJson |};

const collectEvents = (
  events: Array<EventJson>,
  parentPath: string,
  into: Array<FlatEntry>
): void => {
  events.forEach((eventJson, index) => {
    const path = parentPath === '' ? String(index) : `${parentPath}.${index}`;
    into.push({ path, json: eventJson });
    const subEvents = eventJson.events;
    if (Array.isArray(subEvents) && subEvents.length > 0) {
      collectEvents(subEvents, path, into);
    }
  });
};

// Stable structural hash. Both sides come from the same serializer, so equal
// semantic events produce byte-identical JSON strings.
const contentHash = (json: EventJson): string => JSON.stringify(json);

const getAiGeneratedEventId = (json: EventJson): string | null => {
  const id = json.aiGeneratedEventId;
  return typeof id === 'string' && id.length > 0 ? id : null;
};

const getParentPath = (path: PathKey): PathKey => {
  const lastDot = path.lastIndexOf('.');
  return lastDot === -1 ? '' : path.substring(0, lastDot);
};

export const computeEventsDiff = ({
  beforeEventsJson,
  afterEventsJson,
}: {|
  beforeEventsJson: Array<EventJson>,
  afterEventsJson: Array<EventJson>,
|}): EventsDiff => {
  const before: Array<FlatEntry> = [];
  collectEvents(beforeEventsJson, '', before);
  const after: Array<FlatEntry> = [];
  collectEvents(afterEventsJson, '', after);

  const beforeByPath: Map<PathKey, FlatEntry> = new Map(
    before.map(e => [e.path, e])
  );
  const afterByPath: Map<PathKey, FlatEntry> = new Map(
    after.map(e => [e.path, e])
  );

  const matchedBeforePaths: Set<PathKey> = new Set();
  const matchedAfterPaths: Set<PathKey> = new Set();
  const matches: Array<{| beforePath: PathKey, afterPath: PathKey |}> = [];

  // Pass 1: match by aiGeneratedEventId — the strongest identity signal.
  const beforeByAiId: Map<string, Array<PathKey>> = new Map();
  before.forEach(({ path, json }) => {
    const id = getAiGeneratedEventId(json);
    if (!id) return;
    const list = beforeByAiId.get(id) || [];
    list.push(path);
    beforeByAiId.set(id, list);
  });
  after.forEach(({ path: afterPath, json: afterJson }) => {
    const id = getAiGeneratedEventId(afterJson);
    if (!id) return;
    const candidates = beforeByAiId.get(id);
    if (!candidates) return;
    const beforePath = candidates.find(p => !matchedBeforePaths.has(p));
    if (beforePath === undefined) return;
    matchedBeforePaths.add(beforePath);
    matchedAfterPaths.add(afterPath);
    matches.push({ beforePath, afterPath });
  });

  // Pass 2: exact content hash — catches unchanged events and pure moves.
  const beforeByHash: Map<string, Array<PathKey>> = new Map();
  before.forEach(({ path, json }) => {
    if (matchedBeforePaths.has(path)) return;
    const hash = contentHash(json);
    const list = beforeByHash.get(hash) || [];
    list.push(path);
    beforeByHash.set(hash, list);
  });
  after.forEach(({ path: afterPath, json: afterJson }) => {
    if (matchedAfterPaths.has(afterPath)) return;
    const hash = contentHash(afterJson);
    const candidates = beforeByHash.get(hash);
    if (!candidates || candidates.length === 0) return;
    // Prefer a candidate at the same path so unchanged events stay on the
    // stable branch rather than being marked as moved.
    let beforePath = candidates.find(
      p => p === afterPath && !matchedBeforePaths.has(p)
    );
    if (!beforePath) {
      beforePath = candidates.find(p => !matchedBeforePaths.has(p));
    }
    if (beforePath === undefined) return;
    matchedBeforePaths.add(beforePath);
    matchedAfterPaths.add(afterPath);
    matches.push({ beforePath, afterPath });
  });

  // Pass 3: same path + same type ⇒ in-place modification (content differs).
  const modified: Array<ModifiedEventEntry> = [];
  after.forEach(({ path: afterPath, json: afterJson }) => {
    if (matchedAfterPaths.has(afterPath)) return;
    if (matchedBeforePaths.has(afterPath)) return;
    const beforeEntry = beforeByPath.get(afterPath);
    if (!beforeEntry) return;
    if (beforeEntry.json.type !== afterJson.type) return;
    matchedBeforePaths.add(afterPath);
    matchedAfterPaths.add(afterPath);
    modified.push({
      path: afterPath,
      beforePath: afterPath,
      beforeJson: beforeEntry.json,
      afterJson,
    });
  });

  // Resolve the Pass 1/2 matches into unchanged / moved / modified buckets.
  const moved: Array<MovedEventEntry> = [];
  let unchangedCount = 0;
  matches.forEach(({ beforePath, afterPath }) => {
    const beforeEntry = beforeByPath.get(beforePath);
    const afterEntry = afterByPath.get(afterPath);
    if (!beforeEntry || !afterEntry) return;
    const sameHash =
      contentHash(beforeEntry.json) === contentHash(afterEntry.json);
    if (sameHash) {
      // Same-parent shuffles are just noise caused by inserts/deletes in the
      // parent; fold them into "unchanged" so the diff stays readable.
      const sameParent =
        getParentPath(beforePath) === getParentPath(afterPath);
      if (beforePath === afterPath || sameParent) {
        unchangedCount += 1;
      } else {
        moved.push({
          fromPath: beforePath,
          toPath: afterPath,
          json: afterEntry.json,
        });
      }
    } else {
      modified.push({
        path: afterPath,
        beforePath,
        beforeJson: beforeEntry.json,
        afterJson: afterEntry.json,
      });
    }
  });

  const added: Array<AddedEventEntry> = [];
  after.forEach(({ path, json }) => {
    if (!matchedAfterPaths.has(path)) {
      added.push({ path, afterJson: json });
    }
  });
  const deleted: Array<DeletedEventEntry> = [];
  before.forEach(({ path, json }) => {
    if (!matchedBeforePaths.has(path)) {
      deleted.push({ path, beforeJson: json });
    }
  });

  return { added, deleted, modified, moved, unchangedCount };
};

const pathCompare = (a: PathKey, b: PathKey): number =>
  a < b ? -1 : a > b ? 1 : 0;

// Render a single event JSON by piping it through the regular text renderer,
// so the per-event output is byte-identical to what TextRenderer.spec.js
// produces. A fresh temporary gd.EventsList is used and disposed each time.
const renderEventJsonAsText = (
  project: gdProject,
  eventJson: EventJson
): string => {
  const tempList = new gd.EventsList();
  try {
    unserializeFromJSObject(
      tempList,
      [eventJson],
      'unserializeFrom',
      project
    );
    return renderNonTranslatedEventsAsText({ eventsList: tempList });
  } finally {
    tempList.delete();
  }
};

const pushIndented = (
  lines: Array<string>,
  text: string,
  indent: string
): void => {
  text.split('\n').forEach(line => lines.push(indent + line));
};

type RenderOptions = {|
  project: gdProject,
  sceneName?: string,
  // Soft cap on total output lines; when exceeded, the tail is trimmed.
  maxLines?: number,
  // Soft cap on events rendered per section ([+]/[-]/[~]).
  maxEventsPerSection?: number,
|};

export const renderEventsDiffAsText = (
  diff: EventsDiff,
  options: RenderOptions
): string => {
  const { project, sceneName, maxLines, maxEventsPerSection } = options;
  const sectionCap =
    typeof maxEventsPerSection === 'number' && maxEventsPerSection >= 0
      ? maxEventsPerSection
      : Infinity;

  if (isEventsDiffEmpty(diff)) {
    const scope = sceneName ? ` in scene "${sceneName}"` : '';
    return `=== No event changes${scope} (${
      diff.unchangedCount
    } events unchanged) ===`;
  }

  const header = sceneName
    ? `=== Changes to events of scene "${sceneName}" ===`
    : '=== Event changes ===';
  const lines: Array<string> = [header, ''];

  const renderSection = <T>(
    sortedEntries: Array<T>,
    renderOne: (T) => void,
    sectionLabel: string
  ): void => {
    const kept = sortedEntries.slice(0, sectionCap);
    kept.forEach(renderOne);
    const omitted = sortedEntries.length - kept.length;
    if (omitted > 0) {
      lines.push(`(+ ${omitted} more ${sectionLabel} change(s) omitted)`);
      lines.push('');
    }
  };

  const sortedAdded = [...diff.added].sort((a, b) =>
    pathCompare(a.path, b.path)
  );
  renderSection(
    sortedAdded,
    entry => {
      const body = renderEventJsonAsText(project, entry.afterJson);
      lines.push(`[+] Added event-${entry.path}:`);
      pushIndented(lines, body, '  ');
      lines.push('');
    },
    '[+] added'
  );

  const sortedDeleted = [...diff.deleted].sort((a, b) =>
    pathCompare(a.path, b.path)
  );
  renderSection(
    sortedDeleted,
    entry => {
      const body = renderEventJsonAsText(project, entry.beforeJson);
      lines.push(`[-] Deleted event-${entry.path}:`);
      pushIndented(lines, body, '  ');
      lines.push('');
    },
    '[-] deleted'
  );

  const sortedModified = [...diff.modified].sort((a, b) =>
    pathCompare(a.path, b.path)
  );
  renderSection(
    sortedModified,
    entry => {
      const before = renderEventJsonAsText(project, entry.beforeJson);
      const after = renderEventJsonAsText(project, entry.afterJson);
      lines.push(`[~] Modified event-${entry.path}:`);
      lines.push('  Before:');
      pushIndented(lines, before, '   ');
      lines.push('  After:');
      pushIndented(lines, after, '   ');
      lines.push('');
    },
    '[~] modified'
  );

  const sortedMoved = [...diff.moved].sort((a, b) =>
    pathCompare(a.toPath, b.toPath)
  );
  renderSection(
    sortedMoved,
    entry => {
      lines.push(
        `[>] Moved event from event-${entry.fromPath} to event-${
          entry.toPath
        } (content unchanged).`
      );
      lines.push('');
    },
    '[>] moved'
  );

  lines.push(`(${diff.unchangedCount} events unchanged)`);

  if (typeof maxLines === 'number' && maxLines >= 0 && lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    truncated.push(
      `(${lines.length -
        maxLines} more lines omitted to stay under ${maxLines} lines)`
    );
    return truncated.join('\n');
  }
  return lines.join('\n');
};
