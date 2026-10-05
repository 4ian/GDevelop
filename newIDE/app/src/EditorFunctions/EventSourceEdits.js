// @flow
import {
  findEventByIdOrGroupName,
  formatNumberedLines,
  renderEventSourceById,
} from '../EventsSheet/EventsTree/TextRenderer/EventScriptSourceView';

const gd: libGDevelop = global.gd;

// The generation API refuses larger event scripts (they are stored with the
// generated events, in an item of 400KB at most).
const MAX_EVENT_SCRIPT_LENGTH = 100000;
const SNIPPET_CONTEXT_LINES = 3;
const MAX_SNIPPET_LINES = 60;
const MAX_LISTED_LINE_NUMBERS = 5;

type EventSourceEdit = {|
  oldString: string,
  newString: string,
  replaceAll: boolean,
|};

type EditedRange = {| start: number, length: number, editIndex: number |};

/**
 * What `edits` apply to: the code of a `js` event (numbered like
 * `jsCodeExcerpt`), the EventScript source of any other event.
 */
type EditableEventSource = {|
  eventId: string,
  text: string,
  // The indentation of the event when it is read among the other events:
  // a text copied from there has it on every line.
  indentation: string,
  // The code of a `js` event is changed directly: there is nothing to
  // generate.
  isJsCode: boolean,
  toEventScript: (text: string) => string,
|};

export type PreparedEventSourceEdits =
  | {| success: false, message: string |}
  | {|
      success: true,
      eventId: string,
      isJsCode: boolean,
      eventScript: string,
      editedText: string,
      editedRanges: Array<EditedRange>,
      replacementsSummary: string,
      includeSubEvents: boolean,
    |};

const getEditableEventSource = ({
  eventsList,
  eventIdOrGroupName,
  includeSubEvents,
}: {|
  eventsList: gdEventsList,
  eventIdOrGroupName: string,
  includeSubEvents: boolean,
|}): EditableEventSource | null => {
  const foundEvent = findEventByIdOrGroupName({
    eventsList,
    eventIdOrGroupName,
  });
  const source = renderEventSourceById({
    eventsList,
    eventIdOrGroupName,
    includeSubEvents,
  });
  if (!foundEvent || source === null) return null;

  const eventId = `event-${foundEvent.path}`;
  if (foundEvent.event.getType() !== 'BuiltinCommonInstructions::JsCode') {
    return {
      eventId,
      text: source,
      indentation: foundEvent.indentation,
      isJsCode: false,
      toEventScript: text => text,
    };
  }
  // The source of a `js` event is its header, its code and the closing
  // `"""` line (the code is not re-indented: the event is shown alone).
  const sourceLines = source.split('\n');
  const headerLine = sourceLines[0];
  const closingLine = sourceLines[sourceLines.length - 1];
  return {
    eventId,
    text: gd
      .asJsCodeEvent(foundEvent.event)
      .getInlineCode()
      .replace(/\r\n/g, '\n'),
    indentation: foundEvent.indentation,
    isJsCode: true,
    toEventScript: code =>
      [headerLine, ...(code === '' ? [] : [code]), closingLine].join('\n'),
  };
};

const getLineNumber = (text: string, index: number): number =>
  text.slice(0, index).split('\n').length;

const removeIndentation = (text: string, indentation: string): string =>
  text
    .split('\n')
    .map(line =>
      line.startsWith(indentation) ? line.slice(indentation.length) : line
    )
    .join('\n');

const getOccurrenceIndexes = (
  text: string,
  searched: string
): Array<number> => {
  const indexes = [];
  let index = text.indexOf(searched);
  while (index !== -1) {
    indexes.push(index);
    index = text.indexOf(searched, index + searched.length);
  }
  return indexes;
};

const listLineNumbers = (text: string, indexes: Array<number>): string =>
  indexes
    .slice(0, MAX_LISTED_LINE_NUMBERS)
    .map(index => getLineNumber(text, index))
    .join(', ') + (indexes.length > MAX_LISTED_LINE_NUMBERS ? ', ...' : '');

/**
 * What each edit replaced, so that a too broad `old_string` (a `replace_all`
 * matching more than intended) shows: "Edit 1 replaced 2 occurrences (lines
 * 1, 2104)."
 */
const getReplacementsSummary = (
  text: string,
  editedRanges: Array<EditedRange>,
  editsCount: number
): string => {
  const sentences = [];
  for (let editIndex = 0; editIndex < editsCount; editIndex++) {
    const starts = editedRanges
      .filter(range => range.editIndex === editIndex)
      .map(range => range.start)
      .sort((a, b) => a - b);
    sentences.push(
      `Edit ${editIndex + 1} replaced ${starts.length} occurrence${
        starts.length > 1 ? 's' : ''
      } (line${starts.length > 1 ? 's' : ''} ${listLineNumbers(text, starts)}).`
    );
  }
  return sentences.join(' ');
};

const getNotFoundHints = (text: string, oldString: string): Array<string> => {
  const hints = [];
  if (/^\d+\t/.test(oldString)) {
    hints.push(
      'Remove the line numbers and tabs copied from a numbered excerpt.'
    );
  }
  const firstLine = oldString
    .split('\n')
    .map(line => line.replace(/^\d+\t/, '').trim())
    .find(line => line !== '');
  const firstLineIndexes = firstLine
    ? getOccurrenceIndexes(text, firstLine)
    : [];
  if (firstLineIndexes.length > 0) {
    hints.push(
      `Its first line is found at line(s) ${listLineNumbers(
        text,
        firstLineIndexes
      )}: what follows differs.`
    );
  }
  hints.push(
    'Read the event again with `read_events_source` (`event_ids`, and `search` or `js_from_line` for a large `js` event) and copy the text exactly.'
  );
  return hints;
};

/**
 * Apply the edits one after the other, like a coding agent's exact string
 * replacements: each `old_string` must be found exactly once (or set
 * `replace_all`). A text copied from a read showing the event among others
 * has its indentation: it is matched without it too.
 */
const applyEdits = ({
  editableEventSource: { eventId, text: sourceText, indentation },
  edits,
}: {|
  editableEventSource: EditableEventSource,
  edits: Array<EventSourceEdit>,
|}):
  | {| success: false, message: string |}
  | {| success: true, text: string, editedRanges: Array<EditedRange> |} => {
  let text = sourceText;
  const editedRanges: Array<EditedRange> = [];
  for (let editIndex = 0; editIndex < edits.length; editIndex++) {
    const editLabel = `Edit ${editIndex + 1} of ${eventId}`;
    let { oldString, newString } = edits[editIndex];
    if (oldString === '') {
      return {
        success: false,
        message: `${editLabel}: \`old_string\` is empty. Give the exact text to replace.`,
      };
    }
    let indexes = getOccurrenceIndexes(text, oldString);
    if (indexes.length === 0 && indentation) {
      const oldStringWithoutIndentation = removeIndentation(
        oldString,
        indentation
      );
      const indexesWithoutIndentation = getOccurrenceIndexes(
        text,
        oldStringWithoutIndentation
      );
      if (indexesWithoutIndentation.length > 0) {
        oldString = oldStringWithoutIndentation;
        newString = removeIndentation(newString, indentation);
        indexes = indexesWithoutIndentation;
      }
    }
    if (indexes.length === 0) {
      return {
        success: false,
        message: [
          `${editLabel}: \`old_string\` is not in its current source.`,
          ...getNotFoundHints(text, oldString),
        ].join(' '),
      };
    }
    if (indexes.length > 1 && !edits[editIndex].replaceAll) {
      return {
        success: false,
        message: `${editLabel}: \`old_string\` is found ${
          indexes.length
        } times (at lines ${listLineNumbers(
          text,
          indexes
        )}). Add lines around it to make it unique, or set \`replace_all\`.`,
      };
    }

    // Replace from the last occurrence, so the indexes before stay valid,
    // and move the ranges edited before that follow a replaced text.
    const lengthDifference = newString.length - oldString.length;
    for (let i = indexes.length - 1; i >= 0; i--) {
      const index = indexes[i];
      text =
        text.slice(0, index) + newString + text.slice(index + oldString.length);
      for (const range of editedRanges) {
        if (range.start > index) range.start += lengthDifference;
      }
    }
    for (let i = 0; i < indexes.length; i++) {
      editedRanges.push({
        start: indexes[i] + i * lengthDifference,
        length: newString.length,
        editIndex,
      });
    }
  }
  return { success: true, text, editedRanges };
};

/**
 * The `edits` of a batch of `generate_events` turned into the `event_script`
 * replacing the event (null when the batch has none): the editor applies them
 * to the current source of the event, so it is not resent in full.
 */
export const prepareEventSourceEdits = ({
  eventsList,
  batch,
  batchLabel,
}: {|
  eventsList: gdEventsList,
  batch: any,
  batchLabel: string,
|}): PreparedEventSourceEdits | null => {
  if (!batch || !Array.isArray(batch.edits) || batch.edits.length === 0) {
    return null;
  }
  const edits: Array<EventSourceEdit> = batch.edits.map(edit => ({
    oldString:
      edit && typeof edit.old_string === 'string' ? edit.old_string : '',
    newString:
      edit && typeof edit.new_string === 'string' ? edit.new_string : '',
    replaceAll: !!edit && edit.replace_all === true,
  }));
  const placementRelation = batch.placement_relation;
  const placementTargetEventId =
    typeof batch.placement_target_event_id === 'string'
      ? batch.placement_target_event_id
      : '';
  const fail = (message: string): PreparedEventSourceEdits => ({
    success: false,
    message: `${batchLabel}${message}`,
  });

  if (typeof batch.event_script === 'string' && batch.event_script) {
    return fail(
      'Give either `edits` or `event_script`, not both: `edits` change the current source of the event, `event_script` replaces it.'
    );
  }
  const includeSubEvents =
    placementRelation === 'replace_entire_event_and_sub_events';
  if (
    !includeSubEvents &&
    placementRelation !== 'replace_event_but_keep_existing_sub_events'
  ) {
    return fail(
      '`edits` change an existing event: use them with `replace_event_but_keep_existing_sub_events` (the event without its sub-events) or `replace_entire_event_and_sub_events` (the event with its sub-events).'
    );
  }
  const editableEventSource = getEditableEventSource({
    eventsList,
    eventIdOrGroupName: placementTargetEventId,
    includeSubEvents,
  });
  if (!editableEventSource) {
    return fail(
      `No event found for "${placementTargetEventId}" (\`placement_target_event_id\`).`
    );
  }

  const editsResult = applyEdits({ editableEventSource, edits });
  if (!editsResult.success) return fail(editsResult.message);

  const eventScript = editableEventSource.toEventScript(editsResult.text);
  if (
    !editableEventSource.isJsCode &&
    eventScript.length > MAX_EVENT_SCRIPT_LENGTH
  ) {
    return fail(
      `The edited ${editableEventSource.eventId} is too large to be sent (${
        eventScript.length
      } characters, at most ${MAX_EVENT_SCRIPT_LENGTH}).`
    );
  }
  return {
    success: true,
    eventId: editableEventSource.eventId,
    isJsCode: editableEventSource.isJsCode,
    eventScript,
    editedText: editsResult.text,
    editedRanges: editsResult.editedRanges,
    replacementsSummary: getReplacementsSummary(
      editsResult.text,
      editsResult.editedRanges,
      edits.length
    ),
    includeSubEvents,
  };
};

/**
 * An edit of `generate_events` as the lines it removes (`-`) and adds (`+`),
 * to show it in the chat.
 */
export const formatEditAsDiff = (edit: any): string => {
  const oldString =
    edit && typeof edit.old_string === 'string' ? edit.old_string : '';
  const newString =
    edit && typeof edit.new_string === 'string' ? edit.new_string : '';
  return [
    ...oldString.split('\n').map(line => `- ${line}`),
    ...newString.split('\n').map(line => `+ ${line}`),
    ...(edit && edit.replace_all === true ? ['(every occurrence)'] : []),
  ].join('\n');
};

/**
 * Set the edited code on the `js` event: unlike the other events, nothing
 * needs to be generated (so its size is not limited).
 */
export const applyJsCodeEdits = ({
  eventsList,
  preparedEdits: { eventId, editedText },
}: {|
  eventsList: gdEventsList,
  preparedEdits: { eventId: string, editedText: string, ... },
|}): void => {
  const foundEvent = findEventByIdOrGroupName({
    eventsList,
    eventIdOrGroupName: eventId,
  });
  if (!foundEvent) return;
  gd.asJsCodeEvent(foundEvent.event).setInlineCode(editedText);
};

/**
 * The lines around the edits, numbered, in the source of the edited event
 * as it is now in the events (the code of a `js` event, the EventScript
 * source of any other event).
 */
export const renderEditedEventSnippet = ({
  eventsList,
  preparedEdits: { eventId, editedText, editedRanges, includeSubEvents },
}: {|
  eventsList: gdEventsList,
  preparedEdits: {
    eventId: string,
    editedText: string,
    editedRanges: Array<EditedRange>,
    includeSubEvents: boolean,
    ...
  },
|}): string => {
  const editableEventSource = getEditableEventSource({
    eventsList,
    eventIdOrGroupName: eventId,
    includeSubEvents,
  });
  const lines = (editableEventSource
    ? editableEventSource.text
    : editedText
  ).split('\n');

  const lineRanges = editedRanges
    .map(({ start, length }) => ({
      from: Math.max(
        0,
        getLineNumber(editedText, start) - 1 - SNIPPET_CONTEXT_LINES
      ),
      to: Math.min(
        lines.length - 1,
        getLineNumber(editedText, start + length) - 1 + SNIPPET_CONTEXT_LINES
      ),
    }))
    .sort((a, b) => a.from - b.from);
  const snippetLines = [];
  let lastShownIndex = -1;
  for (const { from, to } of lineRanges) {
    const blockStart = Math.max(from, lastShownIndex + 1);
    if (blockStart > to) continue;
    if (snippetLines.length + (to - blockStart + 1) > MAX_SNIPPET_LINES) {
      snippetLines.push('-- (the lines around the next edits are not shown)');
      break;
    }
    if (lastShownIndex !== -1 && blockStart > lastShownIndex + 1) {
      snippetLines.push('--');
    }
    snippetLines.push(
      ...formatNumberedLines(lines.slice(blockStart, to + 1), blockStart)
    );
    lastShownIndex = to;
  }
  return snippetLines.join('\n');
};
