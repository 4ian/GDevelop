// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import Text from '../../UI/Text';
import FlatButton from '../../UI/FlatButton';
import IconButton from '../../UI/IconButton';
import InlineCheckbox from '../../UI/InlineCheckbox';
import SelectOption from '../../UI/SelectOption';
import Slider from '../../UI/Slider';
import CompactSemiControlledTextField from '../../UI/CompactSemiControlledTextField';
import CompactSemiControlledNumberField from '../../UI/CompactSemiControlledNumberField';
import CompactSelectField from '../../UI/CompactSelectField';
import Trash from '../../UI/CustomSvgIcons/Trash';
import Add from '../../UI/CustomSvgIcons/Add';
import {
  type StateMachineData,
  type StateMachineSelection,
  type State,
  type Transition,
  type Condition,
  type ConditionOperator,
  type InterruptionSource,
  anyStateId,
  getSelectedState,
  getSelectedTransition,
  getSelectedSubMachine,
  getState,
  getSubMachine,
  getStatesOfSubMachine,
  getTransitionSourceLabel,
  getTransitionTargetLabel,
  getParameter,
  getOperatorsForParameterType,
  getConditionValueKind,
  getBlendTreeSelection,
  interruptionSourceChoices,
} from './StateMachineUtils';

type Props = {|
  data: StateMachineData,
  selection: StateMachineSelection,
  animationNames: Array<string>,
  onUpdateState: (stateId: string, changes: $Shape<State>) => void,
  onUpdateTransition: (
    sourceStateId: string,
    transitionId: string,
    changes: $Shape<Transition>
  ) => void,
  onAddCondition: (sourceStateId: string, transitionId: string) => void,
  onUpdateCondition: (
    sourceStateId: string,
    transitionId: string,
    conditionIndex: number,
    changes: $Shape<Condition>
  ) => void,
  onDeleteCondition: (
    sourceStateId: string,
    transitionId: string,
    conditionIndex: number
  ) => void,
  onSetEntryState: (stateId: string) => void,
  onSetSubMachineEntryState: (subMachineId: string, stateId: string) => void,
  onMoveStateToSubMachine: (stateId: string, subMachineId: string) => void,
  onToggleBlendTree: (stateId: string, enabled: boolean) => void,
  onUpdateBlendTree: (stateId: string, changes: Object) => void,
  onAddBlendTreeChild: (stateId: string) => void,
  onUpdateBlendTreeChild: (
    stateId: string,
    childIndex: number,
    changes: Object
  ) => void,
  onDeleteBlendTreeChild: (stateId: string, childIndex: number) => void,
  onUpdateSubMachine: (subMachineId: string, changes: Object) => void,
  onDeleteSubMachine: (subMachineId: string, deleteStates: boolean) => void,
  onDeleteState: (stateId: string) => void,
  onDeleteTransition: (sourceStateId: string, transitionId: string) => void,
|};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'auto',
    padding: 8,
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  fieldLabel: {
    width: 110,
    flexShrink: 0,
  },
  fieldControl: {
    flex: 1,
    minWidth: 0,
  },
  conditionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  blendAxis: {
    position: 'relative',
    height: 26,
    borderRadius: 4,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    marginBottom: 4,
    flexShrink: 0,
  },
  blendAxisMarker: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 3,
    borderRadius: 2,
  },
  blendAxisLabel: {
    position: 'absolute',
    top: -1,
    fontSize: 9,
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  blendPreviewMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
  },
  motionRowHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    margin: '8px 0',
    flexShrink: 0,
  },
};

const StateMachineInspector = ({
  data,
  selection,
  animationNames,
  onUpdateState,
  onUpdateTransition,
  onAddCondition,
  onUpdateCondition,
  onDeleteCondition,
  onSetEntryState,
  onSetSubMachineEntryState,
  onMoveStateToSubMachine,
  onToggleBlendTree,
  onUpdateBlendTree,
  onAddBlendTreeChild,
  onUpdateBlendTreeChild,
  onDeleteBlendTreeChild,
  onUpdateSubMachine,
  onDeleteSubMachine,
  onDeleteState,
  onDeleteTransition,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [blendPreviewValue, setBlendPreviewValue] = React.useState(0);
  React.useEffect(
    () => {
      setBlendPreviewValue(0);
    },
    [selection]
  );
  const selectedState = getSelectedState(data, selection);
  const selectedTransition = getSelectedTransition(data, selection);
  const selectedSubMachine = getSelectedSubMachine(data, selection);
  const transitionSourceStateId =
    selection && selection.kind === 'transition'
      ? selection.sourceStateId
      : null;
  const targetState =
    selectedTransition && !selectedTransition.targetSubMachineId
      ? getState(data, selectedTransition.targetStateId)
      : null;

  const renderFieldRow = (label: React.Node, control: React.Node) => (
    <div style={styles.fieldRow}>
      <div style={styles.fieldLabel}>
        <Text size="body" noMargin color="secondary">
          {label}
        </Text>
      </div>
      <div style={styles.fieldControl}>{control}</div>
    </div>
  );

  const renderTransitionInspector = (transition: Transition) => {
    const isAnyStateSource = transitionSourceStateId === anyStateId;
    const isSelfTransition =
      !!targetState &&
      !!transitionSourceStateId &&
      transition.targetStateId === transitionSourceStateId;
    return (
      <div>
        <Text size="sub-title" noMargin>
          <Trans>Transition</Trans>
        </Text>
        <Text size="body" noMargin color="secondary">
          {`${getTransitionSourceLabel(
            data,
            transitionSourceStateId || ''
          )} → ${getTransitionTargetLabel(data, transition)}`}
        </Text>
        {isAnyStateSource ? (
          <Text size="body" noMargin color="secondary">
            <Trans>
              Transitions from Any State are checked before the ones of the
              current state and can fire from any state.
            </Trans>
          </Text>
        ) : null}
        <div style={styles.separator} />
        <div style={styles.fieldRow}>
          <InlineCheckbox
            label={<Trans>Has exit time</Trans>}
            checked={transition.hasExitTime}
            onCheck={(e, checked) =>
              onUpdateTransition(transitionSourceStateId || '', transition.id, {
                hasExitTime: checked,
              })
            }
          />
        </div>
        {renderFieldRow(
          <Trans>Exit time</Trans>,
          <CompactSemiControlledNumberField
            value={transition.exitTime}
            disabled={!transition.hasExitTime}
            commitOnBlur
            onChange={value =>
              onUpdateTransition(transitionSourceStateId || '', transition.id, {
                exitTime: value,
              })
            }
          />
        )}
        <Text size="body" noMargin color="secondary">
          <Trans>
            Normalized time of the animation (1 is the end of the animation,
            above 1 waits for several loops).
          </Trans>
        </Text>
        <div style={styles.separator} />
        {renderFieldRow(
          <Trans>Interruption source</Trans>,
          <CompactSelectField
            value={transition.interruptionSource}
            onChange={(value: string) =>
              onUpdateTransition(transitionSourceStateId || '', transition.id, {
                interruptionSource: ((value: any): InterruptionSource),
              })
            }
          >
            {interruptionSourceChoices.map(choice => (
              <SelectOption
                key={choice.value}
                value={choice.value}
                label={choice.label}
                shouldNotTranslate
              />
            ))}
          </CompactSelectField>
        )}
        <Text size="body" noMargin color="secondary">
          <Trans>
            Define which transitions can interrupt this transition while it
            waits for its exit time.
          </Trans>
        </Text>
        {isAnyStateSource || isSelfTransition ? (
          <>
            <div style={styles.separator} />
            <div style={styles.fieldRow}>
              <InlineCheckbox
                label={<Trans>Can transition to self</Trans>}
                checked={transition.canTransitionToSelf}
                onCheck={(e, checked) =>
                  onUpdateTransition(
                    transitionSourceStateId || '',
                    transition.id,
                    { canTransitionToSelf: checked }
                  )
                }
              />
            </div>
            <Text size="body" noMargin color="secondary">
              <Trans>
                When disabled, the transition is ignored if the machine is
                already in the target state.
              </Trans>
            </Text>
          </>
        ) : null}
        <div style={styles.separator} />
        <Text size="sub-title" noMargin>
          <Trans>Conditions</Trans>
        </Text>
        {transition.conditions.length === 0 ? (
          <Text size="body" noMargin color="secondary">
            <Trans>
              No condition: the transition is triggered as soon as the exit time
              is reached.
            </Trans>
          </Text>
        ) : null}
        {transition.conditions.map((condition, index) => {
          const parameter = getParameter(data, condition.parameterName);
          const operators = parameter
            ? getOperatorsForParameterType(parameter.type)
            : [];
          const hasValueField =
            getConditionValueKind(data, condition) === 'number';
          return (
            <div key={index} style={styles.conditionRow}>
              <div style={{ flex: 2, minWidth: 0 }}>
                <CompactSelectField
                  value={parameter ? condition.parameterName : ''}
                  onChange={(value: string) =>
                    onUpdateCondition(
                      transitionSourceStateId || '',
                      transition.id,
                      index,
                      {
                        parameterName: value,
                        operator: getOperatorsForParameterType(
                          (getParameter(data, value) || { type: 'number' }).type
                        )[0].value,
                        value: 0,
                      }
                    )
                  }
                >
                  {!parameter ? (
                    <SelectOption
                      value=""
                      label="Missing parameter"
                      shouldNotTranslate
                    />
                  ) : null}
                  {data.parameters.map(candidate => (
                    <SelectOption
                      key={candidate.name}
                      value={candidate.name}
                      label={candidate.name}
                      shouldNotTranslate
                    />
                  ))}
                </CompactSelectField>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <CompactSelectField
                  value={condition.operator}
                  onChange={(value: string) =>
                    onUpdateCondition(
                      transitionSourceStateId || '',
                      transition.id,
                      index,
                      { operator: ((value: any): ConditionOperator) }
                    )
                  }
                >
                  {!parameter ? (
                    <SelectOption
                      value={condition.operator}
                      label="="
                      shouldNotTranslate
                    />
                  ) : null}
                  {operators.map(operatorChoice => (
                    <SelectOption
                      key={operatorChoice.value}
                      value={operatorChoice.value}
                      label={operatorChoice.label}
                      shouldNotTranslate
                    />
                  ))}
                </CompactSelectField>
              </div>
              {hasValueField ? (
                <div style={{ width: 60, flexShrink: 0 }}>
                  <CompactSemiControlledNumberField
                    value={condition.value}
                    commitOnBlur
                    onChange={value =>
                      onUpdateCondition(
                        transitionSourceStateId || '',
                        transition.id,
                        index,
                        { value }
                      )
                    }
                  />
                </div>
              ) : null}
              <IconButton
                size="small"
                tooltip={'Delete this condition'}
                onClick={() =>
                  onDeleteCondition(
                    transitionSourceStateId || '',
                    transition.id,
                    index
                  )
                }
              >
                <Trash />
              </IconButton>
            </div>
          );
        })}
        <FlatButton
          label={<Trans>Add a condition</Trans>}
          onClick={() =>
            onAddCondition(transitionSourceStateId || '', transition.id)
          }
          disabled={data.parameters.length === 0}
          leftIcon={<Add />}
        />
        {data.parameters.length === 0 ? (
          <Text size="body" noMargin color="secondary">
            <Trans>Add parameters first to use conditions.</Trans>
          </Text>
        ) : null}
        <div style={styles.separator} />
        <FlatButton
          label={<Trans>Delete the transition</Trans>}
          onClick={() =>
            onDeleteTransition(transitionSourceStateId || '', transition.id)
          }
        />
      </div>
    );
  };

  const renderBlendTreeEditor = (state: State) => {
    const blendTree = state.blendTree;
    if (!blendTree) return null;
    const numberParameters = data.parameters.filter(
      parameter => parameter.type === 'number'
    );
    const thresholds = blendTree.children.map(child => child.threshold);
    const minThreshold = thresholds.length ? Math.min(...thresholds) : 0;
    const maxThreshold = thresholds.length ? Math.max(...thresholds) : 1;
    const sliderMin =
      minThreshold === maxThreshold ? minThreshold - 1 : minThreshold;
    const sliderMax =
      minThreshold === maxThreshold ? maxThreshold + 1 : maxThreshold;
    const previewValue = Math.max(
      sliderMin,
      Math.min(sliderMax, blendPreviewValue)
    );
    const selection2 = getBlendTreeSelection(blendTree, previewValue);
    const getThresholdPosition = (threshold: number) => {
      if (maxThreshold === minThreshold) return 50;
      return ((threshold - minThreshold) / (maxThreshold - minThreshold)) * 100;
    };
    return (
      <div>
        <Text size="sub-title" noMargin>
          <Trans>Blend Tree</Trans>
        </Text>
        <Text size="body" color="secondary" noMargin>
          <Trans>
            The animation and its speed are chosen from the value of the
            parameter.
          </Trans>
        </Text>
        <div style={styles.separator} />
        {renderFieldRow(
          <Trans>Parameter</Trans>,
          <CompactSelectField
            value={blendTree.parameterName}
            onChange={(value: string) =>
              onUpdateBlendTree(state.id, { parameterName: value })
            }
          >
            <SelectOption value="" label="None" shouldNotTranslate />
            {numberParameters.map(parameter => (
              <SelectOption
                key={parameter.name}
                value={parameter.name}
                label={parameter.name}
                shouldNotTranslate
              />
            ))}
          </CompactSelectField>
        )}
        {numberParameters.length === 0 ? (
          <Text size="body" color="secondary" noMargin>
            <Trans>Add a number parameter to drive the blend tree.</Trans>
          </Text>
        ) : null}
        <div style={styles.separator} />
        {/* The blend axis, with a marker for each animation. */}
        <div
          style={{
            ...styles.blendAxis,
            backgroundColor: gdevelopTheme.dialog.backgroundColor,
          }}
        >
          {blendTree.children.map((child, index) => (
            <div
              key={index}
              style={{
                ...styles.blendAxisMarker,
                left: `${getThresholdPosition(child.threshold)}%`,
                backgroundColor:
                  index === selection2.childIndex
                    ? gdevelopTheme.palette.primary
                    : gdevelopTheme.toolbar.separatorColor,
              }}
              title={`${child.animationName} (${child.threshold})`}
            />
          ))}
          <div
            style={{
              ...styles.blendPreviewMarker,
              left: `${getThresholdPosition(previewValue)}%`,
              backgroundColor: gdevelopTheme.message.warning,
            }}
          />
        </div>
        <Slider
          value={previewValue}
          min={sliderMin}
          max={sliderMax}
          step={0.01}
          onChange={(value: number) => setBlendPreviewValue(value)}
        />
        <Text size="body" noMargin>
          {selection2.animationName
            ? `▶ ${selection2.animationName} — ${(
                selection2.speed * state.speed
              ).toFixed(2)}x`
            : '—'}
        </Text>
        <Text size="body" color="secondary" noMargin>
          <Trans>Move the slider to preview the blend.</Trans>
        </Text>
        <div style={styles.separator} />
        {/* The animations of the blend tree. */}
        <div style={styles.motionRowHeader}>
          <div style={{ flex: 2, minWidth: 0 }}>
            <Text size="body-small" color="secondary" noMargin>
              <Trans>Animation</Trans>
            </Text>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text size="body-small" color="secondary" noMargin>
              <Trans>Threshold</Trans>
            </Text>
          </div>
          <div style={{ width: 52, flexShrink: 0 }}>
            <Text size="body-small" color="secondary" noMargin>
              <Trans>Speed</Trans>
            </Text>
          </div>
          <div style={{ width: 24, flexShrink: 0 }} />
        </div>
        {blendTree.children.map((child, index) => (
          <div key={index} style={styles.conditionRow}>
            <div style={{ flex: 2, minWidth: 0 }}>
              <CompactSelectField
                value={child.animationName}
                onChange={(value: string) =>
                  onUpdateBlendTreeChild(state.id, index, {
                    animationName: value,
                  })
                }
              >
                <SelectOption value="" label="None" shouldNotTranslate />
                {animationNames.map(animationName => (
                  <SelectOption
                    key={animationName}
                    value={animationName}
                    label={animationName}
                    shouldNotTranslate
                  />
                ))}
                {child.animationName &&
                !animationNames.includes(child.animationName) ? (
                  <SelectOption
                    value={child.animationName}
                    label={child.animationName}
                    shouldNotTranslate
                  />
                ) : null}
              </CompactSelectField>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <CompactSemiControlledNumberField
                value={child.threshold}
                commitOnBlur
                onChange={threshold =>
                  onUpdateBlendTreeChild(state.id, index, { threshold })
                }
              />
            </div>
            <div style={{ width: 52, flexShrink: 0 }}>
              <CompactSemiControlledNumberField
                value={child.speed}
                commitOnBlur
                onChange={speed =>
                  onUpdateBlendTreeChild(state.id, index, { speed })
                }
              />
            </div>
            <IconButton
              size="small"
              tooltip={'Delete this animation'}
              onClick={() => onDeleteBlendTreeChild(state.id, index)}
            >
              <Trash />
            </IconButton>
          </div>
        ))}
        <FlatButton
          label={<Trans>Add an animation</Trans>}
          onClick={() => onAddBlendTreeChild(state.id)}
          disabled={animationNames.length === 0}
          leftIcon={<Add />}
        />
        <div style={styles.separator} />
        {renderFieldRow(
          <Trans>Speed multiplier</Trans>,
          <CompactSemiControlledNumberField
            value={state.speed}
            commitOnBlur
            onChange={speed => onUpdateState(state.id, { speed })}
          />
        )}
        <div style={styles.fieldRow}>
          <InlineCheckbox
            label={<Trans>Restart the animations on enter</Trans>}
            checked={state.restartAnimationOnEnter}
            onCheck={(e, checked) =>
              onUpdateState(state.id, { restartAnimationOnEnter: checked })
            }
          />
        </div>
        <div style={styles.separator} />
        <FlatButton
          label={<Trans>Remove the blend tree</Trans>}
          onClick={() => onToggleBlendTree(state.id, false)}
        />
      </div>
    );
  };

  const renderStateInspector = (state: State) => {
    const subMachine = state.subMachineId
      ? getSubMachine(data, state.subMachineId)
      : null;
    const isEntry = subMachine
      ? subMachine.entryStateId === state.id
      : data.entryStateId === state.id;
    const animationChoices = animationNames.slice();
    if (
      state.animationName &&
      !animationChoices.includes(state.animationName)
    ) {
      animationChoices.push(state.animationName);
    }
    return (
      <div>
        <Text size="sub-title" noMargin>
          <Trans>State</Trans>
        </Text>
        <div style={styles.separator} />
        {renderFieldRow(
          <Trans>Name</Trans>,
          <CompactSemiControlledTextField
            value={state.name}
            commitOnBlur
            onChange={newName => {
              const trimmedName = newName.trim();
              if (!trimmedName || trimmedName === state.name) return;
              onUpdateState(state.id, { name: trimmedName });
            }}
          />
        )}
        {state.blendTree ? (
          renderBlendTreeEditor(state)
        ) : (
          <>
            {renderFieldRow(
              <Trans>Animation</Trans>,
              <CompactSelectField
                value={state.animationName}
                onChange={(value: string) =>
                  onUpdateState(state.id, { animationName: value })
                }
              >
                <SelectOption value="" label="None" shouldNotTranslate />
                {animationChoices.map(animationName => (
                  <SelectOption
                    key={animationName}
                    value={animationName}
                    label={animationName}
                    shouldNotTranslate
                  />
                ))}
              </CompactSelectField>
            )}
            {renderFieldRow(
              <Trans>Speed</Trans>,
              <CompactSemiControlledNumberField
                value={state.speed}
                commitOnBlur
                onChange={speed => onUpdateState(state.id, { speed })}
              />
            )}
            <div style={styles.fieldRow}>
              <InlineCheckbox
                label={<Trans>Restart the animation on enter</Trans>}
                checked={state.restartAnimationOnEnter}
                onCheck={(e, checked) =>
                  onUpdateState(state.id, { restartAnimationOnEnter: checked })
                }
              />
            </div>
            <FlatButton
              label={<Trans>Convert to a blend tree</Trans>}
              onClick={() => onToggleBlendTree(state.id, true)}
              disabled={animationNames.length === 0}
            />
            {animationNames.length === 0 ? (
              <Text size="body" noMargin color="secondary">
                <Trans>Add animations to the object to use a blend tree.</Trans>
              </Text>
            ) : null}
          </>
        )}
        <div style={styles.separator} />
        {renderFieldRow(
          <Trans>Sub-state machine</Trans>,
          <CompactSelectField
            value={state.subMachineId || ''}
            onChange={(value: string) =>
              onMoveStateToSubMachine(state.id, value)
            }
          >
            <SelectOption value="" label="Root" shouldNotTranslate />
            {data.subMachines.map(subMachineChoice => (
              <SelectOption
                key={subMachineChoice.id}
                value={subMachineChoice.id}
                label={subMachineChoice.name}
                shouldNotTranslate
              />
            ))}
          </CompactSelectField>
        )}
        <div style={styles.separator} />
        <FlatButton
          label={
            subMachine ? (
              <Trans>Set as the entry state of the sub-state machine</Trans>
            ) : (
              <Trans>Set as the entry state</Trans>
            )
          }
          onClick={() =>
            subMachine
              ? onSetSubMachineEntryState(subMachine.id, state.id)
              : onSetEntryState(state.id)
          }
          disabled={isEntry}
        />
        {isEntry ? (
          <Text size="body" noMargin color="secondary">
            <Trans>This is the state played when the machine starts.</Trans>
          </Text>
        ) : null}
        <div style={styles.separator} />
        <FlatButton
          label={<Trans>Delete the state</Trans>}
          onClick={() => onDeleteState(state.id)}
        />
      </div>
    );
  };

  const renderSubMachineInspector = (subMachine: {
    id: string,
    name: string,
    entryStateId: string,
  }) => {
    const childStates = getStatesOfSubMachine(data, subMachine.id);
    return (
      <div>
        <Text size="sub-title" noMargin>
          <Trans>Sub-state machine</Trans>
        </Text>
        <Text size="body" noMargin color="secondary">
          {`${childStates.length} state${childStates.length > 1 ? 's' : ''}`}
        </Text>
        <div style={styles.separator} />
        {renderFieldRow(
          <Trans>Name</Trans>,
          <CompactSemiControlledTextField
            value={subMachine.name}
            commitOnBlur
            onChange={newName => {
              const trimmedName = newName.trim();
              if (!trimmedName || trimmedName === subMachine.name) return;
              onUpdateSubMachine(subMachine.id, { name: trimmedName });
            }}
          />
        )}
        {renderFieldRow(
          <Trans>Entry state</Trans>,
          <CompactSelectField
            value={subMachine.entryStateId}
            onChange={(value: string) =>
              onSetSubMachineEntryState(subMachine.id, value)
            }
          >
            <SelectOption value="" label="None" shouldNotTranslate />
            {childStates.map(childState => (
              <SelectOption
                key={childState.id}
                value={childState.id}
                label={childState.name}
                shouldNotTranslate
              />
            ))}
          </CompactSelectField>
        )}
        <Text size="body" noMargin color="secondary">
          <Trans>
            A transition targeting this sub-state machine enters its entry
            state.
          </Trans>
        </Text>
        <div style={styles.separator} />
        <FlatButton
          label={<Trans>Ungroup (move the states to the root)</Trans>}
          onClick={() => onDeleteSubMachine(subMachine.id, false)}
          disabled={childStates.length === 0}
        />
        <div style={styles.separator} />
        <FlatButton
          label={<Trans>Delete with its states</Trans>}
          onClick={() => onDeleteSubMachine(subMachine.id, true)}
        />
      </div>
    );
  };

  const renderAnyStateInspector = () => (
    <div>
      <Text size="sub-title" noMargin>
        <Trans>Any State</Trans>
      </Text>
      <div style={styles.separator} />
      <Text size="body" noMargin color="secondary">
        <Trans>
          Transitions starting from Any State are checked before the ones of the
          current state: they can fire from any state. Use them for reactions
          like dying, getting hit or jumping.
        </Trans>
      </Text>
      <Text size="body" noMargin color="secondary">
        {`${data.anyState.transitions.length} transition${
          data.anyState.transitions.length > 1 ? 's' : ''
        }`}
      </Text>
      <Text size="body" noMargin color="secondary">
        <Trans>
          Select one of its transitions in the graph to edit its conditions and
          exit time.
        </Trans>
      </Text>
    </div>
  );

  return (
    <div
      style={{
        ...styles.container,
        borderLeft: `1px solid ${gdevelopTheme.toolbar.separatorColor}`,
      }}
    >
      {selectedTransition ? (
        renderTransitionInspector(selectedTransition)
      ) : selectedState ? (
        renderStateInspector(selectedState)
      ) : selection && selection.kind === 'anyState' ? (
        renderAnyStateInspector()
      ) : selectedSubMachine ? (
        renderSubMachineInspector(selectedSubMachine)
      ) : (
        <Text size="body" noMargin color="secondary">
          <Trans>
            Select a state or a transition in the graph to edit it. Right click
            to add states and transitions.
          </Trans>
        </Text>
      )}
    </div>
  );
};

export default StateMachineInspector;
