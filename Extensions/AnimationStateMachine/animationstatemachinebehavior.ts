namespace gdjs {
  /**
   * The AnimationStateMachineRuntimeBehavior drives the animation of its
   * owner object using an animation state machine: it plays the animation of
   * the current state and switches states when the transitions are fulfilled
   * (using parameters set from the events sheet).
   *
   * @internal
   */
  export class AnimationStateMachineRuntimeBehavior extends gdjs.RuntimeBehavior {
    _controller: gdjs.AnimationStateMachine.StateMachineController | null;
    _lastAnimationFrame: number;
    _isCreated: boolean;
    // Names of the states just entered/left, published before the events of
    // the next frame (see doStepPreEvents).
    _pendingEnteredStateName: string | null;
    _pendingExitedStateName: string | null;
    _enteredStateName: string;
    _exitedStateName: string;
    _hasJustEnteredState: boolean;
    _hasJustExitedState: boolean;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData: any,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);

      const data = gdjs.AnimationStateMachine.parseStateMachineData(
        behaviorData.stateMachineData
      );
      this._lastAnimationFrame = 0;
      this._isCreated = false;
      this._pendingEnteredStateName = null;
      this._pendingExitedStateName = null;
      this._enteredStateName = '';
      this._exitedStateName = '';
      this._hasJustEnteredState = false;
      this._hasJustExitedState = false;
      this._controller = data
        ? new gdjs.AnimationStateMachine.StateMachineController(data, {
            onEnterState: (state, previousState) =>
              this._onEnterState(state, previousState),
          })
        : null;
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      const data = gdjs.AnimationStateMachine.parseStateMachineData(
        behaviorData.stateMachineData
      );
      if (!data) return false;

      const currentStateName = this._controller
        ? this._controller.getCurrentStateName()
        : '';
      this._controller = new gdjs.AnimationStateMachine.StateMachineController(
        data,
        {
          onEnterState: (state, previousState) =>
            this._onEnterState(state, previousState),
        }
      );
      if (this._isCreated) {
        // Try to stay in the same state after a hot-reload.
        if (
          currentStateName &&
          this._controller.getStateByName(currentStateName)
        ) {
          this._controller.setStateByName(currentStateName);
        } else {
          this._controller.start();
        }
      }
      return true;
    }

    /**
     * Start the state machine when the object is fully created (the object
     * animations can only be played at this point).
     */
    onCreated(): void {
      this._isCreated = true;
      if (this._controller) this._controller.start();
    }

    onDeActivate() {}

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // Publish the state changes of the previous frame to the events.
      this._hasJustEnteredState = this._pendingEnteredStateName !== null;
      this._enteredStateName = this._pendingEnteredStateName || '';
      this._hasJustExitedState = this._pendingExitedStateName !== null;
      this._exitedStateName = this._pendingExitedStateName || '';
      this._pendingEnteredStateName = null;
      this._pendingExitedStateName = null;
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      if (!this._controller || !this._controller.getCurrentState()) return;

      // Keep the blend tree of the current state in sync with the blend
      // parameter (the animation and its speed can change every frame).
      const currentState = this._controller.getCurrentState();
      if (
        currentState &&
        currentState.blendTree &&
        currentState.blendTree.children.length > 0
      ) {
        this._applyBlendTree(currentState, false);
      }

      const owner: any = this.owner;
      const frameCount =
        typeof owner.getAnimationFrameCount === 'function'
          ? owner.getAnimationFrameCount()
          : 0;
      let deltaNormalizedTime: number;
      if (frameCount > 1 && typeof owner.getAnimationFrame === 'function') {
        // Follow the animation frames (supports animation loops: exit times
        // greater than 1 will wait for several loops).
        const frame = owner.getAnimationFrame();
        let frameDelta = frame - this._lastAnimationFrame;
        if (frameDelta < 0) frameDelta += frameCount;
        this._lastAnimationFrame = frame;
        deltaNormalizedTime = frameDelta / frameCount;
      } else {
        // Without frame-based animations, time is expressed in seconds.
        deltaNormalizedTime = instanceContainer.getElapsedTime() / 1000;
      }
      this._controller.update(deltaNormalizedTime);
    }

    _onEnterState(
      state: gdjs.AnimationStateMachine.State,
      previousState: gdjs.AnimationStateMachine.State | null
    ): void {
      this._pendingEnteredStateName = state.name;
      this._pendingExitedStateName = previousState ? previousState.name : null;
      this._playStateAnimation(state);
    }

    _getNormalizedAnimationTime(): number {
      const owner: any = this.owner;
      if (
        typeof owner.getAnimationFrame === 'function' &&
        typeof owner.getAnimationFrameCount === 'function'
      ) {
        const frameCount = owner.getAnimationFrameCount();
        if (frameCount > 0) return owner.getAnimationFrame() / frameCount;
      }
      return 0;
    }

    /**
     * Play the animation chosen by the blend tree of the state, and apply
     * its blended playback speed.
     */
    _applyBlendTree(
      state: gdjs.AnimationStateMachine.State,
      isEnteringState: boolean
    ): void {
      const owner: any = this.owner;
      const blendTree = state.blendTree;
      if (!blendTree) return;
      const blendValue = this._controller
        ? this._controller.getNumberParameter(blendTree.parameterName)
        : 0;
      const selection = gdjs.AnimationStateMachine.getBlendTreeSelection(
        blendTree,
        blendValue
      );
      if (selection.animationName && typeof owner.setAnimationName === 'function') {
        const isSameAnimation =
          typeof owner.getAnimationName === 'function' &&
          owner.getAnimationName() === selection.animationName;
        if (!isSameAnimation) {
          if (isEnteringState && state.restartAnimationOnEnter) {
            owner.setAnimationName(selection.animationName);
          } else {
            // Keep the position in the animation ("frame matching") to avoid
            // jarring restarts when the blend selects another animation.
            const normalizedTime = this._getNormalizedAnimationTime();
            owner.setAnimationName(selection.animationName);
            if (
              typeof owner.setAnimationFrame === 'function' &&
              typeof owner.getAnimationFrameCount === 'function'
            ) {
              const frameCount = owner.getAnimationFrameCount();
              if (frameCount > 0) {
                owner.setAnimationFrame(
                  Math.floor(normalizedTime * frameCount) % frameCount
                );
              }
            }
          }
        } else if (
          isEnteringState &&
          state.restartAnimationOnEnter &&
          typeof owner.setAnimationFrame === 'function'
        ) {
          owner.setAnimationFrame(0);
        }
      }
      if (typeof owner.setAnimationSpeedScale === 'function') {
        owner.setAnimationSpeedScale(state.speed * selection.speed);
      }
    }

    _playStateAnimation(state: gdjs.AnimationStateMachine.State): void {
      const owner: any = this.owner;
      if (state.blendTree && state.blendTree.children.length > 0) {
        this._applyBlendTree(state, true);
      } else {
        if (
          state.animationName &&
          typeof owner.setAnimationName === 'function'
        ) {
          const isSameAnimation =
            typeof owner.getAnimationName === 'function' &&
            owner.getAnimationName() === state.animationName;
          if (!isSameAnimation) {
            owner.setAnimationName(state.animationName);
          } else if (
            state.restartAnimationOnEnter &&
            typeof owner.setAnimationFrame === 'function'
          ) {
            owner.setAnimationFrame(0);
          }
        }
        if (typeof owner.setAnimationSpeedScale === 'function') {
          owner.setAnimationSpeedScale(state.speed);
        }
      }
      this._lastAnimationFrame =
        typeof owner.getAnimationFrame === 'function'
          ? owner.getAnimationFrame()
          : 0;
    }

    /**
     * Immediately switch to the state with the given name.
     */
    changeState(stateName: string): void {
      if (this._controller) this._controller.setStateByName(stateName);
    }

    setNumberParameter(parameterName: string, value: float): void {
      if (this._controller)
        this._controller.setNumberParameter(parameterName, value);
    }

    setBooleanParameter(parameterName: string, value: boolean): void {
      if (this._controller)
        this._controller.setBooleanParameter(parameterName, value);
    }

    toggleBooleanParameter(parameterName: string): void {
      if (this._controller)
        this._controller.toggleBooleanParameter(parameterName);
    }

    triggerParameter(parameterName: string): void {
      if (this._controller) this._controller.triggerParameter(parameterName);
    }

    resetTriggerParameter(parameterName: string): void {
      if (this._controller)
        this._controller.resetTriggerParameter(parameterName);
    }

    getCurrentStateName(): string {
      return this._controller ? this._controller.getCurrentStateName() : '';
    }

    /**
     * True during the frame following a state change.
     */
    hasJustChangedState(): boolean {
      return this._hasJustEnteredState || this._hasJustExitedState;
    }

    hasJustEnteredStateNamed(stateName: string): boolean {
      return this._hasJustEnteredState && this._enteredStateName === stateName;
    }

    hasJustExitedStateNamed(stateName: string): boolean {
      return this._hasJustExitedState && this._exitedStateName === stateName;
    }

    getPreviousStateName(): string {
      return this._exitedStateName;
    }

    isInState(stateName: string): boolean {
      return this._controller ? this._controller.isInState(stateName) : false;
    }

    getNumberParameter(parameterName: string): float {
      return this._controller
        ? this._controller.getNumberParameter(parameterName)
        : 0;
    }

    isBooleanParameterSet(parameterName: string): boolean {
      return this._controller
        ? this._controller.isBooleanParameterSet(parameterName)
        : false;
    }
  }

  gdjs.registerBehavior(
    'AnimationStateMachine::AnimationStateMachineBehavior',
    gdjs.AnimationStateMachineRuntimeBehavior
  );
}
