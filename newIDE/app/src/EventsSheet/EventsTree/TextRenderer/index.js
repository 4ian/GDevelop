// @flow
import { mapFor, mapVector } from '../../../Utils/MapFor';
import { isElseEventValid, getPreviousExecutableEventIndex } from '../helpers';

const gd: libGDevelop = global.gd;

// $FlowFixMe[recursive-definition]
// $FlowFixMe[definition-cycle]
const renderInstructionsAsText = ({
  instructionsList,
  padding,
  areConditions,
}: {|
  instructionsList: gdInstructionsList,
  padding: string,
  areConditions: boolean,
|}) => {
  const renderInstruction = (instruction: gdInstruction) => {
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

    const formattedTexts = gd.InstructionSentenceFormatter.get().getAsFormattedText(
      instruction,
      metadata
    );

    const sentence = mapFor(0, formattedTexts.size(), i => {
      const value = formattedTexts.getString(i);
      return value;
    }).join('');

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
    const { text, canHaveSubInstructions } = renderInstruction(instruction);

    const subInstructionsText = canHaveSubInstructions
      ? renderInstructionsAsText({
          instructionsList: instruction.getSubInstructions(),
          padding: padding + '  ',
          areConditions,
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
  |}) => EventTextRendererResult,
} = {
  'BuiltinCommonInstructions::Standard': ({ event, padding }) => {
    const standardEvent = gd.asStandardEvent(event);
    const conditions = renderInstructionsAsText({
      instructionsList: standardEvent.getConditions(),
      padding: padding,
      areConditions: true,
    });
    const actions = renderInstructionsAsText({
      instructionsList: standardEvent.getActions(),
      padding: padding,
      areConditions: false,
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
  'BuiltinCommonInstructions::While': ({ event, padding }) => {
    const whileEvent = gd.asWhileEvent(event);
    const indexVarText = whileEvent.getLoopIndexVariableName()
      ? ` (loop index variable: \`${whileEvent.getLoopIndexVariableName()}\`)`
      : '';
    const whileConditions = renderInstructionsAsText({
      instructionsList: whileEvent.getWhileConditions(),
      padding: padding + ' ',
      areConditions: true,
    });
    const conditions = renderInstructionsAsText({
      instructionsList: whileEvent.getConditions(),
      padding: padding + ' ',
      areConditions: true,
    });
    const actions = renderInstructionsAsText({
      instructionsList: whileEvent.getActions(),
      padding: padding + ' ',
      areConditions: false,
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
  'BuiltinCommonInstructions::Repeat': ({ event, padding }) => {
    const repeatEvent = gd.asRepeatEvent(event);
    const indexVarText = repeatEvent.getLoopIndexVariableName()
      ? ` (loop index variable: \`${repeatEvent.getLoopIndexVariableName()}\`)`
      : '';
    const conditions = renderInstructionsAsText({
      instructionsList: repeatEvent.getConditions(),
      padding: padding + ' ',
      areConditions: true,
    });
    const actions = renderInstructionsAsText({
      instructionsList: repeatEvent.getActions(),
      padding: padding + ' ',
      areConditions: false,
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
  'BuiltinCommonInstructions::ForEach': ({ event, padding }) => {
    const forEachEvent = gd.asForEachEvent(event);
    const indexVarText = forEachEvent.getLoopIndexVariableName()
      ? ` (loop index variable: \`${forEachEvent.getLoopIndexVariableName()}\`)`
      : '';
    const conditions = renderInstructionsAsText({
      instructionsList: forEachEvent.getConditions(),
      padding: padding + ' ',
      areConditions: true,
    });
    const actions = renderInstructionsAsText({
      instructionsList: forEachEvent.getActions(),
      padding: padding + ' ',
      areConditions: false,
    });

    return {
      content: `${padding}Repeat these separately for each instance of ${forEachEvent.getObjectToPick()}${indexVarText}:
${padding}Conditions:
${conditions}
${padding}Actions:
${actions}`,
    };
  },
  'BuiltinCommonInstructions::ForEachChildVariable': ({ event, padding }) => {
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
    });
    const actions = renderInstructionsAsText({
      instructionsList: forEachChildVariableEvent.getActions(),
      padding: padding + ' ',
      areConditions: false,
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
  'BuiltinCommonInstructions::Else': ({ event, padding, isValidElseEvent }) => {
    const elseEvent = gd.asElseEvent(event);
    const hasConditions = elseEvent.getConditions().size() > 0;
    const elseLabel = hasConditions ? 'Else if' : 'Else';

    const conditions = renderInstructionsAsText({
      instructionsList: elseEvent.getConditions(),
      padding: padding,
      areConditions: true,
    });
    const actions = renderInstructionsAsText({
      instructionsList: elseEvent.getActions(),
      padding: padding,
      areConditions: false,
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
    return {
      content: `${padding}(link to events in events sheet called "${event.getTarget()}")`,
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
    // $FlowFixMe[incompatible-exact]
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
}: {|
  event: gdBaseEvent,
  eventsList: gdEventsList,
  eventIndex: number,
  padding: string,
  eventPath: string,
  isAncestorDisabled: boolean,
|}) => {
  const localVariablesText =
    event.canHaveVariables() && event.hasVariables()
      ? renderLocalVariablesAsText({
          variables: event.getVariables(),
          padding: padding,
        })
      : '';

  const textRenderer = eventsTextRenderers[event.getType()];
  // $FlowFixMe[constant-condition]
  if (!textRenderer) {
    return `${padding}(This event is unknown/unsupported - ignored)`;
  }

  const isValid =
    event.getType() === 'BuiltinCommonInstructions::Else'
      ? isElseEventValid(eventsList, eventIndex)
      : false;

  const { prefix, content } = textRenderer({
    event,
    padding,
    isValidElseEvent: isValid,
  });
  const prefixAndVariables = [prefix, localVariablesText]
    .filter(Boolean)
    .join('\n');
  const eventText = [prefixAndVariables, content].filter(Boolean).join('\n\n');

  let subEvents = '';
  if (event.canHaveSubEvents()) {
    subEvents = renderEventsAsText({
      eventsList: event.getSubEvents(),
      parentPath: eventPath,
      padding: padding + ' ',
      isAncestorDisabled: isAncestorDisabled || event.isDisabled(),
    });
  }

  return eventText + (subEvents ? `\n${padding}Sub-events:\n${subEvents}` : '');
};

export const renderEventsAsText = ({
  eventsList,
  parentPath,
  padding,
  isAncestorDisabled = false,
}: {|
  eventsList: gdEventsList,
  parentPath: string,
  padding: string,
  isAncestorDisabled?: boolean,
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

export const renderNonTranslatedEventsAsText = ({
  eventsList,
}: {
  eventsList: gdEventsList,
}): string | 'Error while rendering events as text.' => {
  // Temporarily override the getTranslation function to return the original
  // string, so that events are always rendered in English.
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[prop-missing]
  const previousGetTranslation = gd.getTranslation;
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[prop-missing]
  gd.getTranslation = (str: string) => str;

  let text = '';
  try {
    text = renderEventsAsText({
      eventsList,
      parentPath: '',
      padding: '',
    });
  } catch (error) {
    console.error('Error while rendering events as text:', error);
    text = 'Error while rendering events as text.';
  } finally {
    // $FlowFixMe[incompatible-type]
    // $FlowFixMe[prop-missing]
    gd.getTranslation = previousGetTranslation;
  }

  return text;
};
