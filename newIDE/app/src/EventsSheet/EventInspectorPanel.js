// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import Toggle from '../UI/Toggle';
import TextField from '../UI/TextField';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import { mapFor } from '../Utils/MapFor';
import {
  type EventContext,
  type InstructionContextWithEventContext,
} from './SelectionHandler';
import { type EventMetadata } from './EnumerateEventsMetadata';
import { getInstructionMetadata } from './InstructionEditor/InstructionEditor';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  selectedEventContext: ?EventContext,
  selectedEventsCount: number,
  selectedInstructionContext: ?InstructionContextWithEventContext,
  selectedInstructionsCount: number,
  eventMetadataByType: { [string]: EventMetadata },
  isSelectedElseEventValid: boolean,
  canAddLoopIndexVariable: boolean,
  canRemoveLoopIndexVariable: boolean,
  onSetSelectedInstructionInverted: (inverted: boolean) => void,
  onSetSelectedInstructionAwaited: (awaited: boolean) => void,
  onSetInstructionParameterValue: (
    parameterIndex: number,
    valueAsString: string
  ) => void,
  onOpenSelectedInstructionEditor: () => void,
  onToggleDisabledEvent: () => void,
  onSetEventFolded: (folded: boolean) => void,
  onSetGroupName: (name: string) => void,
  onSetCommentText: (comment: string) => void,
  onSetLocalVariablePrimitiveValue: (
    variableName: string,
    valueAsString: string
  ) => void,
  onAddLocalVariable: (variableName: string) => void,
  onOpenLocalVariablesDialog: () => void,
  onAddLoopIndexVariable: () => void,
  onRemoveLoopIndexVariable: () => void,
|};

const getVariableTypeLabel = (type: number): string => {
  if (type === gd.Variable.String) return 'Text';
  if (type === gd.Variable.Number) return 'Number';
  if (type === gd.Variable.Boolean) return 'Boolean';
  if (type === gd.Variable.Array) return 'Array';
  if (type === gd.Variable.Structure) return 'Structure';
  return 'Unknown';
};

const getVariablePrimitiveValue = (variable: gdVariable): string => {
  const type = variable.getType();
  if (type === gd.Variable.String) return variable.getString();
  if (type === gd.Variable.Number) return variable.getValue().toString();
  if (type === gd.Variable.Boolean)
    return variable.getBool() ? 'true' : 'false';
  return '';
};

const isPrimitiveVariable = (variable: gdVariable): boolean => {
  const type = variable.getType();
  return (
    type === gd.Variable.String ||
    type === gd.Variable.Number ||
    type === gd.Variable.Boolean
  );
};

const getEventKindLabel = (eventType: string): string => {
  if (eventType === 'BuiltinCommonInstructions::Standard') return 'Standard';
  if (eventType === 'BuiltinCommonInstructions::Else') return 'Else';
  if (eventType === 'BuiltinCommonInstructions::Group') return 'Group';
  if (eventType === 'BuiltinCommonInstructions::Comment') return 'Comment';
  if (
    eventType === 'BuiltinCommonInstructions::While' ||
    eventType === 'BuiltinCommonInstructions::Repeat' ||
    eventType === 'BuiltinCommonInstructions::ForEach' ||
    eventType === 'BuiltinCommonInstructions::ForEachChildVariable'
  ) {
    return 'Loop';
  }
  if (eventType === 'BuiltinCommonInstructions::Link') return 'Link';
  if (eventType === 'BuiltinCommonInstructions::JsCode') return 'JavaScript';
  return 'Other';
};

const countInstructionsRecursively = (
  instructionsList: gdInstructionsList
): number => {
  let count = 0;
  mapFor(0, instructionsList.size(), i => {
    const instruction = instructionsList.get(i);
    count += 1;
    count += countInstructionsRecursively(instruction.getSubInstructions());
  });
  return count;
};

const countSubEventsRecursively = (eventsList: gdEventsList): number => {
  let count = 0;
  mapFor(0, eventsList.getEventsCount(), i => {
    const event = eventsList.getEventAt(i);
    count += 1;
    if (event.canHaveSubEvents()) {
      count += countSubEventsRecursively(event.getSubEvents());
    }
  });
  return count;
};

const getEventInstructionStats = (
  event: gdBaseEvent,
  eventType: string
): {|
  whileConditionsCount: number,
  conditionsCount: number,
  actionsCount: number,
  totalInstructionsCount: number,
|} => {
  const countFromList = (list: gdInstructionsList): number =>
    countInstructionsRecursively(list);

  if (eventType === 'BuiltinCommonInstructions::Standard') {
    const standardEvent = gd.asStandardEvent(event);
    const conditionsCount = countFromList(standardEvent.getConditions());
    const actionsCount = countFromList(standardEvent.getActions());
    return {
      whileConditionsCount: 0,
      conditionsCount,
      actionsCount,
      totalInstructionsCount: conditionsCount + actionsCount,
    };
  }

  if (eventType === 'BuiltinCommonInstructions::Else') {
    const elseEvent = gd.asElseEvent(event);
    const conditionsCount = countFromList(elseEvent.getConditions());
    const actionsCount = countFromList(elseEvent.getActions());
    return {
      whileConditionsCount: 0,
      conditionsCount,
      actionsCount,
      totalInstructionsCount: conditionsCount + actionsCount,
    };
  }

  if (eventType === 'BuiltinCommonInstructions::Repeat') {
    const repeatEvent = gd.asRepeatEvent(event);
    const conditionsCount = countFromList(repeatEvent.getConditions());
    const actionsCount = countFromList(repeatEvent.getActions());
    return {
      whileConditionsCount: 0,
      conditionsCount,
      actionsCount,
      totalInstructionsCount: conditionsCount + actionsCount,
    };
  }

  if (eventType === 'BuiltinCommonInstructions::ForEach') {
    const forEachEvent = gd.asForEachEvent(event);
    const conditionsCount = countFromList(forEachEvent.getConditions());
    const actionsCount = countFromList(forEachEvent.getActions());
    return {
      whileConditionsCount: 0,
      conditionsCount,
      actionsCount,
      totalInstructionsCount: conditionsCount + actionsCount,
    };
  }

  if (eventType === 'BuiltinCommonInstructions::ForEachChildVariable') {
    const forEachChildVariableEvent = gd.asForEachChildVariableEvent(event);
    const conditionsCount = countFromList(
      forEachChildVariableEvent.getConditions()
    );
    const actionsCount = countFromList(forEachChildVariableEvent.getActions());
    return {
      whileConditionsCount: 0,
      conditionsCount,
      actionsCount,
      totalInstructionsCount: conditionsCount + actionsCount,
    };
  }

  if (eventType === 'BuiltinCommonInstructions::While') {
    const whileEvent = gd.asWhileEvent(event);
    const whileConditionsCount = countFromList(whileEvent.getWhileConditions());
    const conditionsCount = countFromList(whileEvent.getConditions());
    const actionsCount = countFromList(whileEvent.getActions());
    return {
      whileConditionsCount,
      conditionsCount,
      actionsCount,
      totalInstructionsCount:
        whileConditionsCount + conditionsCount + actionsCount,
    };
  }

  return {
    whileConditionsCount: 0,
    conditionsCount: 0,
    actionsCount: 0,
    totalInstructionsCount: 0,
  };
};

const EventInspectorPanel = ({
  project,
  selectedEventContext,
  selectedEventsCount,
  selectedInstructionContext,
  selectedInstructionsCount,
  eventMetadataByType,
  isSelectedElseEventValid,
  canAddLoopIndexVariable,
  canRemoveLoopIndexVariable,
  onSetSelectedInstructionInverted,
  onSetSelectedInstructionAwaited,
  onSetInstructionParameterValue,
  onOpenSelectedInstructionEditor,
  onToggleDisabledEvent,
  onSetEventFolded,
  onSetGroupName,
  onSetCommentText,
  onSetLocalVariablePrimitiveValue,
  onAddLocalVariable,
  onOpenLocalVariablesDialog,
  onAddLoopIndexVariable,
  onRemoveLoopIndexVariable,
}: Props): React.Node => {
  const selectedEvent = selectedEventContext
    ? selectedEventContext.event
    : null;
  const selectedEventType = selectedEvent ? selectedEvent.getType() : '';
  const selectedEventMetadata = selectedEvent
    ? eventMetadataByType[selectedEventType]
    : null;
  const selectedEventDisplayName = selectedEventMetadata
    ? selectedEventMetadata.fullName
    : selectedEventType || '';
  const selectedEventDescription = selectedEventMetadata
    ? selectedEventMetadata.description
    : '';
  const selectedEventKindLabel = getEventKindLabel(selectedEventType);
  const selectedInstruction = selectedInstructionContext
    ? selectedInstructionContext.instruction
    : null;
  const selectedInstructionType = selectedInstruction
    ? selectedInstruction.getType()
    : '';
  const selectedInstructionMetadata =
    selectedInstruction && selectedInstructionContext
      ? getInstructionMetadata({
          instructionType: selectedInstructionType,
          isCondition: selectedInstructionContext.isCondition,
          project,
        })
      : null;
  const selectedInstructionDisplayName = selectedInstructionMetadata
    ? selectedInstructionMetadata.getFullName()
    : selectedInstructionType || '';
  const selectedInstructionDescription = selectedInstructionMetadata
    ? selectedInstructionMetadata.getDescription()
    : '';
  const selectedInstructionIsCondition = selectedInstructionContext
    ? selectedInstructionContext.isCondition
    : false;
  const selectedInstructionCanBeAwaited =
    !selectedInstructionIsCondition &&
    !!selectedInstructionMetadata &&
    selectedInstructionMetadata.isOptionallyAsync();
  const selectedInstructionSubInstructionsCount = selectedInstruction
    ? selectedInstruction.getSubInstructions().size()
    : 0;
  const selectedInstructionNestedSubInstructionsCount = selectedInstruction
    ? countInstructionsRecursively(selectedInstruction.getSubInstructions())
    : 0;
  const selectedInstructionPtr = selectedInstruction
    ? selectedInstruction.ptr
    : null;

  const isGroupEvent = selectedEventType === 'BuiltinCommonInstructions::Group';
  const isCommentEvent =
    selectedEventType === 'BuiltinCommonInstructions::Comment';
  const isLoopEvent =
    selectedEventType === 'BuiltinCommonInstructions::While' ||
    selectedEventType === 'BuiltinCommonInstructions::Repeat' ||
    selectedEventType === 'BuiltinCommonInstructions::ForEach' ||
    selectedEventType === 'BuiltinCommonInstructions::ForEachChildVariable';
  const loopEvent = selectedEvent
    ? selectedEventType === 'BuiltinCommonInstructions::While'
      ? gd.asWhileEvent(selectedEvent)
      : selectedEventType === 'BuiltinCommonInstructions::Repeat'
      ? gd.asRepeatEvent(selectedEvent)
      : selectedEventType === 'BuiltinCommonInstructions::ForEach'
      ? gd.asForEachEvent(selectedEvent)
      : selectedEventType === 'BuiltinCommonInstructions::ForEachChildVariable'
      ? gd.asForEachChildVariableEvent(selectedEvent)
      : null
    : null;
  const isLinkEvent = selectedEventType === 'BuiltinCommonInstructions::Link';
  const linkTarget =
    isLinkEvent && selectedEvent
      ? gd.asLinkEvent(selectedEvent).getTarget()
      : '';
  const linkTargetKind =
    linkTarget && project.hasExternalEventsNamed(linkTarget)
      ? 'External events'
      : linkTarget && project.hasLayoutNamed(linkTarget)
      ? 'Scene'
      : linkTarget
      ? 'Missing target'
      : 'Not set';
  const isJsCodeEvent =
    selectedEventType === 'BuiltinCommonInstructions::JsCode';
  const jsCodeEvent =
    isJsCodeEvent && selectedEvent ? gd.asJsCodeEvent(selectedEvent) : null;
  const jsCodeLinesCount = jsCodeEvent
    ? jsCodeEvent
        .getInlineCode()
        .split(/\r?\n/)
        .filter(line => line.trim().length > 0).length
    : 0;
  const jsCodeParameterObjects = jsCodeEvent
    ? jsCodeEvent.getParameterObjects()
    : '';
  const repeatExpression =
    selectedEventType === 'BuiltinCommonInstructions::Repeat' && selectedEvent
      ? gd
          .asRepeatEvent(selectedEvent)
          .getRepeatExpression()
          .getPlainString()
      : '';
  const forEachObjectToPick =
    selectedEventType === 'BuiltinCommonInstructions::ForEach' && selectedEvent
      ? gd.asForEachEvent(selectedEvent).getObjectToPick()
      : '';
  const forEachChildIterableName =
    selectedEventType === 'BuiltinCommonInstructions::ForEachChildVariable' &&
    selectedEvent
      ? gd.asForEachChildVariableEvent(selectedEvent).getIterableVariableName()
      : '';
  const forEachChildValueName =
    selectedEventType === 'BuiltinCommonInstructions::ForEachChildVariable' &&
    selectedEvent
      ? gd
          .asForEachChildVariableEvent(selectedEvent)
          .getValueIteratorVariableName()
      : '';
  const forEachChildKeyName =
    selectedEventType === 'BuiltinCommonInstructions::ForEachChildVariable' &&
    selectedEvent
      ? gd
          .asForEachChildVariableEvent(selectedEvent)
          .getKeyIteratorVariableName()
      : '';
  const variablesContainer =
    selectedEvent && selectedEvent.canHaveVariables()
      ? selectedEvent.getVariables()
      : null;
  const selectedEventInstructionStats = selectedEvent
    ? getEventInstructionStats(selectedEvent, selectedEventType)
    : {
        whileConditionsCount: 0,
        conditionsCount: 0,
        actionsCount: 0,
        totalInstructionsCount: 0,
      };
  const selectedEventDirectSubEventsCount =
    selectedEvent && selectedEvent.canHaveSubEvents()
      ? selectedEvent.getSubEvents().getEventsCount()
      : 0;
  const selectedEventTotalSubEventsCount =
    selectedEvent && selectedEvent.canHaveSubEvents()
      ? countSubEventsRecursively(selectedEvent.getSubEvents())
      : 0;
  const selectedEventVariablesCount = variablesContainer
    ? variablesContainer.count()
    : 0;
  const selectedEventIndexInList = selectedEventContext
    ? selectedEventContext.indexInList + 1
    : 0;
  const selectedEventSiblingsCount = selectedEventContext
    ? selectedEventContext.eventsList.getEventsCount()
    : 0;
  const selectedEventPtr = selectedEvent ? selectedEvent.ptr : null;

  const [groupNameDraft, setGroupNameDraft] = React.useState<string>('');
  const [commentDraft, setCommentDraft] = React.useState<string>('');
  const [newVariableName, setNewVariableName] = React.useState<string>('');
  const [variableDraftValues, setVariableDraftValues] = React.useState<{
    [string]: string,
  }>({});
  const [
    instructionParameterDraftValues,
    setInstructionParameterDraftValues,
  ] = React.useState<{
    [number]: string,
  }>({});

  React.useEffect(
    () => {
      setVariableDraftValues({});
      setNewVariableName('');
      setInstructionParameterDraftValues({});

      if (!selectedEvent) {
        setGroupNameDraft('');
        setCommentDraft('');
        return;
      }

      if (isGroupEvent) {
        setGroupNameDraft(gd.asGroupEvent(selectedEvent).getName());
      } else {
        setGroupNameDraft('');
      }

      if (isCommentEvent) {
        setCommentDraft(gd.asCommentEvent(selectedEvent).getComment());
      } else {
        setCommentDraft('');
      }
    },
    [
      selectedEventPtr,
      selectedInstructionPtr,
      isGroupEvent,
      isCommentEvent,
      selectedEvent,
    ]
  );

  if (!selectedEvent && !selectedInstruction) {
    return (
      <aside className="events-inspector-panel">
        <div className="events-inspector-section">
          <Text size="section-title" noMargin>
            <Trans>Inspector</Trans>
          </Text>
          <Text color="secondary" noMargin>
            <Trans>
              Select an event or an instruction to inspect and edit it quickly.
            </Trans>
          </Text>
        </div>
      </aside>
    );
  }

  const canToggleFolded =
    !!selectedEvent &&
    selectedEvent.canHaveSubEvents() &&
    selectedEvent.getSubEvents().getEventsCount() > 0;
  const quickParameterCount = selectedInstruction
    ? selectedInstruction.getParametersCount()
    : 0;

  return (
    <aside className="events-inspector-panel">
      <div className="events-inspector-section">
        <Text size="section-title" noMargin>
          <Trans>Inspector</Trans>
        </Text>
        {selectedInstruction ? (
          <>
            <Text size="body2" noMargin>
              {selectedInstructionDisplayName}
            </Text>
            <Text color="secondary" size="body-small" noMargin allowSelection>
              {selectedInstructionType}
            </Text>
            <Text color="secondary" size="body-small" noMargin>
              {selectedInstructionIsCondition ? (
                <Trans>Condition</Trans>
              ) : (
                <Trans>Action</Trans>
              )}
            </Text>
            {selectedEvent && (
              <Text color="secondary" size="body-small" noMargin>
                <Trans>Inside event:</Trans> {selectedEventDisplayName}
              </Text>
            )}
            {selectedInstructionsCount > 1 && (
              <Text color="secondary" size="body-small" noMargin>
                <Trans>
                  {selectedInstructionsCount} instructions are selected. Editing
                  the last selected instruction.
                </Trans>
              </Text>
            )}
          </>
        ) : (
          <>
            <Text size="body2" noMargin>
              {selectedEventDisplayName}
            </Text>
            <Text color="secondary" size="body-small" noMargin allowSelection>
              {selectedEventType}
            </Text>
            {selectedEventDescription && (
              <Text color="secondary" size="body-small" noMargin>
                {selectedEventDescription}
              </Text>
            )}
            {selectedEventsCount > 1 && (
              <Text color="secondary" size="body-small" noMargin>
                <Trans>
                  {selectedEventsCount} events are selected. Editing the last
                  selected event.
                </Trans>
              </Text>
            )}
          </>
        )}
      </div>

      {selectedEvent && (
        <div className="events-inspector-section">
          <Text size="sub-title" noMargin>
            <Trans>Event Overview</Trans>
          </Text>
          <div className="events-inspector-overview-grid">
            <div className="events-inspector-overview-row">
              <Text size="body-small" color="secondary" noMargin>
                <Trans>Kind</Trans>
              </Text>
              <Text size="body2" noMargin>
                {selectedEventKindLabel}
              </Text>
            </div>
            <div className="events-inspector-overview-row">
              <Text size="body-small" color="secondary" noMargin>
                <Trans>Position</Trans>
              </Text>
              <Text size="body2" noMargin>
                <Trans>
                  #{selectedEventIndexInList} / {selectedEventSiblingsCount}
                </Trans>
              </Text>
            </div>
            <div className="events-inspector-overview-row">
              <Text size="body-small" color="secondary" noMargin>
                <Trans>Total instructions</Trans>
              </Text>
              <Text size="body2" noMargin>
                {selectedEventInstructionStats.totalInstructionsCount}
              </Text>
            </div>
            <div className="events-inspector-overview-row">
              <Text size="body-small" color="secondary" noMargin>
                <Trans>Sub-events</Trans>
              </Text>
              <Text size="body2" noMargin>
                <Trans>
                  {selectedEventDirectSubEventsCount} direct /{' '}
                  {selectedEventTotalSubEventsCount} total
                </Trans>
              </Text>
            </div>
          </div>

          <div className="events-inspector-badges">
            {selectedEventInstructionStats.whileConditionsCount > 0 && (
              <span className="events-inspector-badge">
                <Trans>
                  {selectedEventInstructionStats.whileConditionsCount} while
                  condition(s)
                </Trans>
              </span>
            )}
            <span className="events-inspector-badge">
              <Trans>
                {selectedEventInstructionStats.conditionsCount} condition(s)
              </Trans>
            </span>
            <span className="events-inspector-badge">
              <Trans>
                {selectedEventInstructionStats.actionsCount} action(s)
              </Trans>
            </span>
            <span className="events-inspector-badge">
              <Trans>{selectedEventVariablesCount} local variable(s)</Trans>
            </span>
          </div>
        </div>
      )}

      {selectedInstruction && (
        <div className="events-inspector-section">
          <Text size="sub-title" noMargin>
            <Trans>Instruction Quick Properties</Trans>
          </Text>
          <div className="events-inspector-badges">
            <span className="events-inspector-badge">
              <Trans>
                {selectedInstruction.getParametersCount()} parameter(s)
              </Trans>
            </span>
            <span className="events-inspector-badge">
              <Trans>
                Instruction #
                {selectedInstructionContext
                  ? selectedInstructionContext.indexInList + 1
                  : 1}
              </Trans>
            </span>
            <span className="events-inspector-badge">
              <Trans>
                {selectedInstructionSubInstructionsCount} direct
                sub-instruction(s)
              </Trans>
            </span>
            <span className="events-inspector-badge">
              <Trans>
                {selectedInstructionNestedSubInstructionsCount} total nested
                sub-instruction(s)
              </Trans>
            </span>
          </div>
          {selectedInstructionDescription && (
            <Text color="secondary" size="body-small" noMargin>
              {selectedInstructionDescription}
            </Text>
          )}

          {selectedInstructionIsCondition && (
            <Toggle
              label={<Trans>Inverted condition</Trans>}
              toggled={selectedInstruction.isInverted()}
              onToggle={(event, inverted) =>
                onSetSelectedInstructionInverted(inverted)
              }
              labelPosition="left"
            />
          )}

          {selectedInstructionCanBeAwaited && (
            <Toggle
              label={<Trans>Wait for action to finish</Trans>}
              toggled={selectedInstruction.isAwaited()}
              onToggle={(event, awaited) =>
                onSetSelectedInstructionAwaited(awaited)
              }
              labelPosition="left"
            />
          )}

          {quickParameterCount > 0 && (
            <div className="events-inspector-variables-list">
              {mapFor(0, quickParameterCount, parameterIndex => {
                const valueFromInstruction = selectedInstruction
                  ? selectedInstruction
                      .getParameter(parameterIndex)
                      .getPlainString()
                  : '';
                const valueForEditor =
                  instructionParameterDraftValues[parameterIndex] !== undefined
                    ? instructionParameterDraftValues[parameterIndex]
                    : valueFromInstruction;

                return (
                  <div
                    className="events-inspector-variable-item"
                    key={`instruction-parameter-${parameterIndex}`}
                  >
                    <div className="events-inspector-variable-header">
                      <Text size="body2" noMargin>
                        <Trans>Parameter {parameterIndex + 1}</Trans>
                      </Text>
                    </div>
                    <TextField
                      value={valueForEditor}
                      onChange={(event, value) => {
                        setInstructionParameterDraftValues(previousValues => ({
                          ...previousValues,
                          [parameterIndex]: value,
                        }));
                      }}
                      translatableHintText={t`Value`}
                      margin="dense"
                      fullWidth
                      onBlur={() => {
                        onSetInstructionParameterValue(
                          parameterIndex,
                          valueForEditor
                        );
                        setInstructionParameterDraftValues(previousValues => {
                          const nextValues = { ...previousValues };
                          delete nextValues[parameterIndex];
                          return nextValues;
                        });
                      }}
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          event.currentTarget.blur();
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="events-inspector-actions-row">
            <FlatButton
              label={<Trans>Edit full instruction</Trans>}
              onClick={() => onOpenSelectedInstructionEditor()}
            />
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="events-inspector-section">
          <Text size="sub-title" noMargin>
            <Trans>Status</Trans>
          </Text>
          <Toggle
            label={<Trans>Disabled</Trans>}
            toggled={selectedEvent.isExecutable() && selectedEvent.isDisabled()}
            onToggle={() => onToggleDisabledEvent()}
            disabled={!selectedEvent.isExecutable()}
            labelPosition="left"
          />
          <Toggle
            label={<Trans>Expanded sub-events</Trans>}
            toggled={!selectedEvent.isFolded()}
            onToggle={(event, expanded) => onSetEventFolded(!expanded)}
            disabled={!canToggleFolded}
            labelPosition="left"
          />
          <div className="events-inspector-badges">
            <span className="events-inspector-badge">
              {selectedEvent.isExecutable() ? (
                <Trans>Executable</Trans>
              ) : (
                <Trans>Non executable</Trans>
              )}
            </span>
            <span className="events-inspector-badge">
              {selectedEvent.canHaveVariables() ? (
                <Trans>Supports local variables</Trans>
              ) : (
                <Trans>No local variables</Trans>
              )}
            </span>
          </div>
        </div>
      )}

      {selectedEventType === 'BuiltinCommonInstructions::Else' &&
        !isSelectedElseEventValid &&
        selectedEvent && (
          <div className="events-inspector-section events-inspector-warning">
            <Text size="sub-title" noMargin color="error">
              <Trans>Warning</Trans>
            </Text>
            <Text size="body-small" noMargin>
              <Trans>
                This Else event is not preceded by a Standard or Else event.
              </Trans>
            </Text>
          </div>
        )}

      {isLinkEvent && selectedEvent && (
        <div className="events-inspector-section">
          <Text size="sub-title" noMargin>
            <Trans>Link Target</Trans>
          </Text>
          <div className="events-inspector-overview-grid">
            <div className="events-inspector-overview-row">
              <Text size="body-small" color="secondary" noMargin>
                <Trans>Type</Trans>
              </Text>
              <Text size="body2" noMargin>
                {linkTargetKind}
              </Text>
            </div>
            <div className="events-inspector-overview-row">
              <Text size="body-small" color="secondary" noMargin>
                <Trans>Target</Trans>
              </Text>
              <Text size="body2" noMargin allowSelection>
                {linkTarget || '-'}
              </Text>
            </div>
          </div>
        </div>
      )}

      {isJsCodeEvent && selectedEvent && (
        <div className="events-inspector-section">
          <Text size="sub-title" noMargin>
            <Trans>JavaScript Event</Trans>
          </Text>
          <div className="events-inspector-overview-grid">
            <div className="events-inspector-overview-row">
              <Text size="body-small" color="secondary" noMargin>
                <Trans>Code lines</Trans>
              </Text>
              <Text size="body2" noMargin>
                {jsCodeLinesCount}
              </Text>
            </div>
            <div className="events-inspector-overview-row">
              <Text size="body-small" color="secondary" noMargin>
                <Trans>Parameter objects</Trans>
              </Text>
              <Text size="body2" noMargin allowSelection>
                {jsCodeParameterObjects || '-'}
              </Text>
            </div>
          </div>
        </div>
      )}

      {isGroupEvent && selectedEvent && (
        <div className="events-inspector-section">
          <Text size="sub-title" noMargin>
            <Trans>Group</Trans>
          </Text>
          <TextField
            value={groupNameDraft}
            onChange={(event, value) => setGroupNameDraft(value)}
            translatableHintText={t`Group name`}
            margin="dense"
            fullWidth
            onBlur={() => {
              onSetGroupName(groupNameDraft);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
            }}
          />
        </div>
      )}

      {isCommentEvent && selectedEvent && (
        <div className="events-inspector-section">
          <Text size="sub-title" noMargin>
            <Trans>Comment</Trans>
          </Text>
          <TextField
            value={commentDraft}
            onChange={(event, value) => setCommentDraft(value)}
            translatableHintText={t`Comment`}
            margin="dense"
            fullWidth
            multiline
            rows={4}
            onBlur={() => {
              onSetCommentText(commentDraft);
            }}
          />
        </div>
      )}

      {isLoopEvent && selectedEvent && (
        <div className="events-inspector-section">
          <Text size="sub-title" noMargin>
            <Trans>Loop Index Variable</Trans>
          </Text>
          <div className="events-inspector-overview-grid">
            <div className="events-inspector-overview-row">
              <Text size="body-small" color="secondary" noMargin>
                <Trans>Index variable</Trans>
              </Text>
              <Text size="body2" noMargin allowSelection>
                {loopEvent && loopEvent.getLoopIndexVariableName()
                  ? loopEvent.getLoopIndexVariableName()
                  : '-'}
              </Text>
            </div>
            {selectedEventType === 'BuiltinCommonInstructions::Repeat' && (
              <div className="events-inspector-overview-row">
                <Text size="body-small" color="secondary" noMargin>
                  <Trans>Repeat expression</Trans>
                </Text>
                <Text size="body2" noMargin allowSelection>
                  {repeatExpression || '-'}
                </Text>
              </div>
            )}
            {selectedEventType === 'BuiltinCommonInstructions::ForEach' && (
              <div className="events-inspector-overview-row">
                <Text size="body-small" color="secondary" noMargin>
                  <Trans>Object to pick</Trans>
                </Text>
                <Text size="body2" noMargin allowSelection>
                  {forEachObjectToPick || '-'}
                </Text>
              </div>
            )}
            {selectedEventType ===
              'BuiltinCommonInstructions::ForEachChildVariable' && (
              <>
                <div className="events-inspector-overview-row">
                  <Text size="body-small" color="secondary" noMargin>
                    <Trans>Iterable variable</Trans>
                  </Text>
                  <Text size="body2" noMargin allowSelection>
                    {forEachChildIterableName || '-'}
                  </Text>
                </div>
                <div className="events-inspector-overview-row">
                  <Text size="body-small" color="secondary" noMargin>
                    <Trans>Value variable</Trans>
                  </Text>
                  <Text size="body2" noMargin allowSelection>
                    {forEachChildValueName || '-'}
                  </Text>
                </div>
                <div className="events-inspector-overview-row">
                  <Text size="body-small" color="secondary" noMargin>
                    <Trans>Key variable</Trans>
                  </Text>
                  <Text size="body2" noMargin allowSelection>
                    {forEachChildKeyName || '-'}
                  </Text>
                </div>
              </>
            )}
          </div>
          <div className="events-inspector-actions-row">
            <FlatButton
              label={<Trans>Add</Trans>}
              onClick={() => onAddLoopIndexVariable()}
              disabled={!canAddLoopIndexVariable}
            />
            <FlatButton
              label={<Trans>Remove</Trans>}
              onClick={() => onRemoveLoopIndexVariable()}
              disabled={!canRemoveLoopIndexVariable}
            />
          </div>
        </div>
      )}

      {variablesContainer && selectedEvent && (
        <div className="events-inspector-section">
          <Text size="sub-title" noMargin>
            <Trans>Local Variables</Trans>
          </Text>
          <Text color="secondary" size="body-small" noMargin>
            <Trans>{variablesContainer.count()} variable(s)</Trans>
          </Text>

          <div className="events-inspector-actions-row">
            <TextField
              value={newVariableName}
              onChange={(event, value) => setNewVariableName(value)}
              translatableHintText={t`Variable name`}
              margin="dense"
              fullWidth
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  const trimmedName = newVariableName.trim();
                  if (!trimmedName) return;
                  onAddLocalVariable(trimmedName);
                  setNewVariableName('');
                }
              }}
            />
            <FlatButton
              label={<Trans>Add</Trans>}
              onClick={() => {
                const trimmedName = newVariableName.trim();
                if (!trimmedName) return;
                onAddLocalVariable(trimmedName);
                setNewVariableName('');
              }}
              disabled={!newVariableName.trim()}
            />
          </div>

          <div className="events-inspector-variables-list">
            {mapFor(0, variablesContainer.count(), i => {
              const variable = variablesContainer.getAt(i);
              const variableName = variablesContainer.getNameAt(i);
              const variableKey = `${variable.ptr}`;
              const variableType = variable.getType();
              const isPrimitive = isPrimitiveVariable(variable);
              const valueFromVariable = getVariablePrimitiveValue(variable);
              const valueForEditor =
                variableDraftValues[variableKey] !== undefined
                  ? variableDraftValues[variableKey]
                  : valueFromVariable;

              return (
                <div
                  className="events-inspector-variable-item"
                  key={variableKey}
                >
                  <div className="events-inspector-variable-header">
                    <Text size="body2" noMargin allowSelection>
                      {variableName}
                    </Text>
                    <Text size="body-small" color="secondary" noMargin>
                      {getVariableTypeLabel(variableType)}
                    </Text>
                  </div>

                  {variableType === gd.Variable.Boolean ? (
                    <Toggle
                      label={<Trans>Value</Trans>}
                      toggled={valueForEditor === 'true'}
                      onToggle={(event, checked) => {
                        const newValue = checked ? 'true' : 'false';
                        setVariableDraftValues(previousValues => ({
                          ...previousValues,
                          [variableKey]: newValue,
                        }));
                        onSetLocalVariablePrimitiveValue(
                          variableName,
                          newValue
                        );
                      }}
                      labelPosition="left"
                    />
                  ) : isPrimitive ? (
                    <TextField
                      value={valueForEditor}
                      onChange={(event, value) => {
                        setVariableDraftValues(previousValues => ({
                          ...previousValues,
                          [variableKey]: value,
                        }));
                      }}
                      type={
                        variableType === gd.Variable.Number ? 'number' : 'text'
                      }
                      margin="dense"
                      fullWidth
                      onBlur={() => {
                        onSetLocalVariablePrimitiveValue(
                          variableName,
                          valueForEditor
                        );
                        setVariableDraftValues(previousValues => {
                          const nextValues = { ...previousValues };
                          delete nextValues[variableKey];
                          return nextValues;
                        });
                      }}
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          event.currentTarget.blur();
                        }
                      }}
                    />
                  ) : (
                    <Text size="body-small" color="secondary" noMargin>
                      <Trans>{variable.getChildrenCount()} child(ren)</Trans>
                    </Text>
                  )}
                </div>
              );
            })}
          </div>
          <FlatButton
            label={<Trans>Open full variables editor</Trans>}
            onClick={() => onOpenLocalVariablesDialog()}
          />
        </div>
      )}
    </aside>
  );
};

export default React.memo<Props>(EventInspectorPanel);
