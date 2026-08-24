// @flow
import { mapFor, mapVector } from '../../../Utils/MapFor';
import { isElseEventValid, getPreviousExecutableEventIndex } from '../helpers';

const gd: libGDevelop = global.gd;

// Returned as the events text when rendering fails entirely.
export const eventsTextRenderingErrorText =
  'Error while rendering events as text.';

// A failure to render an event/instruction, with `path` locating the node.
export type EventsTextRenderingError = {|
  path: string,
  message: string,
|};

const getErrorMessage = (error: mixed): string =>
  error && typeof error === 'object' && typeof error.message === 'string'
    ? error.message
    : String(error);

export const renderInstructionSentenceAsPlainText = (
  instruction: gdInstruction,
  metadata: gdInstructionMetadata
): string => {
  // Note: we could do like in `MetadataDeclarationHelper` for events-based extensions
  // and create if necessary a default sentence. Here though we assume all extensions
  // will have a sentence.

  if (gd.MetadataProvider.isBadInstructionMetadata(metadata)) {
    // Even if the instruction is bad, we still render it so that it's displayed
    // as "Unknown or unsupported instruction".
  }

  const formattedTexts = gd.InstructionSentenceFormatter.get().getAsFormattedText(
    instruction,
    metadata
  );

  return mapFor(0, formattedTexts.size(), i => {
    const value = formattedTexts.getString(i);
    return value;
  }).join('');
};

// $FlowFixMe[recursive-definition]
// $FlowFixMe[definition-cycle]
const renderInstructionsAsText = ({
  instructionsList,
  padding,
  areConditions,
  eventPath,
  renderingErrors,
}: {|
  instructionsList: gdInstructionsList,
  padding: string,
  areConditions: boolean,
  eventPath: string,
  renderingErrors: Array<EventsTextRenderingError>,
|}) => {
  const renderInstruction = (
    instruction: gdInstruction,
    instructionIndex: number
  ) => {
    const invertedText = instruction.isInverted() ? '(inverted) ' : '';
    const metadata = areConditions
      ? gd.MetadataProvider.getConditionMetadata(
          gd.JsPlatform.get(),
          instruction.getType()
        )
      : gd.MetadataProvider.getActionMetadata(
          gd.JsPlatform.get(),
          instruction.getType()
        );

    // Isolate failures so one bad instruction doesn't fail the whole sheet.
    let sentence;
    try {
      sentence = renderInstructionSentenceAsPlainText(instruction, metadata);
    } catch (error) {
      renderingErrors.push({
        path: `${eventPath} > ${
          areConditions ? 'condition' : 'action'
        } ${instructionIndex} (${instruction.getType()})`,
        message: getErrorMessage(error),
      });
      sentence = areConditions
        ? '(this condition could not be rendered)'
        : '(this action could not be rendered)';
    }

    return {
      text: `${padding}- ${[invertedText, sentence].filter(Boolean).join('')}`,
      canHaveSubInstructions: metadata.canHaveSubInstructions(),
    };
  };

  if (instructionsList.size() === 0) {
    return areConditions
      ? `${padding}(no conditions)`
      : `${padding}(no actions)`;
  }

  return mapFor(0, instructionsList.size(), i => {
    const instruction = instructionsList.get(i);
    const { text, canHaveSubInstructions } = renderInstruction(instruction, i);

    const subInstructionsText = canHaveSubInstructions
      ? renderInstructionsAsText({
          instructionsList: instruction.getSubInstructions(),
          padding: padding + '  ',
          areConditions,
          eventPath,
          renderingErrors,
        })
      : '';

    return [text, subInstructionsText].filter(Boolean).join('\n');
  }).join('\n');
};

type EventTextRendererResult = {|
  prefix?: string,
  content: string,
|};

const eventsTextRenderers: {
  [string]: ({|
    event: gdBaseEvent,
    padding: string,
    isValidElseEvent: boolean,
    eventPath: string,
    renderingErrors: Array<EventsTextRenderingError>,
  |}) => EventTextRendererResult,
} = {
  'BuiltinCommonInstructions::Standard': ({
    event,
    padding,
    eventPath,
    renderingErrors,
  }) => {
    const standardEvent = gd.asStandardEvent(event);
    const conditions = renderInstructionsAsText({
      instructionsList: standardEvent.getConditions(),
      padding: padding,
      areConditions: true,
      eventPath,
      renderingErrors,
    });
    const actions = renderInstructionsAsText({
      instructionsList: standardEvent.getActions(),
      padding: padding,
      areConditions: false,
      eventPath,
      renderingErrors,
    });

    return {
      content: `${padding}Conditions:
${conditions}
${padding}Actions:
${actions}`,
    };
  },
  'BuiltinCommonInstructions::Comment': ({ event, padding }) => {
    const commentEvent = gd.asCommentEvent(event);
    const fullText = commentEvent.getComment();
    const maxLength = 400;
    const text =
      fullText.length > maxLength
        ? fullText.slice(0, maxLength) +
          `[cut - ${fullText.length - maxLength} more characters]`
        : fullText;
    return { content: `${padding}${text}` };
  },
  'BuiltinCommonInstructions::While': ({
    event,
    padding,
    eventPath,
    renderingErrors,
  }) => {
    const whileEvent = gd.asWhileEvent(event);
    const indexVarText = whileEvent.getLoopIndexVariableName()
      ? ` (loop index variable: \`${whileEvent.getLoopIndexVariableName()}\`)`
      : '';
    const whileConditions = renderInstructionsAsText({
      instructionsList: whileEvent.getWhileConditions(),
      padding: padding + ' ',
      areConditions: true,
      eventPath,
      renderingErrors,
    });
    const conditions = renderInstructionsAsText({
      instructionsList: whileEvent.getConditions(),
      padding: padding + ' ',
      areConditions: true,
      eventPath,
      renderingErrors,
    });
    const actions = renderInstructionsAsText({
      instructionsList: whileEvent.getActions(),
      padding: padding + ' ',
      areConditions: false,
      eventPath,
      renderingErrors,
    });

    return {
      content: `${padding}While these conditions are true${indexVarText}:
${whileConditions}
${padding}Then do:
${padding}Conditions:
${conditions}
${padding}Actions:
${actions}`,
    };
  },
  'BuiltinCommonInstructions::Repeat': ({
    event,
    padding,
    eventPath,
    renderingErrors,
  }) => {
    const repeatEvent = gd.asRepeatEvent(event);
    const indexVarText = repeatEvent.getLoopIndexVariableName()
      ? ` (loop index variable: \`${repeatEvent.getLoopIndexVariableName()}\`)`
      : '';
    const conditions = renderInstructionsAsText({
      instructionsList: repeatEvent.getConditions(),
      padding: padding + ' ',
      areConditions: true,
      eventPath,
      renderingErrors,
    });
    const actions = renderInstructionsAsText({
      instructionsList: repeatEvent.getActions(),
      padding: padding + ' ',
      areConditions: false,
      eventPath,
      renderingErrors,
    });

    return {
      content: `${padding}Repeat \`${repeatEvent
        .getRepeatExpression()
        .getPlainString()}\`${indexVarText} times these:
${padding}Conditions:
${conditions}
${padding}Actions:
${actions}`,
    };
  },
  'BuiltinCommonInstructions::ForEach': ({
    event,
    padding,
    eventPath,
    renderingErrors,
  }) => {
    const forEachEvent = gd.asForEachEvent(event);
    const indexVarText = forEachEvent.getLoopIndexVariableName()
      ? ` (loop index variable: \`${forEachEvent.getLoopIndexVariableName()}\`)`
      : '';
    const orderBy = forEachEvent.getOrderBy();
    const order = forEachEvent.getOrder();
    const limit = forEachEvent.getLimit();
    const orderText = orderBy
      ? ` ordered by \`${orderBy}\` (${
          order === 'desc' ? 'descending' : 'ascending'
        })${limit ? ` limit: \`${limit}\`` : ''}`
      : '';
    const conditions = renderInstructionsAsText({
      instructionsList: forEachEvent.getConditions(),
      padding: padding + ' ',
      areConditions: true,
      eventPath,
      renderingErrors,
    });
    const actions = renderInstructionsAsText({
      instructionsList: forEachEvent.getActions(),
      padding: padding + ' ',
      areConditions: false,
      eventPath,
      renderingErrors,
    });

    return {
      content: `${padding}Repeat these separately for each instance of ${forEachEvent.getObjectToPick()}${orderText}${indexVarText}:
${padding}Conditions:
${conditions}
${padding}Actions:
${actions}`,
    };
  },
  'BuiltinCommonInstructions::ForEachChildVariable': ({
    event,
    padding,
    eventPath,
    renderingErrors,
  }) => {
    const forEachChildVariableEvent = gd.asForEachChildVariableEvent(event);
    const indexVarText = forEachChildVariableEvent.getLoopIndexVariableName()
      ? ` (loop index variable: \`${forEachChildVariableEvent.getLoopIndexVariableName()}\`)`
      : '';
    const valueIteratorName = forEachChildVariableEvent.getValueIteratorVariableName();
    const keyIteratorName = forEachChildVariableEvent.getKeyIteratorVariableName();
    const iterableName = forEachChildVariableEvent.getIterableVariableName();
    const conditions = renderInstructionsAsText({
      instructionsList: forEachChildVariableEvent.getConditions(),
      padding: padding + ' ',
      areConditions: true,
      eventPath,
      renderingErrors,
    });
    const actions = renderInstructionsAsText({
      instructionsList: forEachChildVariableEvent.getActions(),
      padding: padding + ' ',
      areConditions: false,
      eventPath,
      renderingErrors,
    });

    return {
      content: `${padding}For each child in \`${iterableName ||
        '(no variable chosen yet)'}\`, store the child in variable \`${valueIteratorName ||
        '(ignored)'}\`, the child name in \`${keyIteratorName ||
        '(ignored)'}\` and do${indexVarText}:
${padding}Conditions:
${padding}${conditions}
${padding}Actions:
${padding}${actions}`,
    };
  },
  'BuiltinCommonInstructions::Group': ({ event, padding }) => {
    const groupEvent = gd.asGroupEvent(event);
    return { content: `${padding}Group called "${groupEvent.getName()}":` };
  },
  'BuiltinCommonInstructions::Else': ({
    event,
    padding,
    isValidElseEvent,
    eventPath,
    renderingErrors,
  }) => {
    const elseEvent = gd.asElseEvent(event);
    const hasConditions = elseEvent.getConditions().size() > 0;
    const elseLabel = hasConditions ? 'Else if' : 'Else';

    const conditions = renderInstructionsAsText({
      instructionsList: elseEvent.getConditions(),
      padding: padding,
      areConditions: true,
      eventPath,
      renderingErrors,
    });
    const actions = renderInstructionsAsText({
      instructionsList: elseEvent.getActions(),
      padding: padding,
      areConditions: false,
      eventPath,
      renderingErrors,
    });

    const prefix = isValidElseEvent
      ? `${padding}${elseLabel}`
      : `${padding}~~${elseLabel}~~ (Else is ignored because not following a standard event)`;

    return {
      prefix,
      content: `${padding}Conditions:\n${conditions}\n${padding}Actions:\n${actions}`,
    };
  },
  'BuiltinCommonInstructions::Link': ({ event, padding }) => {
    const linkEvent = gd.asLinkEvent(event);
    return {
      content: `${padding}(link to events in events sheet called "${linkEvent.getTarget()}")`,
    };
  },
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

const renderLocalVariablesAsText = ({
  variables,
  padding,
}: {|
  variables: gdVariablesContainer,
  padding: string,
|}) => {
  return mapFor(0, variables.count(), i => {
    const variable = variables.getAt(i);
    const variableName = variables.getNameAt(i);
    return `${padding}- Declare local variable "${variableName}" of type "${gd.Variable.typeAsString(
      variable.getType()
    )}" with value \`${JSON.stringify(convertVariableToJsObject(variable))}\``;
  }).join('\n');
};

const renderEventAsText = ({
  event,
  eventsList,
  eventIndex,
  padding,
  eventPath,
  isAncestorDisabled,
  renderingErrors,
}: {|
  event: gdBaseEvent,
  eventsList: gdEventsList,
  eventIndex: number,
  padding: string,
  eventPath: string,
  isAncestorDisabled: boolean,
  renderingErrors: Array<EventsTextRenderingError>,
|}) => {
  const textRenderer = eventsTextRenderers[event.getType()];
  // $FlowFixMe[constant-condition]
  if (!textRenderer) {
    return `${padding}(This event is unknown/unsupported - ignored)`;
  }

  // Isolate failures: a bad event becomes a placeholder, siblings still render.
  let eventText;
  try {
    const localVariablesText =
      event.canHaveVariables() && event.hasVariables()
        ? renderLocalVariablesAsText({
            variables: event.getVariables(),
            padding: padding,
          })
        : '';

    const isValid =
      event.getType() === 'BuiltinCommonInstructions::Else'
        ? isElseEventValid(eventsList, eventIndex)
        : false;

    const { prefix, content } = textRenderer({
      event,
      padding,
      isValidElseEvent: isValid,
      eventPath,
      renderingErrors,
    });
    const prefixAndVariables = [prefix, localVariablesText]
      .filter(Boolean)
      .join('\n');
    eventText = [prefixAndVariables, content].filter(Boolean).join('\n\n');
  } catch (error) {
    const message = getErrorMessage(error);
    renderingErrors.push({ path: eventPath, message });
    eventText = `${padding}(This event could not be rendered: ${message})`;
  }

  let subEvents = '';
  if (event.canHaveSubEvents()) {
    subEvents = renderEventsAsText({
      eventsList: event.getSubEvents(),
      parentPath: eventPath,
      padding: padding + ' ',
      isAncestorDisabled: isAncestorDisabled || event.isDisabled(),
      renderingErrors,
    });
  }

  return eventText + (subEvents ? `\n${padding}Sub-events:\n${subEvents}` : '');
};

export const renderEventsAsText = ({
  eventsList,
  parentPath,
  padding,
  isAncestorDisabled = false,
  renderingErrors = [],
}: {|
  eventsList: gdEventsList,
  parentPath: string,
  padding: string,
  isAncestorDisabled?: boolean,
  renderingErrors?: Array<EventsTextRenderingError>,
|}): string => {
  return mapFor(0, eventsList.getEventsCount(), i => {
    const event = eventsList.getEventAt(i);

    const eventPath = (parentPath ? parentPath + '.' : '') + i;
    const eventAndSubEventsText = renderEventAsText({
      event,
      eventsList,
      eventIndex: i,
      eventPath,
      padding: padding + ' ',
      isAncestorDisabled,
      renderingErrors,
    });

    let elseOfAttribute = '';
    if (
      event.getType() === 'BuiltinCommonInstructions::Else' &&
      isElseEventValid(eventsList, i)
    ) {
      const previousIndex = getPreviousExecutableEventIndex(eventsList, i);
      const previousEventPath =
        (parentPath ? parentPath + '.' : '') + previousIndex;
      elseOfAttribute = ` else-of="event-${previousEventPath}"`;
    }

    const eventTypeToAttribute: { [string]: string } = {
      'BuiltinCommonInstructions::Comment': 'comment',
      'BuiltinCommonInstructions::While': 'while',
      'BuiltinCommonInstructions::Link': 'link',
      'BuiltinCommonInstructions::Group': 'group',
      'BuiltinCommonInstructions::ForEachChildVariable':
        'for-each-child-variable',
      'BuiltinCommonInstructions::ForEach': 'for-each',
      'BuiltinCommonInstructions::Repeat': 'repeat',
    };
    const typeAttributeValue = eventTypeToAttribute[event.getType()];
    const typeAttribute = typeAttributeValue
      ? ` type="${typeAttributeValue}"`
      : '';

    let disabledAttribute = '';
    if (event.isDisabled()) {
      disabledAttribute = ' disabled="true"';
    } else if (isAncestorDisabled) {
      disabledAttribute = ' disabled-because-of-ancestor="true"';
    }

    return `${padding}<event-${eventPath}${elseOfAttribute}${typeAttribute}${disabledAttribute}>
${eventAndSubEventsText}
${padding}</event-${eventPath}>`;
  }).join('\n');
};

export const renderNonTranslatedEventsAsTextWithErrors = ({
  eventsList,
}: {
  eventsList: gdEventsList,
}): {|
  text: string,
  renderingErrors: Array<EventsTextRenderingError>,
|} => {
  // Temporarily override the getTranslation function to return the original
  // string, so that events are always rendered in English.
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[prop-missing]
  const previousGetTranslation = gd.getTranslation;
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[prop-missing]
  gd.getTranslation = (str: string) => str;

  const renderingErrors: Array<EventsTextRenderingError> = [];
  let text = '';
  try {
    text = renderEventsAsText({
      eventsList,
      parentPath: '',
      padding: '',
      renderingErrors,
    });
  } catch (error) {
    // Structural-level safety net (per-event rendering already degrades).
    console.error('Error while rendering events as text:', error);
    renderingErrors.push({
      path: '(events sheet)',
      message: getErrorMessage(error),
    });
    text = eventsTextRenderingErrorText;
  } finally {
    // $FlowFixMe[incompatible-type]
    // $FlowFixMe[prop-missing]
    gd.getTranslation = previousGetTranslation;
  }

  return { text, renderingErrors };
};

export const renderNonTranslatedEventsAsText = ({
  eventsList,
}: {
  eventsList: gdEventsList,
}): string => {
  return renderNonTranslatedEventsAsTextWithErrors({ eventsList }).text;
};
