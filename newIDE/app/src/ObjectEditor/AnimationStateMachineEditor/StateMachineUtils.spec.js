import {
  anyStateId,
  createEmptyStateMachine,
  createState,
  createSubMachine,
  createParameter,
  addState,
  deleteState,
  addTransition,
  addSubMachineToData,
  moveStateToSubMachine,
  setSubMachineEntryState,
  deleteSubMachine,
  addParameterToData,
  renameParameter,
  createBlendTree,
  createBlendTreeChild,
  getBlendTreeSelection,
  renameAnimationNameInStateMachineData,
  getValidationWarnings,
  parseStateMachineData,
  serializeStateMachineData,
  getState,
} from './StateMachineUtils';

describe('StateMachineUtils', () => {
  const createMachine = (): Object => {
    let data = createEmptyStateMachine();
    const idle = createState('Idle', 'Idle', 0, 0);
    const run = createState('Run', 'Run', 0, 100);
    data = addState(data, idle);
    data = addState(data, run);
    return { data, idle, run };
  };

  describe('serialization', () => {
    it('round trips the data', () => {
      const { data, idle, run } = createMachine();
      const withTransition = addTransition(data, idle.id, run.id).data;
      const reparsed = parseStateMachineData(
        serializeStateMachineData(withTransition)
      );
      expect(reparsed.states.length).toBe(2);
      expect(reparsed.entryStateId).toBe(idle.id);
      expect(reparsed.states[0].transitions.length).toBe(1);
    });

    it('falls back to an empty machine on invalid JSON', () => {
      const data = parseStateMachineData('not json');
      expect(data.states.length).toBe(0);
      expect(data.parameters.length).toBe(0);
    });
  });

  describe('transitions', () => {
    it('does not duplicate transitions to the same target', () => {
      const { data, idle, run } = createMachine();
      const first = addTransition(data, idle.id, run.id);
      const second = addTransition(first.data, idle.id, run.id);
      expect(second.transitionId).toBe(first.transitionId);
      expect(getState(second.data, idle.id).transitions.length).toBe(1);
    });

    it('disables self transitions by default from the Any State', () => {
      const { data, idle } = createMachine();
      const { data: newData, transitionId } = addTransition(
        data,
        anyStateId,
        idle.id
      );
      const transition = newData.anyState.transitions.find(
        candidate => candidate.id === transitionId
      );
      expect(transition.canTransitionToSelf).toBe(false);
    });

    it('stores the target sub-state machine of transitions', () => {
      const { data, idle, run } = createMachine();
      const withMachine = addSubMachineToData(
        data,
        createSubMachine('Grounded', 200, 200)
      );
      const machine = withMachine.subMachines[0];
      const withEntry = setSubMachineEntryState(
        moveStateToSubMachine(withMachine, run.id, machine.id),
        machine.id,
        run.id
      );
      const { data: newData, transitionId } = addTransition(
        withEntry,
        idle.id,
        '',
        machine.id
      );
      const transition = getState(newData, idle.id).transitions.find(
        candidate => candidate.id === transitionId
      );
      expect(transition.targetSubMachineId).toBe(machine.id);
      expect(transition.targetStateId).toBe(run.id);
    });

    it('keeps the transitions to a sub-state machine in sync with its entry state', () => {
      const { data, idle, run } = createMachine();
      const other = createState('Other', 'Run', 0, 200);
      let newData = addState(data, other);
      newData = addSubMachineToData(
        newData,
        createSubMachine('Grounded', 200, 200)
      );
      const machine = newData.subMachines[0];
      newData = moveStateToSubMachine(newData, run.id, machine.id);
      newData = moveStateToSubMachine(newData, other.id, machine.id);
      newData = setSubMachineEntryState(newData, machine.id, run.id);
      const added = addTransition(newData, idle.id, '', machine.id);
      newData = added.data;

      // Changing the entry state updates the transitions targeting the machine.
      newData = setSubMachineEntryState(newData, machine.id, other.id);
      const transition = getState(newData, idle.id).transitions.find(
        candidate => candidate.id === added.transitionId
      );
      expect(transition.targetStateId).toBe(other.id);
    });
  });

  describe('states and sub-state machines', () => {
    it('cleans up the transitions and entries when a state is deleted', () => {
      const { data, idle, run } = createMachine();
      const withTransition = addTransition(data, run.id, idle.id).data;
      const newData = deleteState(withTransition, idle.id);
      expect(getState(newData, run.id).transitions.length).toBe(0);
      // The entry state falls back to a remaining state.
      expect(newData.entryStateId).toBe(run.id);
    });

    it('keeps the entry of the sub-state machines valid', () => {
      const { data, run } = createMachine();
      let newData = addSubMachineToData(
        data,
        createSubMachine('Grounded', 200, 200)
      );
      const machine = newData.subMachines[0];
      newData = moveStateToSubMachine(newData, run.id, machine.id);
      newData = setSubMachineEntryState(newData, machine.id, run.id);
      newData = deleteState(newData, run.id);
      expect(newData.subMachines[0].entryStateId).toBe('');
    });

    it('re-targets the transitions when ungrouping a sub-state machine', () => {
      const { data, idle, run } = createMachine();
      let newData = addSubMachineToData(
        data,
        createSubMachine('Grounded', 200, 200)
      );
      const machine = newData.subMachines[0];
      newData = moveStateToSubMachine(newData, run.id, machine.id);
      newData = setSubMachineEntryState(newData, machine.id, run.id);
      const added = addTransition(newData, idle.id, '', machine.id);
      newData = deleteSubMachine(added.data, machine.id, false);

      const transition = getState(newData, idle.id).transitions.find(
        candidate => candidate.id === added.transitionId
      );
      expect(transition.targetSubMachineId).toBe('');
      expect(transition.targetStateId).toBe(run.id);
      expect(getState(newData, run.id).subMachineId).toBe('');
    });
  });

  describe('parameters', () => {
    it('renames a parameter in every condition', () => {
      const { data, idle, run } = createMachine();
      let newData = addParameterToData(
        data,
        createParameter('Speed', 'number')
      );
      const added = addTransition(newData, idle.id, run.id);
      newData = added.data;
      const state = getState(newData, idle.id);
      state.transitions[0].conditions = [
        { parameterName: 'Speed', operator: '>', value: 0 },
      ];
      newData = addTransition(newData, anyStateId, run.id).data;
      newData.anyState.transitions[0].conditions = [
        { parameterName: 'Speed', operator: '>', value: 0 },
      ];

      newData = renameParameter(newData, 'Speed', 'Velocity');
      expect(
        getState(newData, idle.id).transitions[0].conditions[0].parameterName
      ).toBe('Velocity');
      expect(newData.anyState.transitions[0].conditions[0].parameterName).toBe(
        'Velocity'
      );
    });

    it('renames an animation in every state using it', () => {
      const { data } = createMachine();
      const result = renameAnimationNameInStateMachineData(
        serializeStateMachineData(data),
        'Run',
        'Running'
      );
      expect(result.hasChanged).toBe(true);
      const newData = parseStateMachineData(result.serializedData);
      expect(
        newData.states.find(state => state.name === 'Run').animationName
      ).toBe('Running');
      expect(
        newData.states.find(state => state.name === 'Idle').animationName
      ).toBe('Idle');

      const noChange = renameAnimationNameInStateMachineData(
        result.serializedData,
        'Missing',
        'Whatever'
      );
      expect(noChange.hasChanged).toBe(false);
    });
  });

  describe('validation', () => {
    it('reports states without animation and missing animations', () => {
      const { data, idle } = createMachine();
      const noAnimation = createState('Jump', '', 0, 300);
      let newData = addState(data, noAnimation);
      newData = {
        ...newData,
        states: newData.states.map(state =>
          state.id === idle.id ? { ...state, animationName: 'Missing' } : state
        ),
      };
      const warnings = getValidationWarnings(newData, ['Idle', 'Run']);
      const codes = warnings.map(warning => warning.code);
      expect(codes).toContain('state-no-animation');
      expect(codes).toContain('state-missing-animation');
    });

    it('reports unreachable states and duplicate names', () => {
      const { data, run } = createMachine();
      // A state manually given the same name as another one.
      const duplicate = {
        ...run,
        id: 'duplicated-id',
        name: 'Run',
        transitions: [],
      };
      const newData = { ...data, states: [...data.states, duplicate] };
      const warnings = getValidationWarnings(newData, ['Idle', 'Run']);
      const codes = warnings.map(warning => warning.code);
      expect(codes).toContain('unreachable-state');
      expect(codes).toContain('duplicate-state-name');
    });

    it('reports conditions using missing parameters', () => {
      const { data, idle, run } = createMachine();
      const added = addTransition(data, idle.id, run.id);
      const newData = {
        ...added.data,
        states: added.data.states.map(state =>
          state.id === idle.id
            ? {
                ...state,
                transitions: state.transitions.map(transition => ({
                  ...transition,
                  conditions: [
                    { parameterName: 'Ghost', operator: '>', value: 0 },
                  ],
                })),
              }
            : state
        ),
      };
      const warnings = getValidationWarnings(newData, []);
      const codes = warnings.map(warning => warning.code);
      expect(codes).toContain('condition-missing-parameter');
    });

    it('reports empty sub-state machines and missing entry states', () => {
      const { data, run } = createMachine();
      let newData = addSubMachineToData(
        data,
        createSubMachine('Empty', 200, 200)
      );
      newData = addSubMachineToData(
        newData,
        createSubMachine('Grounded', 400, 200)
      );
      const grounded = newData.subMachines[1];
      newData = moveStateToSubMachine(newData, run.id, grounded.id);
      // Simulate data with a missing entry state.
      newData = {
        ...newData,
        subMachines: newData.subMachines.map(subMachine =>
          subMachine.id === grounded.id
            ? { ...subMachine, entryStateId: '' }
            : subMachine
        ),
      };
      const warnings = getValidationWarnings(newData, ['Idle', 'Run']);
      const codes = warnings.map(warning => warning.code);
      expect(codes).toContain('empty-sub-machine');
      expect(codes).toContain('sub-machine-no-entry');
    });
  });

  describe('blend trees', () => {
    const createBlendTreeForTest = () => {
      const blendTree = createBlendTree('Speed');
      blendTree.children.push({
        animationName: 'Idle',
        threshold: 0,
        speed: 1,
      });
      blendTree.children.push({
        animationName: 'Walk',
        threshold: 0.5,
        speed: 1.5,
      });
      blendTree.children.push({
        animationName: 'Run',
        threshold: 1,
        speed: 2,
      });
      return blendTree;
    };

    it('chooses the animation of the closest threshold', () => {
      const blendTree = createBlendTreeForTest();
      expect(getBlendTreeSelection(blendTree, -1).animationName).toBe('Idle');
      expect(getBlendTreeSelection(blendTree, 0).animationName).toBe('Idle');
      expect(getBlendTreeSelection(blendTree, 0.2).animationName).toBe('Idle');
      expect(getBlendTreeSelection(blendTree, 0.4).animationName).toBe('Walk');
      expect(getBlendTreeSelection(blendTree, 1.5).animationName).toBe('Run');
    });

    it('blends the playback speed between the neighbors', () => {
      const blendTree = createBlendTreeForTest();
      const below = getBlendTreeSelection(blendTree, -1);
      expect(below.speed).toBe(1);
      const middle = getBlendTreeSelection(blendTree, 0.25);
      // Halfway between Idle (1) and Walk (1.5).
      expect(middle.speed).toBeCloseTo(1.25, 5);
      const above = getBlendTreeSelection(blendTree, 2);
      expect(above.speed).toBe(2);
    });

    it('handles blend trees with zero or one animation', () => {
      const empty = createBlendTree('Speed');
      expect(getBlendTreeSelection(empty, 0).animationName).toBe('');
      const single = createBlendTree('Speed');
      single.children.push(createBlendTreeChild('Jump', 5));
      const selection = getBlendTreeSelection(single, 0);
      expect(selection.animationName).toBe('Jump');
      expect(selection.speed).toBe(1);
    });

    it('round trips the blend tree in the serialized data', () => {
      const { data, idle } = createMachine();
      const newData = {
        ...data,
        states: data.states.map(state =>
          state.id === idle.id
            ? { ...state, blendTree: createBlendTreeForTest() }
            : state
        ),
      };
      const reparsed = parseStateMachineData(
        serializeStateMachineData(newData)
      );
      const blendTree = reparsed.states.find(state => state.id === idle.id)
        .blendTree;
      expect(blendTree.parameterName).toBe('Speed');
      expect(blendTree.children.length).toBe(3);
      expect(blendTree.children[2].animationName).toBe('Run');
      // States without blend tree keep a null one.
      expect(
        reparsed.states.find(state => state.id !== idle.id).blendTree
      ).toBe(null);
    });

    it('renames the animations of the blend tree children', () => {
      const { data, idle } = createMachine();
      const newData = {
        ...data,
        states: data.states.map(state =>
          state.id === idle.id
            ? { ...state, blendTree: createBlendTreeForTest() }
            : state
        ),
      };
      const result = renameAnimationNameInStateMachineData(
        serializeStateMachineData(newData),
        'Run',
        'Running'
      );
      expect(result.hasChanged).toBe(true);
      const blendTree = parseStateMachineData(
        result.serializedData
      ).states.find(state => state.id === idle.id).blendTree;
      expect(blendTree.children[2].animationName).toBe('Running');
    });

    it('reports blend tree problems in the validation', () => {
      const { data, idle } = createMachine();
      const blendTree = createBlendTree('');
      blendTree.children.push(createBlendTreeChild('Missing', 0));
      blendTree.children.push(createBlendTreeChild('Missing 2', 0));
      const newData = {
        ...data,
        states: data.states.map(state =>
          state.id === idle.id ? { ...state, blendTree } : state
        ),
      };
      const warnings = getValidationWarnings(newData, ['Idle', 'Run']);
      const codes = warnings.map(warning => warning.code);
      expect(codes).toContain('blend-tree-no-parameter');
      expect(codes).toContain('blend-tree-duplicate-threshold');
      expect(codes).toContain('blend-tree-missing-animation');
      // Blend tree states are not checked for a single animation.
      expect(codes).not.toContain('state-no-animation');
    });
  });
});
