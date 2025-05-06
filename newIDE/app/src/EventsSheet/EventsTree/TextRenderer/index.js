// @flow

import { mapFor } from '../../../Utils/MapFor';

const gd: libGDevelop = global.gd;

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

const eventsTextRenderers: {
  [string]: ({|
    event: gdBaseEvent,
    padding: string,
  |}) => string,
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

    return `${padding}Conditions:
${conditions}
${padding}Actions:
${actions}`;
  },
  'BuiltinCommonInstructions::Comment': ({ event, padding }) => {
    return `${padding}(comment - content is not displayed)`;
  },
  'BuiltinCommonInstructions::While': ({ event, padding }) => {
    const whileEvent = gd.asWhileEvent(event);
    const whileConditions = renderInstructionsAsText({
      instructionsList: whileEvent.getWhileConditions(),
      padding: padding + ' ',
      depth: 0,
      areConditions: true,
    });
    const conditions = renderInstructionsAsText({
      instructionsList: whileEvent.getConditions(),
      padding: padding + ' ',
      depth: 0,
      areConditions: true,
    });
    const actions = renderInstructionsAsText({
      instructionsList: whileEvent.getActions(),
      padding: padding + ' ',
      depth: 0,
      areConditions: false,
    });

    return `${padding}While these conditions are true:
${whileConditions}
${padding}Then do:
${padding}Conditions:
${conditions}
${padding}Actions:
${actions}`;
  },
  'BuiltinCommonInstructions::Repeat': ({ event, padding }) => {
    const repeatEvent = gd.asRepeatEvent(event);
    const conditions = renderInstructionsAsText({
      instructionsList: repeatEvent.getConditions(),
      padding: padding + ' ',
      depth: 0,
      areConditions: true,
    });
    const actions = renderInstructionsAsText({
      instructionsList: repeatEvent.getActions(),
      padding: padding + ' ',
      depth: 0,
      areConditions: false,
    });

    return `${padding}Repeat \`${repeatEvent
      .getRepeatExpression()
      .getPlainString()}\` times these:
${padding}Conditions:
${conditions}
${padding}Actions:
${actions}`;
  },
  'BuiltinCommonInstructions::ForEach': ({ event, padding }) => {
    const forEachEvent = gd.asForEachEvent(event);
    const conditions = renderInstructionsAsText({
      instructionsList: forEachEvent.getConditions(),
      padding: padding + ' ',
      depth: 0,
      areConditions: true,
    });
    const actions = renderInstructionsAsText({
      instructionsList: forEachEvent.getActions(),
      padding: padding + ' ',
      depth: 0,
      areConditions: false,
    });

    return `${padding}Repeat these separately for each instance of ${forEachEvent.getObjectToPick()}:
${padding}Conditions:
${conditions}
${padding}Actions:
${actions}`;
  },
  'BuiltinCommonInstructions::ForEachChildVariable': ({ event, padding }) => {
    const forEachChildVariableEvent = gd.asForEachChildVariableEvent(event);
    const valueIteratorName = forEachChildVariableEvent.getValueIteratorVariableName();
    const keyIteratorName = forEachChildVariableEvent.getKeyIteratorVariableName();
    const iterableName = forEachChildVariableEvent.getIterableVariableName();
    const conditions = renderInstructionsAsText({
      instructionsList: forEachChildVariableEvent.getConditions(),
      padding: padding + ' ',
      depth: 0,
      areConditions: true,
    });
    const actions = renderInstructionsAsText({
      instructionsList: forEachChildVariableEvent.getActions(),
      padding: padding + ' ',
      depth: 0,
      areConditions: false,
    });

    return `${padding}For each child in \`${iterableName ||
      '(no variable chosen yet)'}\`, store the child in variable \`${valueIteratorName ||
      '(ignored)'}\`, the child name in \`${keyIteratorName ||
      '(ignored)'}\` and do:
${padding}Conditions:
${padding}${conditions}
${padding}Actions:
${padding}${actions}`;
  },
  'BuiltinCommonInstructions::Group': ({ event, padding }) => {
    const groupEvent = gd.asGroupEvent(event);
    return `${padding}Group called "${groupEvent.getName()}":`;
  },
  'BuiltinCommonInstructions::Link': ({ event, padding }) => {
    return `${padding}(link to events in events sheet called "${event.getTarget()}")`;
  },
};

const renderEventAsText = ({
  event,
  padding,
  eventPath,
}: {|
  event: gdBaseEvent,
  padding: string,
  eventPath: string,
|}) => {
  const isDisabled = event.isDisabled();
  if (isDisabled) return `${padding}(This event is disabled - ignored)`;

  const textRenderer = eventsTextRenderers[event.getType()];
  const eventText = textRenderer
    ? textRenderer({ event, padding })
    : `${padding}(This event is unknown/unsupported - ignored)`;

  let subEvents = '';
  if (event.canHaveSubEvents()) {
    subEvents = renderEventsAsText({
      eventsList: event.getSubEvents(),
      parentPath: eventPath,
      padding: padding + ' ',
    });
  }

  return eventText + (subEvents ? `\n${padding}Sub-events:\n${subEvents}` : '');
};

export const renderEventsAsText = ({
  eventsList,
  parentPath,
  padding,
}: {|
  eventsList: gdEventsList,
  parentPath: string,
  padding: string,
|}) => {
  return mapFor(0, eventsList.getEventsCount(), i => {
    const event = eventsList.getEventAt(i);

    const eventPath = (parentPath ? parentPath + '.' : '') + i;
    const eventAndSubEventsText = renderEventAsText({
      event,
      eventPath,
      padding: padding + ' ',
    });

    return `${padding}<event-${eventPath}>
${eventAndSubEventsText}
${padding}</event-${eventPath}>`;
  }).join('\n');
};
