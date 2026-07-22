// @flow
// Renders events as EventScript source (the syntax accepted by the
// `event_script` field of events generation - see `events-script.js` in the
// GDevelop-services repository, which documents the grammar).
//
// This module mirrors the backend serializer (`events-script-serializer.js`
// in GDevelop-services): same function names, same rendering rules - only
// the inputs differ (gd objects + platform metadata here, events JSON +
// features summary there). Both are held together by the SHARED conformance
// fixtures (`EventScriptRenderer.fixtures.json`, byte-identical in both
// repositories): any rendering change must update the fixtures on both
// sides. See the README next to the backend parser for the full map of the
// EventScript ecosystem.
import { mapFor, mapVector } from '../../../Utils/MapFor';

const gd: libGDevelop = global.gd;

// A failure to render an event/instruction as EventScript, with `path`
// locating the node (same paths as the events text renderer: `event-1.2`).
export type EventScriptRenderingError = {|
  path: string,
  message: string,
|};

const getErrorMessage = (error: mixed): string =>
  error && typeof error === 'object' && typeof error.message === 'string'
    ? error.message
    : String(error);

const INDENT = '  ';

/**
 * Escape a raw parameter value so it stays on a single line (the EventScript
 * grammar is line-based). Real newlines only legitimately appear inside
 * string literals, where the `\n` escape is understood by the parser (and by
 * the compilation, which turns it into `NewLine()`).
 */
const escapeParameterValue = (value: string): string =>
  value.replace(/\r?\n/g, '\\n');

/**
 * Escape the content of a double-quoted EventScript string literal
 * (used for `comment "..."`, `group "..."`, `link "..."`).
 */
const escapeStringLiteral = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, '\\n');

/**
 * Render the arguments of an instruction call, keeping only the "visible"
 * parameters (code-only parameters are hidden slots filled by the engine:
 * the EventScript compilation re-inserts them). Trailing empty optional
 * parameters are dropped for brevity (the compilation refills them).
 */
const renderInstructionArguments = (
  instruction: gdInstruction,
  metadata: gdInstructionMetadata
): Array<string> => {
  const instructionParametersCount = instruction.getParametersCount();
  const values: Array<string> = [];

  if (gd.MetadataProvider.isBadInstructionMetadata(metadata)) {
    // Unknown instruction: keep every parameter as-is (we cannot know which
    // slots are code-only).
    for (let index = 0; index < instructionParametersCount; index++) {
      values.push(
        escapeParameterValue(instruction.getParameter(index).getPlainString())
      );
    }
  } else {
    const metadataParametersCount = metadata.getParametersCount();
    for (let index = 0; index < metadataParametersCount; index++) {
      const parameterMetadata = metadata.getParameter(index);
      if (parameterMetadata.isCodeOnly()) continue;

      const value =
        index < instructionParametersCount
          ? instruction.getParameter(index).getPlainString()
          : '';
      values.push(escapeParameterValue(value));
    }
    // Extra parameters not declared by the metadata (can happen with stale
    // projects): keep them rather than silently losing values.
    for (
      let index = metadataParametersCount;
      index < instructionParametersCount;
      index++
    ) {
      values.push(
        escapeParameterValue(instruction.getParameter(index).getPlainString())
      );
    }
  }

  // Trailing empty values (bare `` or quoted `""`) are refilled by the
  // compilation: drop them for brevity.
  while (
    values.length > 0 &&
    (values[values.length - 1].trim() === '' ||
      values[values.length - 1].trim() === '""')
  ) {
    values.pop();
  }
  return values;
};

const ONCE_TYPE = 'BuiltinCommonInstructions::Once';
const OR_TYPE = 'BuiltinCommonInstructions::Or';
const AND_TYPE = 'BuiltinCommonInstructions::And';
const NOT_TYPE = 'BuiltinCommonInstructions::Not';

/**
 * Render one condition as an EventScript condition expression
 * (`ConditionName(args)`, `once`, `not X`, `Or(...)`, `(a and b)`).
 */
const renderConditionExpression = (
  instruction: gdInstruction,
  eventPath: string,
  renderingErrors: Array<EventScriptRenderingError>
): string => {
  const type = instruction.getType();

  if (type === ONCE_TYPE) {
    return instruction.isInverted() ? 'not once' : 'once';
  }
  if (type === OR_TYPE || type === AND_TYPE || type === NOT_TYPE) {
    const operands = mapFor(0, instruction.getSubInstructions().size(), i =>
      renderConditionExpression(
        instruction.getSubInstructions().get(i),
        eventPath,
        renderingErrors
      )
    );
    let rendered;
    if (type === OR_TYPE) {
      rendered = `Or(${operands.join(', ')})`;
    } else if (type === AND_TYPE) {
      rendered =
        operands.length === 0 ? 'And()' : `(${operands.join(' and ')})`;
    } else {
      rendered =
        operands.length === 0
          ? 'Not()'
          : operands.length === 1
          ? `not ${operands[0]}`
          : `not (${operands.join(' and ')})`;
    }
    return instruction.isInverted() ? `not ${rendered}` : rendered;
  }

  const metadata = gd.MetadataProvider.getConditionMetadata(
    gd.JsPlatform.get(),
    type
  );
  const args = renderInstructionArguments(instruction, metadata);
  const call = `${type}(${args.join(', ')})`;
  return instruction.isInverted() ? `not ${call}` : call;
};

/**
 * Render a conditions list as a single EventScript condition expression
 * (conditions of a list are an implicit AND).
 */
const renderConditionsListExpression = (
  conditionsList: gdInstructionsList,
  eventPath: string,
  renderingErrors: Array<EventScriptRenderingError>
): string => {
  return mapFor(0, conditionsList.size(), i =>
    renderConditionExpression(conditionsList.get(i), eventPath, renderingErrors)
  ).join(' and ');
};

const renderActionLine = (
  instruction: gdInstruction,
  eventPath: string,
  renderingErrors: Array<EventScriptRenderingError>
): string => {
  const type = instruction.getType();
  const metadata = gd.MetadataProvider.getActionMetadata(
    gd.JsPlatform.get(),
    type
  );
  const args = renderInstructionArguments(instruction, metadata);
  const awaitPrefix = instruction.isAwaited() ? 'await ' : '';
  return `${awaitPrefix}${type}(${args.join(', ')})`;
};

// $FlowFixMe[recursive-definition]
const convertVariableToJsObject = (variable: gdVariable) => {
  if (variable.getType() === gd.Variable.String) {
    return variable.getString();
  } else if (variable.getType() === gd.Variable.Number) {
    return variable.getValue();
  } else if (variable.getType() === gd.Variable.Boolean) {
    return variable.getBool();
  } else if (variable.getType() === gd.Variable.Structure) {
    const childrenNames = variable.getAllChildrenNames().toJSArray();
    const object = {};
    childrenNames.forEach(childName => {
      // $FlowFixMe[prop-missing]
      object[childName] = convertVariableToJsObject(
        variable.getChild(childName)
      );
    });
    return object;
  } else if (variable.getType() === gd.Variable.Array) {
    const children = variable.getAllChildrenArray();
    return mapVector(children, child => convertVariableToJsObject(child));
  }

  // Should not happen:
  return variable.getValue();
};

const renderLocalVariableLines = (
  variables: gdVariablesContainer,
  excludedVariableName: string
): Array<string> => {
  const lines = [];
  mapFor(0, variables.count(), i => {
    const variableName = variables.getNameAt(i);
    if (excludedVariableName && variableName === excludedVariableName) {
      return;
    }
    const variable = variables.getAt(i);
    const type = gd.Variable.typeAsString(variable.getType());
    const value = JSON.stringify(convertVariableToJsObject(variable));
    lines.push(`local ${type} ${variableName} = ${value}`);
  });
  return lines;
};

/**
 * The loop index variable of a loop event (the `index X` clause), or an
 * empty string. Its declaration as an event variable is implied by the
 * clause: rendering it as a `local` declaration too would be redundant and
 * misleading (it looks like a declaration shadowing the loop index).
 */
const getLoopIndexVariableName = (event: gdBaseEvent): string => {
  const type = event.getType();
  if (type === 'BuiltinCommonInstructions::Repeat') {
    return gd.asRepeatEvent(event).getLoopIndexVariableName();
  }
  if (type === 'BuiltinCommonInstructions::ForEach') {
    return gd.asForEachEvent(event).getLoopIndexVariableName();
  }
  if (type === 'BuiltinCommonInstructions::While') {
    return gd.asWhileEvent(event).getLoopIndexVariableName();
  }
  if (type === 'BuiltinCommonInstructions::ForEachChildVariable') {
    return gd.asForEachChildVariableEvent(event).getLoopIndexVariableName();
  }
  return '';
};

/**
 * The header of an event and its actions list, in a form ready to be
 * rendered as EventScript. `header` is without indentation, `disabled`
 * prefix, trailing `:` and id annotation. Events without a body (comment,
 * link) have `standaloneLine` instead.
 */
type EventScriptParts = {|
  header?: string,
  standaloneLine?: string,
  actionsList?: gdInstructionsList,
|};

const buildEventScriptParts = (
  event: gdBaseEvent,
  eventPath: string,
  renderingErrors: Array<EventScriptRenderingError>
): EventScriptParts | null => {
  const type = event.getType();

  if (type === 'BuiltinCommonInstructions::Standard') {
    const standardEvent = gd.asStandardEvent(event);
    const conditions = renderConditionsListExpression(
      standardEvent.getConditions(),
      eventPath,
      renderingErrors
    );
    return {
      header: conditions ? `if ${conditions}` : 'always',
      actionsList: standardEvent.getActions(),
    };
  }
  if (type === 'BuiltinCommonInstructions::Else') {
    const elseEvent = gd.asElseEvent(event);
    const conditions = renderConditionsListExpression(
      elseEvent.getConditions(),
      eventPath,
      renderingErrors
    );
    return {
      header: conditions ? `else if ${conditions}` : 'else',
      actionsList: elseEvent.getActions(),
    };
  }
  if (type === 'BuiltinCommonInstructions::While') {
    const whileEvent = gd.asWhileEvent(event);
    const whileConditions = renderConditionsListExpression(
      whileEvent.getWhileConditions(),
      eventPath,
      renderingErrors
    );
    const conditions = renderConditionsListExpression(
      whileEvent.getConditions(),
      eventPath,
      renderingErrors
    );
    const indexClause = whileEvent.getLoopIndexVariableName()
      ? ` index ${whileEvent.getLoopIndexVariableName()}`
      : '';
    const ifClause = conditions ? ` if ${conditions}` : '';
    return {
      header: `while ${whileConditions}${indexClause}${ifClause}`,
      actionsList: whileEvent.getActions(),
    };
  }
  if (type === 'BuiltinCommonInstructions::Repeat') {
    const repeatEvent = gd.asRepeatEvent(event);
    const conditions = renderConditionsListExpression(
      repeatEvent.getConditions(),
      eventPath,
      renderingErrors
    );
    const indexClause = repeatEvent.getLoopIndexVariableName()
      ? ` index ${repeatEvent.getLoopIndexVariableName()}`
      : '';
    const ifClause = conditions ? ` if ${conditions}` : '';
    // An empty repeat expression (a repeat event just created in the
    // editor) renders as `repeat 0 times` so the output stays parseable.
    return {
      header: `repeat ${repeatEvent.getRepeatExpression().getPlainString() ||
        '0'} times${indexClause}${ifClause}`,
      actionsList: repeatEvent.getActions(),
    };
  }
  if (type === 'BuiltinCommonInstructions::ForEach') {
    const forEachEvent = gd.asForEachEvent(event);
    const conditions = renderConditionsListExpression(
      forEachEvent.getConditions(),
      eventPath,
      renderingErrors
    );
    const orderBy = forEachEvent.getOrderBy();
    const orderClause = orderBy
      ? ` order by ${orderBy} ${
          forEachEvent.getOrder() === 'desc' ? 'desc' : 'asc'
        }`
      : '';
    const limitClause = forEachEvent.getLimit()
      ? ` limit ${forEachEvent.getLimit()}`
      : '';
    const indexClause = forEachEvent.getLoopIndexVariableName()
      ? ` index ${forEachEvent.getLoopIndexVariableName()}`
      : '';
    const ifClause = conditions ? ` if ${conditions}` : '';
    return {
      header: `for each ${forEachEvent.getObjectToPick()}${orderClause}${limitClause}${indexClause}${ifClause}`,
      actionsList: forEachEvent.getActions(),
    };
  }
  if (type === 'BuiltinCommonInstructions::ForEachChildVariable') {
    const forEachChildVariableEvent = gd.asForEachChildVariableEvent(event);
    const conditions = renderConditionsListExpression(
      forEachChildVariableEvent.getConditions(),
      eventPath,
      renderingErrors
    );
    const valueClause = forEachChildVariableEvent.getValueIteratorVariableName()
      ? ` value ${forEachChildVariableEvent.getValueIteratorVariableName()}`
      : '';
    const keyClause = forEachChildVariableEvent.getKeyIteratorVariableName()
      ? ` key ${forEachChildVariableEvent.getKeyIteratorVariableName()}`
      : '';
    const indexClause = forEachChildVariableEvent.getLoopIndexVariableName()
      ? ` index ${forEachChildVariableEvent.getLoopIndexVariableName()}`
      : '';
    const ifClause = conditions ? ` if ${conditions}` : '';
    return {
      header: `for each child in ${forEachChildVariableEvent.getIterableVariableName()}${valueClause}${keyClause}${indexClause}${ifClause}`,
      actionsList: forEachChildVariableEvent.getActions(),
    };
  }
  if (type === 'BuiltinCommonInstructions::Group') {
    const groupEvent = gd.asGroupEvent(event);
    return {
      header: `group "${escapeStringLiteral(groupEvent.getName())}"`,
    };
  }
  if (type === 'BuiltinCommonInstructions::Comment') {
    const commentEvent = gd.asCommentEvent(event);
    return {
      standaloneLine: `comment "${escapeStringLiteral(
        commentEvent.getComment()
      )}"`,
    };
  }
  if (type === 'BuiltinCommonInstructions::Link') {
    const linkEvent = gd.asLinkEvent(event);
    return {
      standaloneLine: `link "${escapeStringLiteral(linkEvent.getTarget())}"`,
    };
  }

  return null;
};

const renderHeaderLineFromParts = ({
  event,
  parts,
  eventPath,
  indent,
}: {|
  event: gdBaseEvent,
  parts: EventScriptParts | null,
  eventPath: string,
  indent: string,
|}): string => {
  const disabledPrefix = event.isDisabled() ? 'disabled ' : '';
  const idAnnotation = `  # event-${eventPath}`;

  if (!parts) {
    return `${indent}# (event of type "${event.getType()}" cannot be shown as EventScript)${idAnnotation}`;
  }
  if (parts.standaloneLine) {
    return `${indent}${disabledPrefix}${parts.standaloneLine}${idAnnotation}`;
  }
  return `${indent}${disabledPrefix}${parts.header ||
    'always'}:${idAnnotation}`;
};

/**
 * Render the header line of an event (`if ...:`, `for each ...:`,
 * `comment "..."`), without its body, annotated with its id. Used both by
 * the full rendering and to show ancestors of filtered events.
 */
export const renderEventScriptHeaderLine = ({
  event,
  eventPath,
  indent,
  renderingErrors,
}: {|
  event: gdBaseEvent,
  eventPath: string,
  indent: string,
  renderingErrors: Array<EventScriptRenderingError>,
|}): string => {
  let parts = null;
  try {
    parts = buildEventScriptParts(event, eventPath, renderingErrors);
  } catch (error) {
    renderingErrors.push({
      path: `event-${eventPath}`,
      message: getErrorMessage(error),
    });
  }
  return renderHeaderLineFromParts({ event, parts, eventPath, indent });
};

/**
 * Count the events and actions/conditions of a whole events list (used for
 * the `# ...` markers describing collapsed sub-events).
 */
const countEventsAndInstructions = (
  eventsList: gdEventsList
): {| eventsCount: number, instructionsCount: number |} => {
  let eventsCount = 0;
  let instructionsCount = 0;
  mapFor(0, eventsList.getEventsCount(), i => {
    const event = eventsList.getEventAt(i);
    eventsCount++;
    try {
      const renderingErrors: Array<EventScriptRenderingError> = [];
      const parts = buildEventScriptParts(event, '', renderingErrors);
      if (parts && parts.actionsList) {
        instructionsCount += parts.actionsList.size();
      }
    } catch (error) {
      // Counting is best-effort only.
    }
    if (event.canHaveSubEvents()) {
      const subCounts = countEventsAndInstructions(event.getSubEvents());
      eventsCount += subCounts.eventsCount;
      instructionsCount += subCounts.instructionsCount;
    }
  });
  return { eventsCount, instructionsCount };
};

/**
 * Render an event (and its sub-events, up to `subEventsDepth` levels) as
 * EventScript lines. Collapsed sub-events are replaced by a `# ...` marker
 * telling how to fetch them (pass `showCollapsedSubEventsMarker: false` to
 * omit the marker, for "own source only" renderings: the body then gets an
 * explicit `pass` when the event has nothing else).
 */
export const renderEventAsEventScriptLines = ({
  event,
  eventPath,
  indent,
  subEventsDepth,
  showCollapsedSubEventsMarker,
  renderingErrors,
}: {|
  event: gdBaseEvent,
  eventPath: string,
  indent: string,
  subEventsDepth: number,
  showCollapsedSubEventsMarker?: boolean,
  renderingErrors: Array<EventScriptRenderingError>,
|}): Array<string> => {
  const lines = [];
  const bodyIndent = indent + INDENT;

  let parts = null;
  try {
    parts = buildEventScriptParts(event, eventPath, renderingErrors);
  } catch (error) {
    renderingErrors.push({
      path: `event-${eventPath}`,
      message: getErrorMessage(error),
    });
  }
  lines.push(renderHeaderLineFromParts({ event, parts, eventPath, indent }));

  try {
    if (event.canHaveVariables() && event.hasVariables()) {
      renderLocalVariableLines(
        event.getVariables(),
        getLoopIndexVariableName(event)
      ).forEach(line => lines.push(`${bodyIndent}${line}`));
    }
  } catch (error) {
    renderingErrors.push({
      path: `event-${eventPath}`,
      message: getErrorMessage(error),
    });
  }

  if (parts && parts.actionsList) {
    const actionsList = parts.actionsList;
    mapFor(0, actionsList.size(), i => {
      try {
        lines.push(
          `${bodyIndent}${renderActionLine(
            actionsList.get(i),
            `event-${eventPath}`,
            renderingErrors
          )}`
        );
      } catch (error) {
        renderingErrors.push({
          path: `event-${eventPath} > action ${i}`,
          message: getErrorMessage(error),
        });
        lines.push(`${bodyIndent}# (this action could not be rendered)`);
      }
    });
  }

  if (event.canHaveSubEvents() && event.getSubEvents().getEventsCount() > 0) {
    if (subEventsDepth > 0) {
      lines.push(
        ...renderEventsListAsEventScriptLines({
          eventsList: event.getSubEvents(),
          parentPath: eventPath,
          indent: bodyIndent,
          subEventsDepth: subEventsDepth - 1,
          renderingErrors,
        })
      );
    } else if (showCollapsedSubEventsMarker !== false) {
      const { eventsCount, instructionsCount } = countEventsAndInstructions(
        event.getSubEvents()
      );
      lines.push(
        `${bodyIndent}# ... ${eventsCount} sub-event(s) (${instructionsCount} action(s)) not shown: read event_ids: ["event-${eventPath}"] to see them.`
      );
    }
  }

  // An empty body is always made explicit with `pass`, so the header never
  // looks like it owns the next (non-indented) line. The parser ignores it.
  if (parts && !parts.standaloneLine && lines.length === 1) {
    lines.push(`${bodyIndent}pass`);
  }

  return lines;
};

export const renderEventsListAsEventScriptLines = ({
  eventsList,
  parentPath,
  indent,
  subEventsDepth,
  renderingErrors,
}: {|
  eventsList: gdEventsList,
  parentPath: string,
  indent: string,
  subEventsDepth: number,
  renderingErrors: Array<EventScriptRenderingError>,
|}): Array<string> => {
  const lines = [];
  mapFor(0, eventsList.getEventsCount(), i => {
    const eventPath = (parentPath ? parentPath + '.' : '') + i;
    try {
      lines.push(
        ...renderEventAsEventScriptLines({
          event: eventsList.getEventAt(i),
          eventPath,
          indent,
          subEventsDepth,
          renderingErrors,
        })
      );
    } catch (error) {
      renderingErrors.push({
        path: `event-${eventPath}`,
        message: getErrorMessage(error),
      });
      lines.push(
        `${indent}# (event event-${eventPath} could not be rendered: ${getErrorMessage(
          error
        )})`
      );
    }
  });
  return lines;
};

/**
 * Render a whole events list as EventScript (the same syntax accepted by the
 * `event_script` field of `generate_events`), with each event annotated with
 * its id (`# event-1.2`) as a comment. Sub-events deeper than
 * `subEventsDepth` levels are collapsed into a `# ...` marker.
 */
export const renderEventsAsEventScript = ({
  eventsList,
  subEventsDepth,
}: {|
  eventsList: gdEventsList,
  subEventsDepth?: number,
|}): {|
  text: string,
  renderingErrors: Array<EventScriptRenderingError>,
|} => {
  const renderingErrors: Array<EventScriptRenderingError> = [];
  const lines = renderEventsListAsEventScriptLines({
    eventsList,
    parentPath: '',
    indent: '',
    subEventsDepth:
      subEventsDepth === undefined ? Number.MAX_SAFE_INTEGER : subEventsDepth,
    renderingErrors,
  });
  return { text: lines.join('\n'), renderingErrors };
};
