// @flow

/**
 * Data model and helpers for the animation state machine editor.
 *
 * The state machine definition is serialized as JSON in the (hidden)
 * "stateMachineData" property of the AnimationStateMachine behavior - the
 * exact same schema is read at runtime by the behavior
 * (see Extensions/AnimationStateMachine/statemachinelogic.ts).
 */

export type ParameterType = 'number' | 'boolean' | 'trigger';

export type Parameter = {|
  name: string,
  type: ParameterType,
  defaultValue: number | boolean,
|};

export type ConditionOperator =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'isTrue'
  | 'isFalse'
  | 'isSet';

export type Condition = {|
  parameterName: string,
  operator: ConditionOperator,
  value: number,
|};

export type InterruptionSource =
  | 'none'
  | 'current'
  | 'next'
  | 'currentThenNext';

export type Transition = {|
  id: string,
  /**
   * The id of the target state. Can be empty when the transition targets a
   * sub-state machine (`targetSubMachineId`): the target is then the entry
   * state of the sub-state machine.
   */
  targetStateId: string,
  targetSubMachineId: string,
  hasExitTime: boolean,
  exitTime: number,
  interruptionSource: InterruptionSource,
  /** False to forbid the transition to fire when already in the target state. */
  canTransitionToSelf: boolean,
  conditions: Array<Condition>,
|};

/** One animation of a blend tree, with its position on the blend axis. */
export type BlendTreeChild = {|
  animationName: string,
  /** The value of the blend parameter where this animation is played. */
  threshold: number,
  /** The playback speed of this animation. */
  speed: number,
|};

/**
 * A 1D blend tree: the animations are chosen (and their speed blended) from
 * the value of a number parameter.
 */
export type BlendTree = {|
  parameterName: string,
  children: Array<BlendTreeChild>,
|};

/** The animation chosen by a blend tree for a given value. */
export type BlendTreeSelection = {|
  animationName: string,
  speed: number,
  childIndex: number,
|};

export type State = {|
  id: string,
  name: string,
  animationName: string,
  speed: number,
  restartAnimationOnEnter: boolean,
  x: number,
  y: number,
  /** The id of the containing sub-state machine (empty at the root). */
  subMachineId: string,
  /**
   * When set, the state plays the animations of this blend tree instead of a
   * single animation: the animation (and its speed) is chosen from the value
   * of the blend parameter.
   */
  blendTree: BlendTree | null,
  transitions: Array<Transition>,
|};

/**
 * A sub-state machine: a group of states with its own entry state. A
 * transition can target the sub-state machine itself: it will enter its
 * entry state.
 */
export type SubMachine = {|
  id: string,
  name: string,
  x: number,
  y: number,
  entryStateId: string,
|};

/**
 * The "Any State" pseudo-state: its transitions are checked before the ones
 * of the current state and can fire from any state.
 */
export type AnyState = {|
  x: number,
  y: number,
  transitions: Array<Transition>,
|};

export type StateMachineData = {|
  parameters: Array<Parameter>,
  states: Array<State>,
  subMachines: Array<SubMachine>,
  anyState: AnyState,
  entryStateId: string,
|};

export type StateMachineSelection =
  | {| kind: 'state', stateId: string |}
  | {| kind: 'transition', sourceStateId: string, transitionId: string |}
  | {| kind: 'subMachine', subMachineId: string |}
  | {| kind: 'anyState' |}
  | null;

export const stateMachineBehaviorType =
  'AnimationStateMachine::AnimationStateMachineBehavior';

/** The special source id used by the "Any State" pseudo-state. */
export const anyStateId = '__any-state__';

// Size of the state nodes in the graph (in graph coordinates).
export const stateNodeWidth = 150;
export const stateNodeHeight = 46;
export const entryNodeWidth = 78;
export const entryNodeHeight = 32;
export const anyStateNodeWidth = 120;
export const anyStateNodeHeight = 38;
// Minimum size of a sub-state machine box.
export const subMachineMinWidth = 220;
export const subMachineMinHeight = 110;
export const subMachinePadding = 20;
export const subMachineHeaderHeight = 30;

const generateUuid = (): string =>
  Date.now().toString(36) +
  '-' +
  Math.random()
    .toString(36)
    .slice(2, 9);

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * A deep copy of the data, to make edits safe (the data is small).
 */
const cloneData = (data: StateMachineData): StateMachineData =>
  JSON.parse(JSON.stringify(data));

export const createEmptyStateMachine = (): StateMachineData => ({
  parameters: [],
  states: [],
  subMachines: [],
  anyState: { x: 40, y: 40, transitions: [] },
  entryStateId: '',
});

export const createState = (
  name: string,
  animationName: string,
  x: number,
  y: number
): State => ({
  id: generateUuid(),
  name,
  animationName,
  speed: 1,
  restartAnimationOnEnter: true,
  x,
  y,
  subMachineId: '',
  blendTree: null,
  transitions: [],
});

export const createBlendTree = (parameterName: string): BlendTree => ({
  parameterName,
  children: [],
});

export const createBlendTreeChild = (
  animationName: string,
  threshold: number
): BlendTreeChild => ({
  animationName,
  threshold,
  speed: 1,
});

/**
 * Choose the animation (and the playback speed) of a blend tree for a given
 * value of the blend parameter: the animation of the closest threshold is
 * played, with a playback speed blended between the two neighbors.
 */
export const getBlendTreeSelection = (
  blendTree: BlendTree,
  value: number
): BlendTreeSelection => {
  const children = blendTree.children;
  if (children.length === 0) {
    return { animationName: '', speed: 1, childIndex: -1 };
  }
  if (children.length === 1) {
    return {
      animationName: children[0].animationName,
      speed: children[0].speed,
      childIndex: 0,
    };
  }
  const sorted = children
    .map((child, index) => ({ child, index }))
    .sort((a, b) => a.child.threshold - b.child.threshold);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (value <= first.child.threshold) {
    return {
      animationName: first.child.animationName,
      speed: first.child.speed,
      childIndex: first.index,
    };
  }
  if (value >= last.child.threshold) {
    return {
      animationName: last.child.animationName,
      speed: last.child.speed,
      childIndex: last.index,
    };
  }
  for (let index = 0; index < sorted.length - 1; index++) {
    const lower = sorted[index];
    const upper = sorted[index + 1];
    if (value >= lower.child.threshold && value <= upper.child.threshold) {
      const range = upper.child.threshold - lower.child.threshold;
      const factor = range > 0 ? (value - lower.child.threshold) / range : 0;
      const chosen = factor < 0.5 ? lower : upper;
      return {
        animationName: chosen.child.animationName,
        speed:
          lower.child.speed + (upper.child.speed - lower.child.speed) * factor,
        childIndex: chosen.index,
      };
    }
  }
  return {
    animationName: last.child.animationName,
    speed: last.child.speed,
    childIndex: last.index,
  };
};

export const createTransition = (
  targetStateId: string,
  targetSubMachineId: string = ''
): Transition => ({
  id: generateUuid(),
  targetStateId,
  targetSubMachineId,
  hasExitTime: false,
  exitTime: 1,
  interruptionSource: 'none',
  canTransitionToSelf: true,
  conditions: [],
});

export const createSubMachine = (
  name: string,
  x: number,
  y: number
): SubMachine => ({
  id: generateUuid(),
  name,
  x,
  y,
  entryStateId: '',
});

export const createParameter = (
  name: string,
  type: ParameterType
): Parameter => ({
  name,
  type,
  defaultValue: type === 'number' ? 0 : false,
});

export const getState = (data: StateMachineData, stateId: string): ?State =>
  data.states.find(state => state.id === stateId) || null;

export const getStateByName = (
  data: StateMachineData,
  stateName: string
): ?State => data.states.find(state => state.name === stateName) || null;

export const getEntryState = (data: StateMachineData): ?State =>
  getState(data, data.entryStateId);

export const getSubMachine = (
  data: StateMachineData,
  subMachineId: string
): ?SubMachine =>
  data.subMachines.find(subMachine => subMachine.id === subMachineId) || null;

export const getStatesOfSubMachine = (
  data: StateMachineData,
  subMachineId: string
): Array<State> =>
  data.states.filter(state => state.subMachineId === subMachineId);

export const getSubMachineOfState = (
  data: StateMachineData,
  state: State
): ?SubMachine =>
  state.subMachineId ? getSubMachine(data, state.subMachineId) : null;

/**
 * The list of transitions of a transition source: the given state, or the
 * "Any State" pseudo-state.
 */
export const getTransitionsOfSource = (
  data: StateMachineData,
  sourceStateId: string
): ?Array<Transition> => {
  if (sourceStateId === anyStateId) return data.anyState.transitions;
  const state = getState(data, sourceStateId);
  return state ? state.transitions : null;
};

export const getSelectedState = (
  data: StateMachineData,
  selection: StateMachineSelection
): ?State => {
  if (!selection || selection.kind !== 'state') return null;
  return getState(data, selection.stateId);
};

export const getSelectedTransition = (
  data: StateMachineData,
  selection: StateMachineSelection
): ?Transition => {
  if (!selection || selection.kind !== 'transition') return null;
  const transitions = getTransitionsOfSource(data, selection.sourceStateId);
  if (!transitions) return null;
  return (
    transitions.find(transition => transition.id === selection.transitionId) ||
    null
  );
};

export const getSelectedSubMachine = (
  data: StateMachineData,
  selection: StateMachineSelection
): ?SubMachine => {
  if (!selection || selection.kind !== 'subMachine') return null;
  return getSubMachine(data, selection.subMachineId);
};

export const getUniqueStateName = (
  data: StateMachineData,
  baseName: string
): string => {
  if (!getStateByName(data, baseName)) return baseName;
  for (let index = 2; index < 1000; index++) {
    const name = `${baseName} ${index}`;
    if (!getStateByName(data, name)) return name;
  }
  return `${baseName} ${generateUuid()}`;
};

export const getUniqueSubMachineName = (
  data: StateMachineData,
  baseName: string
): string => {
  const isTaken = (name: string) =>
    data.subMachines.some(subMachine => subMachine.name === name);
  if (!isTaken(baseName)) return baseName;
  for (let index = 2; index < 1000; index++) {
    const name = `${baseName} ${index}`;
    if (!isTaken(name)) return name;
  }
  return `${baseName} ${generateUuid()}`;
};

export const getUniqueParameterName = (
  parameters: Array<Parameter>,
  baseName: string
): string => {
  const isTaken = (name: string) =>
    parameters.some(parameter => parameter.name === name);
  if (!isTaken(baseName)) return baseName;
  for (let index = 2; index < 1000; index++) {
    const name = `${baseName} ${index}`;
    if (!isTaken(name)) return name;
  }
  return `${baseName} ${generateUuid()}`;
};

export const addState = (
  data: StateMachineData,
  state: State
): StateMachineData => {
  const newData = cloneData(data);
  state.name = getUniqueStateName(newData, state.name);
  newData.states.push(state);
  if (!newData.entryStateId) newData.entryStateId = state.id;
  return newData;
};

export const deleteState = (
  data: StateMachineData,
  stateId: string
): StateMachineData => {
  const newData = cloneData(data);
  newData.states = newData.states.filter(state => state.id !== stateId);
  for (const state of newData.states) {
    state.transitions = state.transitions.filter(
      transition => transition.targetStateId !== stateId
    );
  }
  newData.anyState.transitions = newData.anyState.transitions.filter(
    transition => transition.targetStateId !== stateId
  );
  // Keep the sub-state machine entries valid.
  for (const subMachine of newData.subMachines) {
    if (subMachine.entryStateId === stateId) {
      const firstChild = newData.states.find(
        state => state.subMachineId === subMachine.id
      );
      subMachine.entryStateId = firstChild ? firstChild.id : '';
    }
  }
  if (newData.entryStateId === stateId) {
    const firstRootState = newData.states.find(state => !state.subMachineId);
    newData.entryStateId = firstRootState ? firstRootState.id : '';
  }
  // Transitions targeting the sub-state machine of the deleted state must
  // stay valid: nothing to do, they target the machine entry (fixed above).
  return newData;
};

export const updateState = (
  data: StateMachineData,
  stateId: string,
  changes: $Shape<State>
): StateMachineData => {
  const newData = cloneData(data);
  const state = newData.states.find(candidate => candidate.id === stateId);
  if (state) Object.assign(state, changes);
  return newData;
};

export const setEntryState = (
  data: StateMachineData,
  stateId: string
): StateMachineData => {
  const newData = cloneData(data);
  newData.entryStateId = stateId;
  return newData;
};

export const addSubMachineToData = (
  data: StateMachineData,
  subMachine: SubMachine
): StateMachineData => {
  const newData = cloneData(data);
  subMachine.name = getUniqueSubMachineName(newData, subMachine.name);
  newData.subMachines.push(subMachine);
  return newData;
};

export const updateSubMachine = (
  data: StateMachineData,
  subMachineId: string,
  changes: $Shape<SubMachine>
): StateMachineData => {
  const newData = cloneData(data);
  const subMachine = newData.subMachines.find(
    candidate => candidate.id === subMachineId
  );
  if (subMachine) Object.assign(subMachine, changes);
  return newData;
};

/**
 * Move a state into a sub-state machine (or to the root with '').
 */
export const moveStateToSubMachine = (
  data: StateMachineData,
  stateId: string,
  subMachineId: string
): StateMachineData => {
  let newData = cloneData(data);
  const state = newData.states.find(candidate => candidate.id === stateId);
  if (!state) return newData;
  const previousSubMachineId = state.subMachineId;
  state.subMachineId = subMachineId;
  // Keep the entries valid.
  for (const subMachine of newData.subMachines) {
    if (
      subMachine.id === previousSubMachineId &&
      subMachine.entryStateId === stateId
    ) {
      const firstChild = newData.states.find(
        candidate => candidate.subMachineId === subMachine.id
      );
      subMachine.entryStateId = firstChild ? firstChild.id : '';
    }
  }
  const targetSubMachine = getSubMachine(newData, subMachineId);
  if (targetSubMachine && !targetSubMachine.entryStateId) {
    targetSubMachine.entryStateId = stateId;
    newData = syncSubMachineEntryTransitions(newData, subMachineId, stateId);
  }
  return newData;
};

/**
 * Set the entry state of a sub-state machine and update the transitions
 * targeting this sub-state machine.
 */
export const setSubMachineEntryState = (
  data: StateMachineData,
  subMachineId: string,
  stateId: string
): StateMachineData => {
  let newData = cloneData(data);
  const subMachine = newData.subMachines.find(
    candidate => candidate.id === subMachineId
  );
  if (!subMachine) return newData;
  const state = newData.states.find(candidate => candidate.id === stateId);
  if (!state || state.subMachineId !== subMachineId) return newData;
  subMachine.entryStateId = stateId;
  newData = syncSubMachineEntryTransitions(newData, subMachineId, stateId);
  return newData;
};

/**
 * Keep the target state of the transitions targeting a sub-state machine in
 * sync with its entry state.
 */
const syncSubMachineEntryTransitions = (
  data: StateMachineData,
  subMachineId: string,
  entryStateId: string
): StateMachineData => {
  const fixTransitions = (transitions: Array<Transition>) => {
    for (const transition of transitions) {
      if (transition.targetSubMachineId === subMachineId) {
        transition.targetStateId = entryStateId;
      }
    }
  };
  for (const state of data.states) fixTransitions(state.transitions);
  fixTransitions(data.anyState.transitions);
  return data;
};

/**
 * Delete a sub-state machine. Its states can either be moved to the root
 * (`deleteStates` false) or deleted with it (`deleteStates` true).
 */
export const deleteSubMachine = (
  data: StateMachineData,
  subMachineId: string,
  deleteStates: boolean
): StateMachineData => {
  let newData = cloneData(data);
  // Keep the entry state before the children are moved or deleted.
  const subMachine = getSubMachine(newData, subMachineId);
  const entryStateId = subMachine ? subMachine.entryStateId : '';
  for (const state of getStatesOfSubMachine(newData, subMachineId)) {
    if (deleteStates) {
      newData = deleteState(newData, state.id);
    } else {
      newData = moveStateToSubMachine(newData, state.id, '');
    }
  }
  newData.subMachines = newData.subMachines.filter(
    candidate => candidate.id !== subMachineId
  );
  if (deleteStates) {
    // The transitions targeting the machine are removed with its states.
    newData.anyState.transitions = newData.anyState.transitions.filter(
      transition => transition.targetSubMachineId !== subMachineId
    );
    for (const state of newData.states) {
      state.transitions = state.transitions.filter(
        transition => transition.targetSubMachineId !== subMachineId
      );
    }
  } else {
    // Keep the transitions: they now directly target the old entry state.
    const fixTransitions = (transitions: Array<Transition>) => {
      for (const transition of transitions) {
        if (transition.targetSubMachineId === subMachineId) {
          transition.targetSubMachineId = '';
          transition.targetStateId = entryStateId;
        }
      }
    };
    for (const state of newData.states) fixTransitions(state.transitions);
    fixTransitions(newData.anyState.transitions);
    newData.anyState.transitions = newData.anyState.transitions.filter(
      transition => !!getState(newData, transition.targetStateId)
    );
    for (const state of newData.states) {
      state.transitions = state.transitions.filter(
        transition => !!getState(newData, transition.targetStateId)
      );
    }
  }
  return newData;
};

/**
 * Move a sub-state machine (and all its states) by a delta.
 */
export const moveSubMachine = (
  data: StateMachineData,
  subMachineId: string,
  deltaX: number,
  deltaY: number
): StateMachineData => {
  const newData = cloneData(data);
  const subMachine = newData.subMachines.find(
    candidate => candidate.id === subMachineId
  );
  if (!subMachine) return newData;
  subMachine.x += deltaX;
  subMachine.y += deltaY;
  for (const state of newData.states) {
    if (state.subMachineId === subMachineId) {
      state.x += deltaX;
      state.y += deltaY;
    }
  }
  return newData;
};

/**
 * Add a transition between two targets. The target is either a state id or
 * (with `targetSubMachineId`) a sub-state machine. Only one transition can
 * exist between a source and a given target: in this case, the existing
 * transition is returned.
 */
export const addTransition = (
  data: StateMachineData,
  sourceStateId: string,
  targetStateId: string,
  targetSubMachineId: string = ''
): {| data: StateMachineData, transitionId: string |} => {
  const newData = cloneData(data);
  const transitions = getTransitionsOfSource(newData, sourceStateId);
  if (!transitions) return { data: newData, transitionId: '' };
  const existingTransition = transitions.find(transition =>
    targetSubMachineId
      ? transition.targetSubMachineId === targetSubMachineId
      : !transition.targetSubMachineId &&
        transition.targetStateId === targetStateId
  );
  if (existingTransition) {
    return { data: newData, transitionId: existingTransition.id };
  }
  const transition = createTransition(
    targetSubMachineId && !targetStateId
      ? (getSubMachine(newData, targetSubMachineId) || { entryStateId: '' })
          .entryStateId
      : targetStateId,
    targetSubMachineId
  );
  if (sourceStateId === anyStateId) {
    // By default, an "Any State" transition doesn't restart the animation
    // when the machine is already in the target state.
    transition.canTransitionToSelf = false;
  }
  transitions.push(transition);
  return { data: newData, transitionId: transition.id };
};

const updateTransitionInData = (
  data: StateMachineData,
  sourceStateId: string,
  transitionId: string,
  changes: ?$Shape<Transition>,
  remove: boolean
): StateMachineData => {
  const newData = cloneData(data);
  const transitions = getTransitionsOfSource(newData, sourceStateId);
  if (!transitions) return newData;
  const transition = transitions.find(
    candidate => candidate.id === transitionId
  );
  if (!transition) return newData;
  if (remove) {
    const index = transitions.indexOf(transition);
    transitions.splice(index, 1);
  } else if (changes) {
    Object.assign(transition, changes);
  }
  return newData;
};

export const updateTransition = (
  data: StateMachineData,
  sourceStateId: string,
  transitionId: string,
  changes: $Shape<Transition>
): StateMachineData =>
  updateTransitionInData(data, sourceStateId, transitionId, changes, false);

export const deleteTransition = (
  data: StateMachineData,
  sourceStateId: string,
  transitionId: string
): StateMachineData =>
  updateTransitionInData(data, sourceStateId, transitionId, null, true);

export const addCondition = (
  data: StateMachineData,
  sourceStateId: string,
  transitionId: string,
  condition: Condition
): StateMachineData => {
  const newData = cloneData(data);
  const transitions = getTransitionsOfSource(newData, sourceStateId);
  const transition =
    transitions && transitions.find(candidate => candidate.id === transitionId);
  if (transition) transition.conditions.push(condition);
  return newData;
};

export const updateCondition = (
  data: StateMachineData,
  sourceStateId: string,
  transitionId: string,
  conditionIndex: number,
  changes: $Shape<Condition>
): StateMachineData => {
  const newData = cloneData(data);
  const transitions = getTransitionsOfSource(newData, sourceStateId);
  const transition =
    transitions && transitions.find(candidate => candidate.id === transitionId);
  if (transition && transition.conditions[conditionIndex]) {
    Object.assign(transition.conditions[conditionIndex], changes);
  }
  return newData;
};

export const deleteCondition = (
  data: StateMachineData,
  sourceStateId: string,
  transitionId: string,
  conditionIndex: number
): StateMachineData => {
  const newData = cloneData(data);
  const transitions = getTransitionsOfSource(newData, sourceStateId);
  const transition =
    transitions && transitions.find(candidate => candidate.id === transitionId);
  if (transition) {
    transition.conditions = transition.conditions.filter(
      (condition, index) => index !== conditionIndex
    );
  }
  return newData;
};

export const addParameterToData = (
  data: StateMachineData,
  parameter: Parameter
): StateMachineData => {
  const newData = cloneData(data);
  parameter.name = getUniqueParameterName(newData.parameters, parameter.name);
  newData.parameters.push(parameter);
  return newData;
};

export const updateParameter = (
  data: StateMachineData,
  parameterName: string,
  changes: $Shape<Parameter>
): StateMachineData => {
  const newData = cloneData(data);
  const parameter = newData.parameters.find(
    candidate => candidate.name === parameterName
  );
  if (parameter) Object.assign(parameter, changes);
  return newData;
};

export const deleteParameter = (
  data: StateMachineData,
  parameterName: string
): StateMachineData => {
  const newData = cloneData(data);
  newData.parameters = newData.parameters.filter(
    parameter => parameter.name !== parameterName
  );
  return newData;
};

/**
 * Rename a parameter and update the conditions using it.
 */
export const renameParameter = (
  data: StateMachineData,
  oldName: string,
  newName: string
): StateMachineData => {
  const newData = cloneData(data);
  const parameter = newData.parameters.find(
    candidate => candidate.name === oldName
  );
  if (!parameter) return newData;
  parameter.name = newName;
  for (const state of newData.states) {
    for (const transition of state.transitions) {
      for (const condition of transition.conditions) {
        if (condition.parameterName === oldName) {
          condition.parameterName = newName;
        }
      }
    }
  }
  for (const transition of newData.anyState.transitions) {
    for (const condition of transition.conditions) {
      if (condition.parameterName === oldName) {
        condition.parameterName = newName;
      }
    }
  }
  return newData;
};

export const getParameter = (
  data: StateMachineData,
  parameterName: string
): ?Parameter =>
  data.parameters.find(parameter => parameter.name === parameterName) || null;

export const getOperatorsForParameterType = (
  type: ParameterType
): Array<{| value: ConditionOperator, label: string |}> => {
  if (type === 'trigger') {
    return [{ value: 'isSet', label: 'is triggered' }];
  }
  if (type === 'boolean') {
    return [
      { value: 'isTrue', label: 'is true' },
      { value: 'isFalse', label: 'is false' },
    ];
  }
  return [
    { value: '==', label: '==' },
    { value: '!=', label: '!=' },
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
  ];
};

export const getConditionValueKind = (
  data: StateMachineData,
  condition: Condition
): 'number' | 'none' => {
  const parameter = getParameter(data, condition.parameterName);
  if (!parameter || parameter.type === 'number') return 'number';
  return 'none';
};

export const getConditionLabel = (
  data: StateMachineData,
  condition: Condition
): string => {
  const operatorLabels = {
    '==': '==',
    '!=': '!=',
    '>': '>',
    '>=': '>=',
    '<': '<',
    '<=': '<=',
    isTrue: 'is true',
    isFalse: 'is false',
    isSet: 'is triggered',
  };
  const valueLabel =
    getConditionValueKind(data, condition) === 'number'
      ? ` ${condition.value}`
      : '';
  return `${condition.parameterName} ${operatorLabels[condition.operator] ||
    condition.operator}${valueLabel}`;
};

export const interruptionSourceChoices: Array<{|
  value: InterruptionSource,
  label: string,
|}> = [
  { value: 'none', label: 'None' },
  { value: 'current', label: 'Current State' },
  { value: 'next', label: 'Next State' },
  { value: 'currentThenNext', label: 'Current State then Next State' },
];

/**
 * The label of the source of a transition ("Any State" or a state name).
 */
export const getTransitionSourceLabel = (
  data: StateMachineData,
  sourceStateId: string
): string => {
  if (sourceStateId === anyStateId) return 'Any State';
  const state = getState(data, sourceStateId);
  return state ? state.name : '?';
};

/**
 * The label of the target of a transition (a state or a sub-state machine).
 */
export const getTransitionTargetLabel = (
  data: StateMachineData,
  transition: Transition
): string => {
  if (transition.targetSubMachineId) {
    const subMachine = getSubMachine(data, transition.targetSubMachineId);
    return subMachine ? `▸ ${subMachine.name}` : '?';
  }
  const state = getState(data, transition.targetStateId);
  return state ? state.name : '?';
};

/**
 * The rect of a sub-state machine box in the graph: it always contains its
 * states (with some padding) and is at least as big as the minimum size.
 */
export const getSubMachineRect = (
  data: StateMachineData,
  subMachineId: string,
  getStatePosition?: (state: State) => {| x: number, y: number |}
): ?{| x: number, y: number, width: number, height: number |} => {
  const subMachine = getSubMachine(data, subMachineId);
  if (!subMachine) return null;
  let minX = subMachine.x;
  let minY = subMachine.y;
  let maxX = subMachine.x + subMachineMinWidth;
  let maxY = subMachine.y + subMachineMinHeight;
  for (const state of getStatesOfSubMachine(data, subMachineId)) {
    const position = getStatePosition
      ? getStatePosition(state)
      : { x: state.x, y: state.y };
    minX = Math.min(minX, position.x - subMachinePadding);
    minY = Math.min(
      minY,
      position.y - subMachinePadding - subMachineHeaderHeight
    );
    maxX = Math.max(maxX, position.x + stateNodeWidth + subMachinePadding);
    maxY = Math.max(maxY, position.y + stateNodeHeight + subMachinePadding);
  }
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * The names of the animations of the object (empty for objects without
 * animations).
 */
export const getAnimationNames = (
  objectConfiguration: ?gdObjectConfiguration
): Array<string> => {
  if (!objectConfiguration) return [];
  const names = [];
  const count = objectConfiguration.getAnimationsCount();
  for (let index = 0; index < count; index++) {
    names.push(objectConfiguration.getAnimationName(index));
  }
  return names;
};

const parseTransition = (
  rawTransition: any,
  getSubMachineById: (id: string) => ?SubMachine,
  stateIds: { [string]: boolean }
): ?Transition => {
  if (!rawTransition) return null;
  const targetSubMachineId =
    typeof rawTransition.targetSubMachineId === 'string'
      ? rawTransition.targetSubMachineId
      : '';
  const subMachine = targetSubMachineId
    ? getSubMachineById(targetSubMachineId)
    : null;
  if (targetSubMachineId && !subMachine) return null;
  // Resolve the target of transitions to a sub-state machine to its entry
  // state (so the runtime always plays the right animation).
  const targetStateId =
    typeof rawTransition.targetStateId === 'string' &&
    rawTransition.targetStateId
      ? rawTransition.targetStateId
      : subMachine
      ? subMachine.entryStateId
      : '';
  // Keep the transitions to sub-state machines even without entry state:
  // they can be fixed in the editor.
  if (!targetStateId && !subMachine) return null;
  if (targetStateId && !subMachine && !stateIds[targetStateId]) return null;

  const conditions: Array<Condition> = [];
  const rawConditions = Array.isArray(rawTransition.conditions)
    ? rawTransition.conditions
    : [];
  for (const rawCondition of rawConditions) {
    if (
      !rawCondition ||
      typeof rawCondition.parameterName !== 'string' ||
      typeof rawCondition.operator !== 'string'
    )
      continue;
    conditions.push({
      parameterName: rawCondition.parameterName,
      operator: rawCondition.operator,
      value: typeof rawCondition.value === 'number' ? rawCondition.value : 0,
    });
  }
  return {
    id:
      typeof rawTransition.id === 'string' ? rawTransition.id : generateUuid(),
    targetStateId,
    targetSubMachineId,
    hasExitTime: !!rawTransition.hasExitTime,
    exitTime:
      typeof rawTransition.exitTime === 'number' ? rawTransition.exitTime : 1,
    interruptionSource:
      rawTransition.interruptionSource === 'current' ||
      rawTransition.interruptionSource === 'next' ||
      rawTransition.interruptionSource === 'currentThenNext'
        ? rawTransition.interruptionSource
        : 'none',
    canTransitionToSelf:
      typeof rawTransition.canTransitionToSelf === 'boolean'
        ? rawTransition.canTransitionToSelf
        : true,
    conditions,
  };
};

/**
 * Parse the JSON stored in the behavior property, with a safe fallback to an
 * empty state machine.
 */
export const parseStateMachineData = (
  serializedData: ?string
): StateMachineData => {
  if (!serializedData) return createEmptyStateMachine();
  let raw = null;
  try {
    raw = JSON.parse(serializedData);
  } catch (error) {
    return createEmptyStateMachine();
  }
  if (!raw || typeof raw !== 'object') return createEmptyStateMachine();

  const parameters: Array<Parameter> = [];
  const rawParameters = Array.isArray(raw.parameters) ? raw.parameters : [];
  for (const rawParameter of rawParameters) {
    if (!rawParameter || typeof rawParameter.name !== 'string') continue;
    const type: ParameterType =
      rawParameter.type === 'boolean' || rawParameter.type === 'trigger'
        ? rawParameter.type
        : 'number';
    parameters.push({
      name: rawParameter.name,
      type,
      defaultValue:
        type === 'number'
          ? typeof rawParameter.defaultValue === 'number'
            ? rawParameter.defaultValue
            : 0
          : typeof rawParameter.defaultValue === 'boolean'
          ? rawParameter.defaultValue
          : false,
    });
  }

  const subMachines: Array<SubMachine> = [];
  const rawSubMachines = Array.isArray(raw.subMachines) ? raw.subMachines : [];
  for (const rawSubMachine of rawSubMachines) {
    if (!rawSubMachine || typeof rawSubMachine.name !== 'string') continue;
    subMachines.push({
      id:
        typeof rawSubMachine.id === 'string'
          ? rawSubMachine.id
          : generateUuid(),
      name: rawSubMachine.name,
      x: typeof rawSubMachine.x === 'number' ? rawSubMachine.x : 0,
      y: typeof rawSubMachine.y === 'number' ? rawSubMachine.y : 0,
      entryStateId:
        typeof rawSubMachine.entryStateId === 'string'
          ? rawSubMachine.entryStateId
          : '',
    });
  }
  const getSubMachineById = (id: string): ?SubMachine =>
    subMachines.find(subMachine => subMachine.id === id) || null;

  const states: Array<State> = [];
  const rawStates = Array.isArray(raw.states) ? raw.states : [];
  const stateIds = {};
  for (const rawState of rawStates) {
    if (rawState && typeof rawState.id === 'string') {
      stateIds[rawState.id] = true;
    }
  }
  const parseBlendTree = (rawBlendTree: any): BlendTree | null => {
    if (!rawBlendTree || typeof rawBlendTree !== 'object') return null;
    const children: Array<BlendTreeChild> = [];
    const rawChildren = Array.isArray(rawBlendTree.children)
      ? rawBlendTree.children
      : [];
    for (const rawChild of rawChildren) {
      if (!rawChild) continue;
      children.push({
        animationName:
          typeof rawChild.animationName === 'string'
            ? rawChild.animationName
            : '',
        threshold:
          typeof rawChild.threshold === 'number' ? rawChild.threshold : 0,
        speed: typeof rawChild.speed === 'number' ? rawChild.speed : 1,
      });
    }
    return {
      parameterName:
        typeof rawBlendTree.parameterName === 'string'
          ? rawBlendTree.parameterName
          : '',
      children,
    };
  };
  for (const rawState of rawStates) {
    if (!rawState || typeof rawState.name !== 'string') continue;
    const subMachineId =
      typeof rawState.subMachineId === 'string' &&
      getSubMachineById(rawState.subMachineId)
        ? rawState.subMachineId
        : '';
    states.push({
      id: typeof rawState.id === 'string' ? rawState.id : generateUuid(),
      name: rawState.name,
      animationName:
        typeof rawState.animationName === 'string'
          ? rawState.animationName
          : '',
      speed: typeof rawState.speed === 'number' ? rawState.speed : 1,
      restartAnimationOnEnter:
        typeof rawState.restartAnimationOnEnter === 'boolean'
          ? rawState.restartAnimationOnEnter
          : true,
      x: typeof rawState.x === 'number' ? rawState.x : 0,
      y: typeof rawState.y === 'number' ? rawState.y : 0,
      subMachineId,
      blendTree: parseBlendTree(rawState.blendTree),
      transitions: (Array.isArray(rawState.transitions)
        ? rawState.transitions
        : []
      )
        .map(rawTransition =>
          parseTransition(rawTransition, getSubMachineById, stateIds)
        )
        .filter(Boolean),
    });
  }

  // Parse the "Any State" pseudo-state.
  const rawAnyState =
    raw.anyState && typeof raw.anyState === 'object' ? raw.anyState : {};
  const anyState: AnyState = {
    x: typeof rawAnyState.x === 'number' ? rawAnyState.x : 40,
    y: typeof rawAnyState.y === 'number' ? rawAnyState.y : 40,
    transitions: (Array.isArray(rawAnyState.transitions)
      ? rawAnyState.transitions
      : []
    )
      .map(rawTransition =>
        parseTransition(rawTransition, getSubMachineById, stateIds)
      )
      .filter(Boolean),
  };

  // Keep the sub-state machine entries valid.
  for (const subMachine of subMachines) {
    const entryState = states.find(
      state => state.id === subMachine.entryStateId
    );
    if (!entryState || entryState.subMachineId !== subMachine.id) {
      const firstChild = states.find(
        state => state.subMachineId === subMachine.id
      );
      subMachine.entryStateId = firstChild ? firstChild.id : '';
    }
  }

  const entryStateId =
    typeof raw.entryStateId === 'string' && stateIds[raw.entryStateId]
      ? raw.entryStateId
      : states.length
      ? states[0].id
      : '';

  return { parameters, states, subMachines, anyState, entryStateId };
};

export const serializeStateMachineData = (data: StateMachineData): string =>
  JSON.stringify(data);

export const clampValue = clamp;

// ---------------------------------------------------------------------------
// Integration with the object animations
// ---------------------------------------------------------------------------

/**
 * The AnimationStateMachine behaviors of an object (usually at most one).
 */
export const getStateMachineBehaviors = (
  object: gdObject
): Array<gdBehavior> => {
  const behaviors = [];
  for (const behaviorName of object.getAllBehaviorNames().toJSArray()) {
    const behavior = object.getBehavior(behaviorName);
    if (behavior.getTypeName() === stateMachineBehaviorType) {
      behaviors.push(behavior);
    }
  }
  return behaviors;
};

/**
 * Update the animation names of the states when an animation of the object
 * is renamed. Returns the new serialized data (or the same one when nothing
 * was referencing the old name).
 */
export const renameAnimationNameInStateMachineData = (
  serializedData: string,
  oldName: string,
  newName: string
): {| serializedData: string, hasChanged: boolean |} => {
  const data = parseStateMachineData(serializedData);
  let hasChanged = false;
  for (const state of data.states) {
    if (state.animationName === oldName) {
      state.animationName = newName;
      hasChanged = true;
    }
    if (state.blendTree) {
      for (const child of state.blendTree.children) {
        if (child.animationName === oldName) {
          child.animationName = newName;
          hasChanged = true;
        }
      }
    }
  }
  return {
    serializedData: hasChanged
      ? serializeStateMachineData(data)
      : serializedData,
    hasChanged,
  };
};

/**
 * Update every state machine of the object when one of its animations is
 * renamed (so the machine keeps playing the right animations).
 */
export const renameAnimationNameInObjectStateMachines = (
  object: gdObject,
  oldName: string,
  newName: string
) => {
  for (const behavior of getStateMachineBehaviors(object)) {
    const serializedData = behavior
      .getProperties()
      .get('stateMachineData')
      .getValue();
    const result = renameAnimationNameInStateMachineData(
      serializedData,
      oldName,
      newName
    );
    if (result.hasChanged) {
      behavior.updateProperty('stateMachineData', result.serializedData);
    }
  }
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type ValidationWarning = {|
  severity: 'error' | 'warning',
  code:
    | 'no-states'
    | 'no-entry-state'
    | 'state-no-animation'
    | 'state-missing-animation'
    | 'duplicate-state-name'
    | 'condition-missing-parameter'
    | 'unreachable-state'
    | 'sub-machine-no-entry'
    | 'empty-sub-machine'
    | 'blend-tree-no-parameter'
    | 'blend-tree-missing-parameter'
    | 'blend-tree-empty'
    | 'blend-tree-missing-animation'
    | 'blend-tree-duplicate-threshold',
  /** The name of the relevant state/sub-state machine/animation/parameter. */
  name: string,
  /** A second name when needed (like the missing animation of a state). */
  extraName: string,
  stateId: string,
  subMachineId: string,
  sourceStateId: string,
  transitionId: string,
|};

const makeWarning = (
  severity: 'error' | 'warning',
  code: $PropertyType<ValidationWarning, 'code'>,
  fields: {|
    name?: string,
    extraName?: string,
    stateId?: string,
    subMachineId?: string,
    sourceStateId?: string,
    transitionId?: string,
  |}
): ValidationWarning => ({
  severity,
  code,
  name: fields.name || '',
  extraName: fields.extraName || '',
  stateId: fields.stateId || '',
  subMachineId: fields.subMachineId || '',
  sourceStateId: fields.sourceStateId || '',
  transitionId: fields.transitionId || '',
});

/**
 * Check a state machine for common mistakes (missing animations, unreachable
 * states, missing parameters...). `animationNames` is the list of animations
 * of the object (pass an empty array for objects without animations).
 */
export const getValidationWarnings = (
  data: StateMachineData,
  animationNames: Array<string>
): Array<ValidationWarning> => {
  const warnings: Array<ValidationWarning> = [];

  if (data.states.length === 0) {
    warnings.push(makeWarning('error', 'no-states', {}));
    return warnings;
  }

  if (!getState(data, data.entryStateId)) {
    warnings.push(makeWarning('error', 'no-entry-state', {}));
  }

  const stateNamesCount = {};
  for (const state of data.states) {
    stateNamesCount[state.name] = (stateNamesCount[state.name] || 0) + 1;
  }

  // The states that can be reached: the entry state, the entry states of the
  // sub-state machines and the targets of the transitions.
  const reachableStateIds = {};
  if (data.entryStateId) reachableStateIds[data.entryStateId] = true;
  for (const subMachine of data.subMachines) {
    if (subMachine.entryStateId)
      reachableStateIds[subMachine.entryStateId] = true;
  }
  const collectTargets = (transitions: Array<Transition>) => {
    for (const transition of transitions) {
      if (transition.targetStateId) {
        reachableStateIds[transition.targetStateId] = true;
      }
    }
  };
  for (const state of data.states) collectTargets(state.transitions);
  collectTargets(data.anyState.transitions);

  for (const state of data.states) {
    if (state.blendTree) {
      // Blend tree checks.
      const blendTree = state.blendTree;
      const parameter = getParameter(data, blendTree.parameterName);
      if (!blendTree.parameterName) {
        warnings.push(
          makeWarning('error', 'blend-tree-no-parameter', {
            name: state.name,
            stateId: state.id,
          })
        );
      } else if (!parameter || parameter.type !== 'number') {
        warnings.push(
          makeWarning('warning', 'blend-tree-missing-parameter', {
            name: blendTree.parameterName,
            extraName: state.name,
            stateId: state.id,
          })
        );
      }
      if (blendTree.children.length === 0) {
        warnings.push(
          makeWarning('warning', 'blend-tree-empty', {
            name: state.name,
            stateId: state.id,
          })
        );
      }
      const thresholdsCount = {};
      for (const child of blendTree.children) {
        const thresholdKey = String(child.threshold);
        thresholdsCount[thresholdKey] =
          (thresholdsCount[thresholdKey] || 0) + 1;
        if (
          animationNames.length > 0 &&
          child.animationName &&
          !animationNames.includes(child.animationName)
        ) {
          warnings.push(
            makeWarning('warning', 'blend-tree-missing-animation', {
              name: state.name,
              extraName: child.animationName,
              stateId: state.id,
            })
          );
        }
      }
      for (const thresholdKey of Object.keys(thresholdsCount)) {
        if (thresholdsCount[thresholdKey] > 1) {
          warnings.push(
            makeWarning('warning', 'blend-tree-duplicate-threshold', {
              name: state.name,
              extraName: thresholdKey,
              stateId: state.id,
            })
          );
        }
      }
    } else {
      if (!state.animationName) {
        warnings.push(
          makeWarning('warning', 'state-no-animation', {
            name: state.name,
            stateId: state.id,
          })
        );
      } else if (
        animationNames.length > 0 &&
        !animationNames.includes(state.animationName)
      ) {
        warnings.push(
          makeWarning('warning', 'state-missing-animation', {
            name: state.name,
            extraName: state.animationName,
            stateId: state.id,
          })
        );
      }
    }
    if (stateNamesCount[state.name] > 1) {
      warnings.push(
        makeWarning('error', 'duplicate-state-name', {
          name: state.name,
          stateId: state.id,
        })
      );
    }
    if (!reachableStateIds[state.id]) {
      warnings.push(
        makeWarning('warning', 'unreachable-state', {
          name: state.name,
          stateId: state.id,
        })
      );
    }
  }

  const checkConditions = (
    transitions: Array<Transition>,
    sourceStateId: string
  ) => {
    for (const transition of transitions) {
      for (const condition of transition.conditions) {
        if (!getParameter(data, condition.parameterName)) {
          warnings.push(
            makeWarning('warning', 'condition-missing-parameter', {
              name: condition.parameterName,
              sourceStateId,
              transitionId: transition.id,
            })
          );
        }
      }
    }
  };
  for (const state of data.states) {
    checkConditions(state.transitions, state.id);
  }
  checkConditions(data.anyState.transitions, anyStateId);

  for (const subMachine of data.subMachines) {
    if (getStatesOfSubMachine(data, subMachine.id).length === 0) {
      warnings.push(
        makeWarning('warning', 'empty-sub-machine', {
          name: subMachine.name,
          subMachineId: subMachine.id,
        })
      );
    } else if (!getState(data, subMachine.entryStateId)) {
      warnings.push(
        makeWarning('error', 'sub-machine-no-entry', {
          name: subMachine.name,
          subMachineId: subMachine.id,
        })
      );
    }
  }

  return warnings;
};

/**
 * The element to select in the graph when clicking on a validation warning.
 */
export const getWarningSelection = (
  warning: ValidationWarning
): StateMachineSelection => {
  if (warning.transitionId) {
    return {
      kind: 'transition',
      sourceStateId: warning.sourceStateId,
      transitionId: warning.transitionId,
    };
  }
  if (warning.stateId) {
    return { kind: 'state', stateId: warning.stateId };
  }
  if (warning.subMachineId) {
    return { kind: 'subMachine', subMachineId: warning.subMachineId };
  }
  return null;
};
