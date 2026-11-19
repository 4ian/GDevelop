namespace gdjs {
  /**
   * @namespace AnimationStateMachine
   * @internal
   * The pure logic of the animation state machine: it stores the machine
   * definition (states, transitions and parameters), evaluates transitions
   * and tells the owning behavior which animation should be played.
   */
  export namespace AnimationStateMachine {
    export type ParameterType = 'number' | 'boolean' | 'trigger';

    export type Parameter = {
      name: string;
      type: ParameterType;
      /** Default value for number/boolean parameters. */
      defaultValue: number | boolean;
    };

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

    export type Condition = {
      parameterName: string;
      operator: ConditionOperator;
      /** Value used for numeric comparisons. */
      value: number;
    };

    /**
     * Defines which transitions can interrupt a transition that is waiting
     * for its exit time:
     * - `none`: no other transition can fire while waiting.
     * - `current`: other transitions of the current state can fire while waiting.
     * - `next`: transitions of the destination state can fire right after
     *   entering it (in the same frame).
     * - `currentThenNext`: both of the above.
     */
    export type InterruptionSource =
      | 'none'
      | 'current'
      | 'next'
      | 'currentThenNext';

    export type Transition = {
      id: string;
      targetStateId: string;
      hasExitTime: boolean;
      /** Normalized time of the animation (can be > 1 to wait for several loops). */
      exitTime: number;
      interruptionSource: InterruptionSource;
      conditions: Array<Condition>;
      /**
       * The id of the target state. Can be empty when the transition targets
       * a sub-state machine (`targetSubMachineId`): in this case, the target
       * is the entry state of the sub-state machine.
       */
      targetStateId: string;
      /** The id of the targeted sub-state machine (empty if not targeting one). */
      targetSubMachineId: string;
      /** False to forbid a transition to the state currently being played. */
      canTransitionToSelf: boolean;
    };

    export type State = {
      id: string;
      name: string;
      /** Name of the animation to play (as defined in the object animations). */
      animationName: string;
      /** Multiplier applied to the animation speed. */
      speed: number;
      /** True to restart the animation each time the state is entered. */
      restartAnimationOnEnter: boolean;
      /** Position of the node in the state machine graph editor. */
      x: number;
      y: number;
      /** The id of the containing sub-state machine (empty at the root). */
      subMachineId: string;
      /**
       * When set, the state plays the animations of this blend tree instead
       * of a single animation: the animation (and its speed) is chosen from
       * the value of the blend parameter.
       */
      blendTree: BlendTree | null;
      transitions: Array<Transition>;
    };

    /** One animation of a blend tree, with its position on the blend axis. */
    export type BlendTreeChild = {
      animationName: string;
      /** The value of the blend parameter where this animation is played. */
      threshold: number;
      /** The playback speed of this animation. */
      speed: number;
    };

    /**
     * A 1D blend tree: the animations are chosen (and their speed blended)
     * from the value of a number parameter.
     */
    export type BlendTree = {
      parameterName: string;
      children: Array<BlendTreeChild>;
    };

    /** The animation chosen by a blend tree for a given value. */
    export type BlendTreeSelection = {
      animationName: string;
      speed: number;
      childIndex: number;
    };

    /**
     * A sub-state machine: a group of states, with its own entry state.
     * A transition can target the sub-state machine itself: it will enter
     * its entry state.
     */
    export type SubMachine = {
      id: string;
      name: string;
      /** Position of the group in the state machine graph editor. */
      x: number;
      y: number;
      /** The entry state (one of the states having this sub-machine id). */
      entryStateId: string;
    };

    /**
     * The "Any State" pseudo-state: its transitions are checked before the
     * ones of the current state and can fire from any state.
     */
    export type AnyState = {
      /** Position of the node in the state machine graph editor. */
      x: number;
      y: number;
      transitions: Array<Transition>;
    };

    export type StateMachineData = {
      parameters: Array<Parameter>;
      states: Array<State>;
      subMachines: Array<SubMachine>;
      anyState: AnyState;
      entryStateId: string;
    };

    /**
     * Parse (and sanitize) a state machine definition.
     * Returns null if the JSON is invalid.
     */
    export const parseStateMachineData = (
      serializedData: string
    ): StateMachineData | null => {
      if (!serializedData) return null;
      let raw: any;
      try {
        raw = JSON.parse(serializedData);
      } catch (exception) {
        return null;
      }
      if (!raw || typeof raw !== 'object') return null;

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
      const rawSubMachines = Array.isArray(raw.subMachines)
        ? raw.subMachines
        : [];
      for (const rawSubMachine of rawSubMachines) {
        if (!rawSubMachine || typeof rawSubMachine.name !== 'string') continue;
        subMachines.push({
          id:
            typeof rawSubMachine.id === 'string'
              ? rawSubMachine.id
              : rawSubMachine.name,
          name: rawSubMachine.name,
          x: typeof rawSubMachine.x === 'number' ? rawSubMachine.x : 0,
          y: typeof rawSubMachine.y === 'number' ? rawSubMachine.y : 0,
          entryStateId:
            typeof rawSubMachine.entryStateId === 'string'
              ? rawSubMachine.entryStateId
              : '',
        });
      }
      const getSubMachineById = (subMachineId: string): SubMachine | null => {
        for (const subMachine of subMachines) {
          if (subMachine.id === subMachineId) return subMachine;
        }
        return null;
      };

      const parseTransition = (rawTransition: any): Transition | null => {
        if (!rawTransition) return null;
        const targetSubMachineId =
          typeof rawTransition.targetSubMachineId === 'string'
            ? rawTransition.targetSubMachineId
            : '';
        const subMachine = targetSubMachineId
          ? getSubMachineById(targetSubMachineId)
          : null;
        // Resolve the target of transitions to a sub-state machine to the
        // entry state of this sub-state machine.
        const targetStateId =
          typeof rawTransition.targetStateId === 'string' &&
          rawTransition.targetStateId
            ? rawTransition.targetStateId
            : subMachine
            ? subMachine.entryStateId
            : '';
        if (!targetStateId && !subMachine) return null;
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
            operator: rawCondition.operator as ConditionOperator,
            value:
              typeof rawCondition.value === 'number' ? rawCondition.value : 0,
          });
        }
        return {
          id: typeof rawTransition.id === 'string' ? rawTransition.id : '',
          targetStateId,
          targetSubMachineId,
          hasExitTime: !!rawTransition.hasExitTime,
          exitTime:
            typeof rawTransition.exitTime === 'number'
              ? rawTransition.exitTime
              : 1,
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

      const states: Array<State> = [];
      const rawStates = Array.isArray(raw.states) ? raw.states : [];
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
        const transitions: Array<Transition> = [];
        const rawTransitions = Array.isArray(rawState.transitions)
          ? rawState.transitions
          : [];
        for (const rawTransition of rawTransitions) {
          const transition = parseTransition(rawTransition);
          if (transition) transitions.push(transition);
        }
        states.push({
          id: typeof rawState.id === 'string' ? rawState.id : rawState.name,
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
          subMachineId:
            typeof rawState.subMachineId === 'string'
              ? rawState.subMachineId
              : '',
          blendTree: parseBlendTree(rawState.blendTree),
          transitions,
        });
      }

      // Parse the "Any State" pseudo-state.
      const rawAnyState =
        raw.anyState && typeof raw.anyState === 'object' ? raw.anyState : {};
      const anyStateTransitions: Array<Transition> = [];
      const rawAnyStateTransitions = Array.isArray(rawAnyState.transitions)
        ? rawAnyState.transitions
        : [];
      for (const rawTransition of rawAnyStateTransitions) {
        const transition = parseTransition(rawTransition);
        if (transition) anyStateTransitions.push(transition);
      }
      const anyState: AnyState = {
        x: typeof rawAnyState.x === 'number' ? rawAnyState.x : 40,
        y: typeof rawAnyState.y === 'number' ? rawAnyState.y : 40,
        transitions: anyStateTransitions,
      };

      // Remove transitions pointing to unknown states (or to sub-state
      // machines without entry state).
      const stateIds = {};
      for (const state of states) stateIds[state.id] = true;
      const isTransitionTargetValid = (transition: Transition): boolean =>
        !!stateIds[transition.targetStateId];
      for (const state of states) {
        state.transitions = state.transitions.filter(isTransitionTargetValid);
      }
      anyState.transitions = anyState.transitions.filter(
        isTransitionTargetValid
      );

      // Keep only sub-state machines referencing existing states.
      for (const subMachine of subMachines) {
        if (!stateIds[subMachine.entryStateId]) {
          subMachine.entryStateId = '';
        }
      }

      return {
        parameters,
        states,
        subMachines,
        anyState,
        entryStateId:
          typeof raw.entryStateId === 'string' ? raw.entryStateId : '',
      };
    };

    /**
     * Choose the animation (and the playback speed) of a blend tree for a
     * given value of the blend parameter.
     *
     * The animation of the closest threshold is played (the parameters around
     * the value are used to blend the playback speed, which avoids the
     * "foot sliding" of animations playing at a fixed speed).
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
        if (
          value >= lower.child.threshold &&
          value <= upper.child.threshold
        ) {
          const range = upper.child.threshold - lower.child.threshold;
          const factor = range > 0 ? (value - lower.child.threshold) / range : 0;
          const chosen = factor < 0.5 ? lower : upper;
          return {
            animationName: chosen.child.animationName,
            speed:
              lower.child.speed +
              (upper.child.speed - lower.child.speed) * factor,
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

    /**
     * The behavior uses this to be notified when the machine enters a new
     * state (and so, should play a new animation).
     */
    export type StateMachineListener = {
      onEnterState: (state: State, previousState: State | null) => void;
    };

    /**
     * The runtime state machine: it keeps the current state, the values of
     * the parameters and evaluates the transitions at each frame.
     */
    export class StateMachineController {
      data: StateMachineData;
      _listener: StateMachineListener;
      _parameterValues: Record<string, number | boolean>;
      _triggers: Record<string, boolean>;
      _currentStateId: string;
      _pendingTransition: Transition | null;
      _normalizedTime: number;

      constructor(data: StateMachineData, listener: StateMachineListener) {
        this.data = data;
        this._listener = listener;
        this._parameterValues = {};
        this._triggers = {};
        this._currentStateId = '';
        this._pendingTransition = null;
        this._normalizedTime = 0;

        for (const parameter of data.parameters) {
          this._parameterValues[parameter.name] = parameter.defaultValue;
          if (parameter.type === 'trigger') {
            this._triggers[parameter.name] = false;
          }
        }
      }

      /**
       * Enter the entry state of the machine (called when the machine starts).
       */
      start(): void {
        const entryState = this.getStateById(this.data.entryStateId);
        if (entryState) {
          this._enterState(entryState);
        } else if (this.data.states.length > 0) {
          this._enterState(this.data.states[0]);
        }
      }

      getStateById(stateId: string): State | null {
        for (const state of this.data.states) {
          if (state.id === stateId) return state;
        }
        return null;
      }

      getStateByName(stateName: string): State | null {
        for (const state of this.data.states) {
          if (state.name === stateName) return state;
        }
        return null;
      }

      getCurrentState(): State | null {
        return this.getStateById(this._currentStateId);
      }

      getCurrentStateName(): string {
        const state = this.getCurrentState();
        return state ? state.name : '';
      }

      isInState(stateName: string): boolean {
        return this.getCurrentStateName() === stateName;
      }

      /**
       * Immediately switch to the state with the given name.
       * Returns true if the state was found.
       */
      setStateByName(stateName: string): boolean {
        const state = this.getStateByName(stateName);
        if (!state) return false;
        this._enterState(state);
        return true;
      }

      setNumberParameter(parameterName: string, value: number): void {
        this._parameterValues[parameterName] = value;
      }

      setBooleanParameter(parameterName: string, value: boolean): void {
        this._parameterValues[parameterName] = value;
      }

      toggleBooleanParameter(parameterName: string): void {
        this._parameterValues[parameterName] = !this._getParameterValue(
          parameterName
        );
      }

      triggerParameter(parameterName: string): void {
        this._triggers[parameterName] = true;
      }

      resetTriggerParameter(parameterName: string): void {
        this._triggers[parameterName] = false;
      }

      getNumberParameter(parameterName: string): number {
        const value = this._getParameterValue(parameterName);
        return typeof value === 'number' ? value : 0;
      }

      isBooleanParameterSet(parameterName: string): boolean {
        return !!this._getParameterValue(parameterName);
      }

      _getParameterValue(parameterName: string): number | boolean {
        const value = this._parameterValues[parameterName];
        return value === undefined ? 0 : value;
      }

      _isTriggerSet(parameterName: string): boolean {
        return !!this._triggers[parameterName];
      }

      _areConditionsMet(transition: Transition): boolean {
        for (const condition of transition.conditions) {
          const parameter = this._getParameter(condition.parameterName);
          if (!parameter) continue;
          if (parameter.type === 'trigger') {
            if (condition.operator === 'isSet' && !this._isTriggerSet(condition.parameterName))
              return false;
            continue;
          }
          if (parameter.type === 'boolean') {
            const value = !!this._getParameterValue(condition.parameterName);
            if (condition.operator === 'isTrue' && !value) return false;
            else if (condition.operator === 'isFalse' && value) return false;
            else if (condition.operator === '==' && value !== condition.value)
              return false;
            else if (condition.operator === '!=' && value === condition.value)
              return false;
            continue;
          }
          const value = this.getNumberParameter(condition.parameterName);
          const target = condition.value;
          switch (condition.operator) {
            case '==':
              if (value !== target) return false;
              break;
            case '!=':
              if (value === target) return false;
              break;
            case '>':
              if (!(value > target)) return false;
              break;
            case '>=':
              if (!(value >= target)) return false;
              break;
            case '<':
              if (!(value < target)) return false;
              break;
            case '<=':
              if (!(value <= target)) return false;
              break;
            default:
              break;
          }
        }
        return true;
      }

      _getParameter(parameterName: string): Parameter | null {
        for (const parameter of this.data.parameters) {
          if (parameter.name === parameterName) return parameter;
        }
        return null;
      }

      _consumeTriggers(transition: Transition): void {
        for (const condition of transition.conditions) {
          const parameter = this._getParameter(condition.parameterName);
          if (parameter && parameter.type === 'trigger') {
            this._triggers[condition.parameterName] = false;
          }
        }
      }

      _enterState(state: State): void {
        const previousState = this.getCurrentState();
        this._currentStateId = state.id;
        this._normalizedTime = 0;
        this._pendingTransition = null;
        this._listener.onEnterState(state, previousState);
      }

      _allowsInterruptions(transition: Transition): boolean {
        return (
          transition.interruptionSource === 'current' ||
          transition.interruptionSource === 'currentThenNext'
        );
      }

      _allowsChainingToNextState(transition: Transition): boolean {
        return (
          transition.interruptionSource === 'next' ||
          transition.interruptionSource === 'currentThenNext'
        );
      }

      /**
       * Evaluate the transitions of the current state.
       *
       * @param deltaNormalizedTime The elapsed time since the last call,
       * expressed in normalized animation time (or in seconds for objects
       * without frame-based animations).
       */
      /**
       * Find the first transition that can fire right now.
       *
       * - `transitions`: the transitions to check (the ones of the current
       *   state, or the ones of the "Any State" pseudo-state).
       * - `currentState`: used to skip transitions to the state currently
       *   played when `canTransitionToSelf` is false.
       * - `blockingPending`: a pending transition blocking the others (when
       *   it doesn't allow interruptions).
       */
      _evaluateTransitions(
        transitions: Array<Transition>,
        currentState: State,
        blockingPending: Transition | null
      ): { toFire: Transition | null; newPending: Transition | null } {
        // A pending transition blocking the others (when it doesn't allow
        // interruptions) blocks them even before being stored as pending.
        let blockingTransition: Transition | null =
          blockingPending != null && !this._allowsInterruptions(blockingPending)
            ? blockingPending
            : null;
        let newPending: Transition | null = null;
        for (const transition of transitions) {
          if (!this._areConditionsMet(transition)) continue;
          if (blockingTransition != null && transition !== blockingTransition)
            continue;
          if (
            transition.targetStateId === currentState.id &&
            !transition.canTransitionToSelf
          )
            continue;
          const exitTimePassed =
            !transition.hasExitTime ||
            this._normalizedTime >= transition.exitTime;
          if (exitTimePassed) return { toFire: transition, newPending: null };
          // The transition must wait for its exit time: the first waiting
          // transition (in order) becomes the pending one. When it doesn't
          // allow interruptions, it also blocks the other transitions of
          // the state until it fires.
          if (newPending == null) {
            newPending = transition;
            if (!this._allowsInterruptions(transition)) {
              blockingTransition = transition;
            }
          }
        }
        return { toFire: null, newPending };
      }

      /**
       * Fire a transition: consume its triggers and enter its target state.
       * Returns true when the update loop must stop (no chaining).
       */
      _fireTransition(transition: Transition): boolean {
        this._consumeTriggers(transition);
        const targetState = this.getStateById(transition.targetStateId);
        const shouldChain = this._allowsChainingToNextState(transition);
        this._pendingTransition = null;
        if (!targetState) return true;
        this._enterState(targetState);
        return !shouldChain;
      }

      update(deltaNormalizedTime: number): void {
        this._normalizedTime += deltaNormalizedTime;

        // Bound the number of chained state changes to avoid infinite loops
        // between transitions without exit time and without conditions.
        for (let step = 0; step < 50; step++) {
          const state = this.getCurrentState();
          if (!state) return;

          // 1) The transitions of the "Any State" pseudo-state are checked
          // first: they can fire from any state and are never blocked by a
          // pending transition of the current state.
          const anyStateResult = this._evaluateTransitions(
            this.data.anyState.transitions,
            state,
            null
          );
          if (anyStateResult.toFire) {
            if (this._fireTransition(anyStateResult.toFire)) return;
            continue;
          }

          // 2) The transitions of the current state. A transition is
          // "pending" while its conditions are met but it is still waiting
          // for its exit time. A pending transition can block the other
          // transitions of the state (see InterruptionSource).
          const previousPending = this._pendingTransition;
          const blockingPending: Transition | null =
            previousPending != null &&
            previousPending.hasExitTime &&
            this._normalizedTime < previousPending.exitTime &&
            this._areConditionsMet(previousPending)
              ? previousPending
              : null;
          const result = this._evaluateTransitions(
            state.transitions,
            state,
            blockingPending
          );
          if (!result.toFire) {
            this._pendingTransition = result.newPending;
            return;
          }
          if (this._fireTransition(result.toFire)) return;
        }
      }
    }
  }
}
