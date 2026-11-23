// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import Text from '../../UI/Text';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import Add from '../../UI/CustomSvgIcons/Add';
import useForceUpdate from '../../Utils/UseForceUpdate';
import StateMachineGraph, {
  type StateMachineGraphInterface,
} from './StateMachineGraph';
import StateMachineParameters from './StateMachineParameters';
import StateMachineInspector from './StateMachineInspector';
import {
  type StateMachineData,
  type StateMachineSelection,
  type Condition,
  type ParameterType,
  anyStateId,
  createState,
  createParameter,
  createTransition,
  createSubMachine,
  createBlendTree,
  createBlendTreeChild,
  addState,
  deleteState,
  updateState,
  setEntryState,
  addSubMachineToData,
  updateSubMachine,
  deleteSubMachine,
  moveSubMachine,
  moveStateToSubMachine,
  setSubMachineEntryState,
  addTransition,
  updateTransition,
  deleteTransition,
  addCondition,
  updateCondition,
  deleteCondition,
  addParameterToData,
  updateParameter,
  deleteParameter,
  renameParameter,
  getState,
  getStateByName,
  getStateMachineBehaviors,
  getValidationWarnings,
  getWarningSelection,
  type ValidationWarning,
  getUniqueStateName,
  getUniqueSubMachineName,
  getOperatorsForParameterType,
  getAnimationNames,
  parseStateMachineData,
  serializeStateMachineData,
  stateMachineBehaviorType,
} from './StateMachineUtils';

type EditorProps = {|
  object: ?gdObject,
  project: gdProject,
  behavior: gdBehavior,
  onUpdated: () => void,
|};

const styles = {
  editorContainer: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  parametersContainer: {
    width: 235,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRightStyle: 'solid',
    borderRightWidth: 1,
  },
  centerContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 8px',
    flexShrink: 0,
    minHeight: 36,
    boxSizing: 'border-box',
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  layerChip: {
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  rightContainer: {
    width: 350,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  inspectorContainer: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 12,
    padding: 24,
    textAlign: 'center',
  },
  validationContainer: {
    position: 'relative',
    marginLeft: 'auto',
  },
  validationPanel: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 0,
    width: 420,
    maxHeight: 320,
    overflow: 'auto',
    zIndex: 10,
    borderRadius: 6,
    borderStyle: 'solid',
    borderWidth: 1,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    padding: 8,
  },
  validationRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    padding: '4px 6px',
    borderRadius: 4,
    cursor: 'pointer',
  },
};

/**
 * The main editor: parameters on the left, the state machine graph in the
 * middle and the inspector/preview of the selection on the right.
 */
const AnimationStateMachineEditor = ({
  object,
  behavior,
  onUpdated,
}: EditorProps): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const graphRef = React.useRef<?StateMachineGraphInterface>(null);
  const [data, setData] = React.useState<StateMachineData>(() =>
    parseStateMachineData(
      behavior
        .getProperties()
        .get('stateMachineData')
        .getValue()
    )
  );
  const [selection, setSelection] = React.useState<StateMachineSelection>(null);
  const [isValidationOpen, setValidationOpen] = React.useState(false);
  const dataRef = React.useRef(data);
  dataRef.current = data;

  const objectConfiguration = object ? object.getConfiguration() : null;
  const animationNames = getAnimationNames(objectConfiguration);
  const validationWarnings = getValidationWarnings(data, animationNames);
  const validationErrorCount = validationWarnings.filter(
    warning => warning.severity === 'error'
  ).length;

  const renderWarningMessage = (warning: ValidationWarning): React.Node => {
    switch (warning.code) {
      case 'no-states':
        return <Trans>The state machine has no state yet.</Trans>;
      case 'no-entry-state':
        return <Trans>The state machine has no entry state.</Trans>;
      case 'state-no-animation':
        return <Trans>The state {warning.name} has no animation.</Trans>;
      case 'state-missing-animation':
        return (
          <Trans>
            The state {warning.name} uses the animation {warning.extraName},
            which doesn't exist in the object.
          </Trans>
        );
      case 'duplicate-state-name':
        return (
          <Trans>
            Several states are named {warning.name}: give them unique names to
            use them with the events.
          </Trans>
        );
      case 'condition-missing-parameter':
        return (
          <Trans>
            A transition uses the parameter {warning.name}, which doesn't exist
            anymore.
          </Trans>
        );
      case 'unreachable-state':
        return (
          <Trans>
            The state {warning.name} cannot be reached: no transition leads to
            it.
          </Trans>
        );
      case 'sub-machine-no-entry':
        return (
          <Trans>
            The sub-state machine {warning.name} has no entry state.
          </Trans>
        );
      case 'empty-sub-machine':
        return <Trans>The sub-state machine {warning.name} is empty.</Trans>;
      case 'blend-tree-no-parameter':
        return (
          <Trans>
            The blend tree of the state {warning.name} has no parameter.
          </Trans>
        );
      case 'blend-tree-missing-parameter':
        return (
          <Trans>
            The blend tree of the state {warning.extraName} uses the parameter{' '}
            {warning.name}, which doesn't exist or is not a number.
          </Trans>
        );
      case 'blend-tree-empty':
        return (
          <Trans>
            The blend tree of the state {warning.name} has no animation.
          </Trans>
        );
      case 'blend-tree-missing-animation':
        return (
          <Trans>
            The blend tree of the state {warning.name} uses the animation{' '}
            {warning.extraName}, which doesn't exist in the object.
          </Trans>
        );
      case 'blend-tree-duplicate-threshold':
        return (
          <Trans>
            The blend tree of the state {warning.name} has several animations
            with the same threshold ({warning.extraName}).
          </Trans>
        );
      default:
        return null;
    }
  };

  const applyChange = React.useCallback(
    (updater: StateMachineData => StateMachineData) => {
      const newData = updater(dataRef.current);
      dataRef.current = newData;
      setData(newData);
      behavior.updateProperty(
        'stateMachineData',
        serializeStateMachineData(newData)
      );
      onUpdated();
    },
    [behavior, onUpdated]
  );

  const handleAddState = React.useCallback(
    (x: number, y: number) => {
      const state = createState(
        getUniqueStateName(dataRef.current, 'State'),
        animationNames[0] || '',
        x,
        y
      );
      applyChange(data => addState(data, state));
      setSelection({ kind: 'state', stateId: state.id });
    },
    [applyChange, animationNames]
  );

  const handleAddStateAtViewCenter = React.useCallback(
    () => {
      const graph = graphRef.current;
      const center = graph ? graph.getGraphCenter() : { x: 100, y: 100 };
      handleAddState(center.x - 75, center.y - 23);
    },
    [handleAddState]
  );

  const handleAddSubMachine = React.useCallback(
    (x: number, y: number) => {
      const subMachine = createSubMachine(
        getUniqueSubMachineName(dataRef.current, 'Sub-state machine'),
        x,
        y
      );
      applyChange(data => addSubMachineToData(data, subMachine));
      setSelection({ kind: 'subMachine', subMachineId: subMachine.id });
    },
    [applyChange]
  );

  const handleDuplicateState = React.useCallback(
    (stateId: string) => {
      let newId = '';
      applyChange(data => {
        const sourceState = getState(data, stateId);
        if (!sourceState) return data;
        const newState = createState(
          getUniqueStateName(data, sourceState.name),
          sourceState.animationName,
          sourceState.x + 32,
          sourceState.y + 32
        );
        newState.speed = sourceState.speed;
        newState.restartAnimationOnEnter = sourceState.restartAnimationOnEnter;
        newState.subMachineId = sourceState.subMachineId;
        newState.blendTree = sourceState.blendTree
          ? JSON.parse(JSON.stringify(sourceState.blendTree))
          : null;
        newState.transitions = sourceState.transitions.map(transition => {
          const newTransition = createTransition(
            transition.targetStateId,
            transition.targetSubMachineId
          );
          newTransition.hasExitTime = transition.hasExitTime;
          newTransition.exitTime = transition.exitTime;
          newTransition.interruptionSource = transition.interruptionSource;
          newTransition.canTransitionToSelf = transition.canTransitionToSelf;
          newTransition.conditions = transition.conditions.map(condition => ({
            ...condition,
          }));
          return newTransition;
        });
        newId = newState.id;
        return addState(data, newState);
      });
      if (newId) setSelection({ kind: 'state', stateId: newId });
    },
    [applyChange]
  );

  const handleMoveState = React.useCallback(
    (stateId: string, x: number, y: number) => {
      if (stateId === anyStateId) {
        applyChange(data => ({
          ...data,
          anyState: { ...data.anyState, x, y },
        }));
        return;
      }
      applyChange(data => updateState(data, stateId, { x, y }));
    },
    [applyChange]
  );

  const handleMoveSubMachine = React.useCallback(
    (subMachineId: string, deltaX: number, deltaY: number) => {
      applyChange(data => moveSubMachine(data, subMachineId, deltaX, deltaY));
    },
    [applyChange]
  );

  const handleRenameState = React.useCallback(
    (stateId: string, name: string) => {
      const existingState = getStateByName(dataRef.current, name);
      if (existingState && existingState.id !== stateId) return;
      applyChange(data => updateState(data, stateId, { name }));
    },
    [applyChange]
  );

  const handleRenameSubMachine = React.useCallback(
    (subMachineId: string, name: string) => {
      applyChange(data => updateSubMachine(data, subMachineId, { name }));
    },
    [applyChange]
  );

  const handleCreateTransition = React.useCallback(
    (
      sourceStateId: string,
      targetId: string,
      targetKind: 'state' | 'subMachine'
    ) => {
      const { data: newData, transitionId } = addTransition(
        dataRef.current,
        sourceStateId,
        targetKind === 'subMachine' ? '' : targetId,
        targetKind === 'subMachine' ? targetId : ''
      );
      applyChange(() => newData);
      if (transitionId) {
        setSelection({
          kind: 'transition',
          sourceStateId,
          transitionId,
        });
      }
    },
    [applyChange]
  );

  const handleDeleteState = React.useCallback(
    (stateId: string) => {
      applyChange(data => deleteState(data, stateId));
      if (
        selection &&
        (selection.kind === 'state'
          ? selection.stateId === stateId
          : selection.kind === 'transition'
          ? selection.sourceStateId === stateId
          : false)
      ) {
        setSelection(null);
      }
    },
    [applyChange, selection]
  );

  const handleDeleteTransition = React.useCallback(
    (sourceStateId: string, transitionId: string) => {
      applyChange(data => deleteTransition(data, sourceStateId, transitionId));
      if (
        selection &&
        selection.kind === 'transition' &&
        selection.transitionId === transitionId
      ) {
        setSelection(null);
      }
    },
    [applyChange, selection]
  );

  const handleUpdateState = React.useCallback(
    (stateId: string, changes: Object) => {
      if (changes.name !== undefined) {
        const existingState = getStateByName(dataRef.current, changes.name);
        if (existingState && existingState.id !== stateId) return;
      }
      applyChange(data => updateState(data, stateId, changes));
    },
    [applyChange]
  );

  const handleUpdateSubMachine = React.useCallback(
    (subMachineId: string, changes: Object) => {
      applyChange(data => updateSubMachine(data, subMachineId, changes));
    },
    [applyChange]
  );

  const handleDeleteSubMachine = React.useCallback(
    (subMachineId: string, deleteStates: boolean) => {
      const shouldClearSelection =
        !!selection &&
        ((selection.kind === 'subMachine' &&
          selection.subMachineId === subMachineId) ||
          (selection.kind === 'state' &&
            (() => {
              const state = getState(dataRef.current, selection.stateId);
              return (
                !state || (deleteStates && state.subMachineId === subMachineId)
              );
            })()));
      applyChange(data => deleteSubMachine(data, subMachineId, deleteStates));
      if (shouldClearSelection) setSelection(null);
    },
    [applyChange, selection]
  );

  const handleMoveStateToSubMachine = React.useCallback(
    (stateId: string, subMachineId: string) => {
      applyChange(data => moveStateToSubMachine(data, stateId, subMachineId));
    },
    [applyChange]
  );

  const handleSetSubMachineEntryState = React.useCallback(
    (subMachineId: string, stateId: string) => {
      applyChange(data => setSubMachineEntryState(data, subMachineId, stateId));
    },
    [applyChange]
  );

  const handleSetEntryState = React.useCallback(
    (stateId: string) => {
      const state = getState(dataRef.current, stateId);
      if (state && state.subMachineId) {
        // The entry of a sub-state machine is set on the machine itself.
        handleSetSubMachineEntryState(state.subMachineId, stateId);
        return;
      }
      applyChange(data => setEntryState(data, stateId));
    },
    [applyChange, handleSetSubMachineEntryState]
  );

  const handleUpdateTransition = React.useCallback(
    (sourceStateId: string, transitionId: string, changes: Object) => {
      applyChange(data =>
        updateTransition(data, sourceStateId, transitionId, changes)
      );
    },
    [applyChange]
  );

  const handleToggleBlendTree = React.useCallback(
    (stateId: string, enabled: boolean) => {
      applyChange(data => {
        const state = getState(data, stateId);
        if (!state) return data;
        if (enabled) {
          const numberParameter = data.parameters.find(
            parameter => parameter.type === 'number'
          );
          const blendTree = createBlendTree(
            numberParameter ? numberParameter.name : ''
          );
          const firstAnimation = state.animationName || animationNames[0] || '';
          blendTree.children.push(createBlendTreeChild(firstAnimation, 0));
          const secondAnimation = animationNames.find(
            name => name !== firstAnimation
          );
          if (secondAnimation) {
            blendTree.children.push(createBlendTreeChild(secondAnimation, 1));
          }
          return updateState(data, stateId, { blendTree });
        }
        const firstChild = state.blendTree && state.blendTree.children[0];
        return updateState(data, stateId, {
          blendTree: null,
          animationName: firstChild
            ? firstChild.animationName
            : state.animationName,
        });
      });
    },
    [applyChange, animationNames]
  );

  const handleUpdateBlendTree = React.useCallback(
    (stateId: string, changes: Object) => {
      applyChange(data => {
        const state = getState(data, stateId);
        if (!state || !state.blendTree) return data;
        return updateState(data, stateId, {
          blendTree: { ...state.blendTree, ...changes },
        });
      });
    },
    [applyChange]
  );

  const handleAddBlendTreeChild = React.useCallback(
    (stateId: string) => {
      applyChange(data => {
        const state = getState(data, stateId);
        if (!state || !state.blendTree) return data;
        const children = state.blendTree.children.slice();
        const maxThreshold = children.reduce(
          (max, child) => Math.max(max, child.threshold),
          -Infinity
        );
        const threshold = children.length ? maxThreshold + 1 : 0;
        const unusedAnimation =
          animationNames.find(
            name => !children.some(child => child.animationName === name)
          ) ||
          animationNames[0] ||
          '';
        children.push(createBlendTreeChild(unusedAnimation, threshold));
        return updateState(data, stateId, {
          blendTree: { ...state.blendTree, children },
        });
      });
    },
    [applyChange, animationNames]
  );

  const handleUpdateBlendTreeChild = React.useCallback(
    (stateId: string, childIndex: number, changes: Object) => {
      applyChange(data => {
        const state = getState(data, stateId);
        if (!state || !state.blendTree) return data;
        const children = state.blendTree.children.map((child, index) =>
          index === childIndex ? { ...child, ...changes } : child
        );
        return updateState(data, stateId, {
          blendTree: { ...state.blendTree, children },
        });
      });
    },
    [applyChange]
  );

  const handleDeleteBlendTreeChild = React.useCallback(
    (stateId: string, childIndex: number) => {
      applyChange(data => {
        const state = getState(data, stateId);
        if (!state || !state.blendTree) return data;
        const children = state.blendTree.children.filter(
          (child, index) => index !== childIndex
        );
        return updateState(data, stateId, {
          blendTree: { ...state.blendTree, children },
        });
      });
    },
    [applyChange]
  );

  const handleAddCondition = React.useCallback(
    (sourceStateId: string, transitionId: string) => {
      const parameters = dataRef.current.parameters;
      if (!parameters.length) return;
      const parameter = parameters[0];
      applyChange(data =>
        addCondition(data, sourceStateId, transitionId, {
          parameterName: parameter.name,
          operator: getOperatorsForParameterType(parameter.type)[0].value,
          value: 0,
        })
      );
    },
    [applyChange]
  );

  const handleUpdateCondition = React.useCallback(
    (
      sourceStateId: string,
      transitionId: string,
      conditionIndex: number,
      changes: $Shape<Condition>
    ) => {
      applyChange(data =>
        updateCondition(
          data,
          sourceStateId,
          transitionId,
          conditionIndex,
          changes
        )
      );
    },
    [applyChange]
  );

  const handleDeleteCondition = React.useCallback(
    (sourceStateId: string, transitionId: string, conditionIndex: number) => {
      applyChange(data =>
        deleteCondition(data, sourceStateId, transitionId, conditionIndex)
      );
    },
    [applyChange]
  );

  const handleToggleTransitionExitTime = React.useCallback(
    (sourceStateId: string, transitionId: string) => {
      applyChange(data => {
        const transitions =
          sourceStateId === anyStateId
            ? data.anyState.transitions
            : (getState(data, sourceStateId) || { transitions: [] })
                .transitions;
        const transition = transitions.find(
          candidate => candidate.id === transitionId
        );
        return transition
          ? updateTransition(data, sourceStateId, transitionId, {
              hasExitTime: !transition.hasExitTime,
            })
          : data;
      });
    },
    [applyChange]
  );

  const handleAddParameter = React.useCallback(
    (type: ParameterType) => {
      const baseNames = {
        number: 'Number parameter',
        boolean: 'Boolean parameter',
        trigger: 'Trigger parameter',
      };
      applyChange(data =>
        addParameterToData(data, createParameter(baseNames[type], type))
      );
    },
    [applyChange]
  );

  const handleRenameParameter = React.useCallback(
    (oldName: string, newName: string) => {
      const existingParameter = dataRef.current.parameters.find(
        parameter => parameter.name === newName
      );
      if (existingParameter) return;
      applyChange(data => renameParameter(data, oldName, newName));
    },
    [applyChange]
  );

  const handleUpdateParameter = React.useCallback(
    (parameterName: string, changes: Object) => {
      applyChange(data => updateParameter(data, parameterName, changes));
    },
    [applyChange]
  );

  const handleDeleteParameter = React.useCallback(
    (parameterName: string) => {
      applyChange(data => deleteParameter(data, parameterName));
    },
    [applyChange]
  );

  // Delete the selected state/transition with the Delete or Backspace keys.
  React.useEffect(
    () => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Delete' && event.key !== 'Backspace') return;
        const target = event.target;
        if (
          target instanceof HTMLElement &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)
        ) {
          return;
        }
        if (!selection) return;
        event.preventDefault();
        if (selection.kind === 'state') {
          handleDeleteState(selection.stateId);
        } else if (selection.kind === 'transition') {
          handleDeleteTransition(
            selection.sourceStateId,
            selection.transitionId
          );
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    },
    [selection, handleDeleteState, handleDeleteTransition]
  );

  return (
    <div style={styles.editorContainer}>
      <div
        style={{
          ...styles.parametersContainer,
          borderRightColor: gdevelopTheme.toolbar.separatorColor,
        }}
      >
        <StateMachineParameters
          parameters={data.parameters}
          onAddParameter={handleAddParameter}
          onRenameParameter={handleRenameParameter}
          onUpdateParameter={handleUpdateParameter}
          onDeleteParameter={handleDeleteParameter}
        />
      </div>
      <div style={styles.centerContainer}>
        <div
          style={{
            ...styles.toolbar,
            backgroundColor: gdevelopTheme.toolbar.backgroundColor,
            borderBottomColor: gdevelopTheme.toolbar.separatorColor,
          }}
        >
          <div
            style={{
              ...styles.layerChip,
              backgroundColor: gdevelopTheme.dialog.backgroundColor,
              color: gdevelopTheme.text.color.secondary,
            }}
          >
            <Trans>Base Layer</Trans>
          </div>
          <FlatButton
            label={<Trans>Add a state</Trans>}
            onClick={handleAddStateAtViewCenter}
            leftIcon={<Add />}
          />
          <FlatButton
            label={<Trans>Add a sub-state machine</Trans>}
            onClick={() => {
              const graph = graphRef.current;
              const center = graph
                ? graph.getGraphCenter()
                : { x: 100, y: 100 };
              handleAddSubMachine(center.x - 110, center.y - 55);
            }}
          />
          <Text size="body-small" color="secondary" noMargin>
            <Trans>
              Drag from the port of a state to another one to create a
              transition.
            </Trans>
          </Text>
          <div style={styles.validationContainer}>
            {validationWarnings.length > 0 ? (
              <FlatButton
                label={
                  validationErrorCount > 0 ? (
                    <Trans>⛔ {validationWarnings.length} issues</Trans>
                  ) : (
                    <Trans>⚠️ {validationWarnings.length} warnings</Trans>
                  )
                }
                color={validationErrorCount > 0 ? 'danger' : 'premium'}
                onClick={() => setValidationOpen(open => !open)}
              />
            ) : null}
            {isValidationOpen && validationWarnings.length > 0 ? (
              <>
                <div
                  style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9,
                  }}
                  onClick={() => setValidationOpen(false)}
                />
                <div
                  style={{
                    ...styles.validationPanel,
                    backgroundColor: gdevelopTheme.dialog.backgroundColor,
                    borderColor: gdevelopTheme.toolbar.separatorColor,
                  }}
                >
                  {validationWarnings.map((warning, index) => (
                    <div
                      key={index}
                      style={styles.validationRow}
                      onClick={() => {
                        setSelection(getWarningSelection(warning));
                        setValidationOpen(false);
                      }}
                    >
                      <Text
                        size="body"
                        noMargin
                        color={
                          warning.severity === 'error' ? 'error' : 'secondary'
                        }
                      >
                        {renderWarningMessage(warning)}
                      </Text>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
        <StateMachineGraph
          ref={graphRef}
          data={data}
          selection={selection}
          onSelect={setSelection}
          onMoveState={handleMoveState}
          onMoveSubMachine={handleMoveSubMachine}
          onCreateTransition={handleCreateTransition}
          onAddState={handleAddState}
          onAddSubMachine={handleAddSubMachine}
          onDuplicateState={handleDuplicateState}
          onDeleteState={handleDeleteState}
          onDeleteTransition={handleDeleteTransition}
          onSetEntryState={handleSetEntryState}
          onSetSubMachineEntryState={handleSetSubMachineEntryState}
          onMoveStateToSubMachine={handleMoveStateToSubMachine}
          onRenameState={handleRenameState}
          onRenameSubMachine={handleRenameSubMachine}
          onDeleteSubMachine={handleDeleteSubMachine}
          onToggleTransitionExitTime={handleToggleTransitionExitTime}
        />
      </div>
      <div style={styles.rightContainer}>
        <div style={styles.inspectorContainer}>
          <StateMachineInspector
            data={data}
            selection={selection}
            animationNames={animationNames}
            onUpdateState={handleUpdateState}
            onUpdateTransition={handleUpdateTransition}
            onAddCondition={handleAddCondition}
            onUpdateCondition={handleUpdateCondition}
            onDeleteCondition={handleDeleteCondition}
            onSetEntryState={handleSetEntryState}
            onSetSubMachineEntryState={handleSetSubMachineEntryState}
            onMoveStateToSubMachine={handleMoveStateToSubMachine}
            onToggleBlendTree={handleToggleBlendTree}
            onUpdateBlendTree={handleUpdateBlendTree}
            onAddBlendTreeChild={handleAddBlendTreeChild}
            onUpdateBlendTreeChild={handleUpdateBlendTreeChild}
            onDeleteBlendTreeChild={handleDeleteBlendTreeChild}
            onUpdateSubMachine={handleUpdateSubMachine}
            onDeleteSubMachine={handleDeleteSubMachine}
            onDeleteState={handleDeleteState}
            onDeleteTransition={handleDeleteTransition}
          />
        </div>
      </div>
    </div>
  );
};

type TabProps = {|
  object: gdObject,
  project: gdProject,
  onUpdated: () => void,
|};

const findStateMachineBehaviorName = (object: gdObject): ?string => {
  const behaviors = getStateMachineBehaviors(object);
  return behaviors.length > 0 ? behaviors[0].getName() : null;
};

const getUniqueBehaviorName = (object: gdObject, baseName: string): string => {
  if (!object.hasBehaviorNamed(baseName)) return baseName;
  for (let index = 2; index < 1000; index++) {
    const name = `${baseName} ${index}`;
    if (!object.hasBehaviorNamed(name)) return name;
  }
  return `${baseName} ${Date.now()}`;
};

/**
 * The content of the "State Machine" tab of the object editor: it ensures
 * the AnimationStateMachine behavior is added to the object and displays the
 * state machine editor.
 */
export const AnimationStateMachineTab = ({
  object,
  project,
  onUpdated,
}: TabProps): React.Node => {
  const forceUpdate = useForceUpdate();
  const behaviorName = findStateMachineBehaviorName(object);

  const enableStateMachine = React.useCallback(
    () => {
      const newBehaviorName = getUniqueBehaviorName(object, 'StateMachine');
      const behavior = object.addNewBehavior(
        project,
        stateMachineBehaviorType,
        newBehaviorName
      );
      // Create a first state, so the machine is usable right away.
      const animationNames = getAnimationNames(object.getConfiguration());
      const state = createState('Idle', animationNames[0] || '', 140, 120);
      const data = addState(parseStateMachineData(''), state);
      behavior.updateProperty(
        'stateMachineData',
        serializeStateMachineData(data)
      );
      onUpdated();
      forceUpdate();
    },
    [object, project, onUpdated, forceUpdate]
  );

  if (!behaviorName) {
    return (
      <div style={styles.emptyContainer}>
        <Text size="title" noMargin>
          <Trans>Animation State Machine</Trans>
        </Text>
        <Text size="body" color="secondary" noMargin align="center">
          <Trans>
            Drive the animations of this object with a state machine: create
            states linked to animations and transitions between them, triggered
            by parameters changed from the events sheet - just like Unity's
            Animator.
          </Trans>
        </Text>
        <RaisedButton
          primary
          label={<Trans>Enable the animation state machine</Trans>}
          onClick={enableStateMachine}
          icon={<Add />}
        />
      </div>
    );
  }

  return (
    <AnimationStateMachineEditor
      object={object}
      project={project}
      behavior={object.getBehavior(behaviorName)}
      onUpdated={onUpdated}
    />
  );
};

export default AnimationStateMachineEditor;
