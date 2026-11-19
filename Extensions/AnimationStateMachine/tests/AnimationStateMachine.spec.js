// @ts-check
describe('gdjs.AnimationStateMachine', () => {
  const behaviorName = 'StateMachine';

  const createScene = (timeDelta = 1000 / 60) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene._timeManager.getElapsedTime = () => {
      return timeDelta;
    };
    return runtimeScene;
  };

  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   * @param {any} machineData
   */
  const addSprite = (runtimeScene, machineData) => {
    const object = new gdjs.SpriteRuntimeObject(runtimeScene, {
      name: 'Sprite',
      type: 'Sprite',
      effects: [],
      variables: [],
      behaviors: [
        {
          type: 'AnimationStateMachine::AnimationStateMachineBehavior',
          name: behaviorName,
          stateMachineData: JSON.stringify(machineData),
        },
      ],
      animations: [
        {
          name: 'Idle',
          directions: [
            {
              sprites: [
                {
                  originPoint: { name: 'Center', x: 0, y: 0 },
                  centerPoint: { name: 'Origin', automatic: true, x: 32, y: 32 },
                  points: [],
                  hasCustomCollisionMask: false,
                  customCollisionMask: [],
                  image: '',
                },
                {
                  originPoint: { name: 'Center', x: 0, y: 0 },
                  centerPoint: { name: 'Origin', automatic: true, x: 32, y: 32 },
                  points: [],
                  hasCustomCollisionMask: false,
                  customCollisionMask: [],
                  image: '',
                },
              ],
              timeBetweenFrames: 0.1,
              looping: true,
            },
          ],
          useMultipleDirections: false,
        },
        {
          name: 'Run',
          directions: [
            {
              sprites: [
                {
                  originPoint: { name: 'Center', x: 0, y: 0 },
                  centerPoint: { name: 'Origin', automatic: true, x: 32, y: 32 },
                  points: [],
                  hasCustomCollisionMask: false,
                  customCollisionMask: [],
                  image: '',
                },
                {
                  originPoint: { name: 'Center', x: 0, y: 0 },
                  centerPoint: { name: 'Origin', automatic: true, x: 32, y: 32 },
                  points: [],
                  hasCustomCollisionMask: false,
                  customCollisionMask: [],
                  image: '',
                },
              ],
              timeBetweenFrames: 0.1,
              looping: true,
            },
          ],
          useMultipleDirections: false,
        },
      ],
      updateIfNotVisible: true,
    });
    object.getWidth = () => 64;
    object.getHeight = () => 64;
    runtimeScene.addObject(object);
    return object;
  };

  describe('parseStateMachineData', () => {
    it('returns null for invalid JSON', () => {
      expect(gdjs.AnimationStateMachine.parseStateMachineData('')).to.be(null);
      expect(
        gdjs.AnimationStateMachine.parseStateMachineData('not json')
      ).to.be(null);
    });

    it('parses parameters, states and transitions', () => {
      const data = gdjs.AnimationStateMachine.parseStateMachineData(
        JSON.stringify({
          parameters: [
            { name: 'Speed', type: 'number', defaultValue: 2 },
            { name: 'Fire', type: 'trigger' },
          ],
          states: [
            {
              id: 'idle',
              name: 'Idle',
              animationName: 'Idle',
              speed: 1,
              restartAnimationOnEnter: true,
              x: 10,
              y: 20,
              transitions: [
                {
                  id: 't1',
                  targetStateId: 'run',
                  hasExitTime: true,
                  exitTime: 0.5,
                  interruptionSource: 'current',
                  conditions: [
                    { parameterName: 'Speed', operator: '>', value: 0 },
                  ],
                },
              ],
            },
            { id: 'run', name: 'Run', animationName: 'Run', transitions: [] },
          ],
          entryStateId: 'idle',
        })
      );
      if (!data) throw new Error('Expected data to be parsed');
      expect(data.parameters.length).to.be(2);
      expect(data.parameters[0].defaultValue).to.be(2);
      expect(data.parameters[1].type).to.be('trigger');
      expect(data.states.length).to.be(2);
      expect(data.states[0].transitions.length).to.be(1);
      expect(data.states[0].transitions[0].exitTime).to.be(0.5);
      expect(data.entryStateId).to.be('idle');
    });

    it('removes transitions pointing to unknown states', () => {
      const data = gdjs.AnimationStateMachine.parseStateMachineData(
        JSON.stringify({
          parameters: [],
          states: [
            {
              id: 'idle',
              name: 'Idle',
              transitions: [{ id: 't1', targetStateId: 'missing' }],
            },
          ],
          entryStateId: 'idle',
        })
      );
      if (!data) throw new Error('Expected data to be parsed');
      expect(data.states[0].transitions.length).to.be(0);
    });
  });

  describe('StateMachineController', () => {
    /**
     * @param {any} partialData
     */
    const createController = (partialData) => {
      const enteredStates = [];
      const data = gdjs.AnimationStateMachine.parseStateMachineData(
        JSON.stringify({
          parameters: [],
          states: [],
          entryStateId: '',
          ...partialData,
        })
      );
      if (!data) throw new Error('Expected data to be parsed');
      const controller = new gdjs.AnimationStateMachine.StateMachineController(
        data,
        {
          onEnterState: state => enteredStates.push(state.name),
        }
      );
      return { controller, enteredStates };
    };

    it('starts on the entry state', () => {
      const { controller, enteredStates } = createController({
        states: [
          { id: 'a', name: 'A', transitions: [] },
          { id: 'b', name: 'B', transitions: [] },
        ],
        entryStateId: 'b',
      });
      controller.start();
      expect(enteredStates).to.eql(['B']);
      expect(controller.getCurrentStateName()).to.be('B');
      expect(controller.isInState('B')).to.be(true);
      expect(controller.isInState('A')).to.be(false);
    });

    it('fires a transition without exit time as soon as its conditions are met', () => {
      const { controller, enteredStates } = createController({
        parameters: [{ name: 'Speed', type: 'number', defaultValue: 0 }],
        states: [
          {
            id: 'a',
            name: 'A',
            transitions: [
              {
                id: 't1',
                targetStateId: 'b',
                hasExitTime: false,
                conditions: [{ parameterName: 'Speed', operator: '>', value: 0 }],
              },
            ],
          },
          { id: 'b', name: 'B', transitions: [] },
        ],
        entryStateId: 'a',
      });
      controller.start();
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('A');

      controller.setNumberParameter('Speed', 10);
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('B');
      expect(enteredStates).to.eql(['A', 'B']);
    });

    it('waits for the exit time before firing a transition', () => {
      const { controller } = createController({
        states: [
          {
            id: 'a',
            name: 'A',
            transitions: [
              {
                id: 't1',
                targetStateId: 'b',
                hasExitTime: true,
                exitTime: 0.5,
                conditions: [],
              },
            ],
          },
          { id: 'b', name: 'B', transitions: [] },
        ],
        entryStateId: 'a',
      });
      controller.start();
      controller.update(0.4);
      expect(controller.getCurrentStateName()).to.be('A');
      controller.update(0.2);
      expect(controller.getCurrentStateName()).to.be('B');
    });

    it('waits for both the exit time and the conditions', () => {
      const { controller } = createController({
        parameters: [{ name: 'Fire', type: 'trigger', defaultValue: false }],
        states: [
          {
            id: 'a',
            name: 'A',
            transitions: [
              {
                id: 't1',
                targetStateId: 'b',
                hasExitTime: true,
                exitTime: 0.5,
                conditions: [
                  { parameterName: 'Fire', operator: 'isSet', value: 0 },
                ],
              },
            ],
          },
          { id: 'b', name: 'B', transitions: [] },
        ],
        entryStateId: 'a',
      });
      controller.start();
      // Exit time is passed, but the trigger is not set.
      controller.update(1);
      expect(controller.getCurrentStateName()).to.be('A');
      // The trigger is set after the exit time: the transition fires.
      controller.triggerParameter('Fire');
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('B');
    });

    it('consumes triggers used by a fired transition', () => {
      const { controller } = createController({
        parameters: [{ name: 'Fire', type: 'trigger', defaultValue: false }],
        states: [
          {
            id: 'a',
            name: 'A',
            transitions: [
              {
                id: 't1',
                targetStateId: 'b',
                hasExitTime: false,
                conditions: [
                  { parameterName: 'Fire', operator: 'isSet', value: 0 },
                ],
              },
            ],
          },
          {
            id: 'b',
            name: 'B',
            transitions: [
              {
                id: 't2',
                targetStateId: 'a',
                hasExitTime: false,
                conditions: [
                  { parameterName: 'Fire', operator: 'isSet', value: 0 },
                ],
              },
            ],
          },
        ],
        entryStateId: 'a',
      });
      controller.start();
      controller.triggerParameter('Fire');
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('B');
      // The trigger was consumed: no immediate transition back to A.
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('B');
    });

    it('checks numeric conditions operators', () => {
      const { controller } = createController({
        parameters: [{ name: 'Speed', type: 'number', defaultValue: 0 }],
        states: [
          {
            id: 'a',
            name: 'A',
            transitions: [
              {
                id: 't1',
                targetStateId: 'b',
                hasExitTime: false,
                conditions: [
                  { parameterName: 'Speed', operator: '>=', value: 5 },
                ],
              },
            ],
          },
          { id: 'b', name: 'B', transitions: [] },
        ],
        entryStateId: 'a',
      });
      controller.start();
      controller.setNumberParameter('Speed', 4.9);
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('A');
      controller.setNumberParameter('Speed', 5);
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('B');
    });

    it('checks boolean conditions operators', () => {
      const { controller } = createController({
        parameters: [{ name: 'Grounded', type: 'boolean', defaultValue: true }],
        states: [
          {
            id: 'a',
            name: 'A',
            transitions: [
              {
                id: 't1',
                targetStateId: 'b',
                hasExitTime: false,
                conditions: [
                  { parameterName: 'Grounded', operator: 'isFalse', value: 0 },
                ],
              },
            ],
          },
          { id: 'b', name: 'B', transitions: [] },
        ],
        entryStateId: 'a',
      });
      controller.start();
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('A');
      controller.setBooleanParameter('Grounded', false);
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('B');
    });

    it('blocks other transitions while a pending transition forbids interruptions', () => {
      const { controller } = createController({
        states: [
          {
            id: 'a',
            name: 'A',
            transitions: [
              {
                id: 't1',
                targetStateId: 'b',
                hasExitTime: true,
                exitTime: 1,
                interruptionSource: 'none',
                conditions: [],
              },
              {
                id: 't2',
                targetStateId: 'c',
                hasExitTime: false,
                conditions: [],
              },
            ],
          },
          { id: 'b', name: 'B', transitions: [] },
          { id: 'c', name: 'C', transitions: [] },
        ],
        entryStateId: 'a',
      });
      controller.start();
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('A');
      // t1 is pending and blocks t2...
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('A');
      // ...until its exit time is reached.
      controller.update(1);
      expect(controller.getCurrentStateName()).to.be('B');
    });

    it('lets other transitions interrupt a pending transition when allowed', () => {
      const { controller } = createController({
        states: [
          {
            id: 'a',
            name: 'A',
            transitions: [
              {
                id: 't1',
                targetStateId: 'b',
                hasExitTime: true,
                exitTime: 1,
                interruptionSource: 'current',
                conditions: [],
              },
              {
                id: 't2',
                targetStateId: 'c',
                hasExitTime: false,
                conditions: [],
              },
            ],
          },
          { id: 'b', name: 'B', transitions: [] },
          { id: 'c', name: 'C', transitions: [] },
        ],
        entryStateId: 'a',
      });
      controller.start();
      controller.update(0);
      // t1 is pending but allows interruptions: t2 fires immediately.
      controller.update(0);
      expect(controller.getCurrentStateName()).to.be('C');
    });

    it('chains transitions to the destination state when allowed', () => {
      const { controller } = createController({
        states: [
          {
            id: 'a',
            name: 'A',
            transitions: [
              {
                id: 't1',
                targetStateId: 'b',
                hasExitTime: false,
                interruptionSource: 'next',
                conditions: [],
              },
            ],
          },
          {
            id: 'b',
            name: 'B',
            transitions: [
              {
                id: 't2',
                targetStateId: 'c',
                hasExitTime: false,
                conditions: [],
              },
            ],
          },
          { id: 'c', name: 'C', transitions: [] },
        ],
        entryStateId: 'a',
      });
      controller.start();
      controller.update(0);
      // The whole chain A -> B -> C is followed in a single update.
      expect(controller.getCurrentStateName()).to.be('C');
    });

    it('resets the normalized time when entering a new state', () => {
      const { controller } = createController({
        states: [
          {
            id: 'a',
            name: 'A',
            transitions: [
              {
                id: 't1',
                targetStateId: 'b',
                hasExitTime: false,
                conditions: [],
              },
            ],
          },
          {
            id: 'b',
            name: 'B',
            transitions: [
              {
                id: 't2',
                targetStateId: 'c',
                hasExitTime: true,
                exitTime: 1,
                conditions: [],
              },
            ],
          },
          { id: 'c', name: 'C', transitions: [] },
        ],
        entryStateId: 'a',
      });
      controller.start();
      controller.update(0.9);
      expect(controller.getCurrentStateName()).to.be('B');
      // The exit time of 1 is counted from the entrance in B.
      controller.update(0.5);
      expect(controller.getCurrentStateName()).to.be('B');
      controller.update(0.6);
      expect(controller.getCurrentStateName()).to.be('C');
    });

    it('can jump to a state with setStateByName', () => {
      const { controller } = createController({
        states: [
          { id: 'a', name: 'A', transitions: [] },
          { id: 'b', name: 'B', transitions: [] },
        ],
        entryStateId: 'a',
      });
      controller.start();
      expect(controller.setStateByName('B')).to.be(true);
      expect(controller.getCurrentStateName()).to.be('B');
      expect(controller.setStateByName('Missing')).to.be(false);
      expect(controller.getCurrentStateName()).to.be('B');
    });

    describe('Any State', () => {
      it('fires transitions from any state', () => {
        const { controller } = createController({
          parameters: [{ name: 'Dead', type: 'trigger', defaultValue: false }],
          states: [
            { id: 'a', name: 'A', transitions: [] },
            {
              id: 'b',
              name: 'B',
              transitions: [
                {
                  id: 't1',
                  targetStateId: 'a',
                  hasExitTime: false,
                  conditions: [],
                },
              ],
            },
            { id: 'die', name: 'Die', transitions: [] },
          ],
          anyState: {
            x: 0,
            y: 0,
            transitions: [
              {
                id: 'any1',
                targetStateId: 'die',
                hasExitTime: false,
                canTransitionToSelf: false,
                conditions: [
                  { parameterName: 'Dead', operator: 'isSet', value: 0 },
                ],
              },
            ],
          },
          entryStateId: 'a',
        });
        controller.start();
        // From state A.
        controller.triggerParameter('Dead');
        controller.update(0);
        expect(controller.getCurrentStateName()).to.be('Die');
      });

      it('is checked before the transitions of the current state', () => {
        const { controller } = createController({
          parameters: [{ name: 'Go', type: 'trigger', defaultValue: false }],
          states: [
            {
              id: 'a',
              name: 'A',
              transitions: [
                {
                  id: 't1',
                  targetStateId: 'b',
                  hasExitTime: false,
                  conditions: [
                    { parameterName: 'Go', operator: 'isSet', value: 0 },
                  ],
                },
              ],
            },
            { id: 'b', name: 'B', transitions: [] },
            { id: 'c', name: 'C', transitions: [] },
          ],
          anyState: {
            x: 0,
            y: 0,
            transitions: [
              {
                id: 'any1',
                targetStateId: 'c',
                hasExitTime: false,
                canTransitionToSelf: false,
                conditions: [
                  { parameterName: 'Go', operator: 'isSet', value: 0 },
                ],
              },
            ],
          },
          entryStateId: 'a',
        });
        controller.start();
        controller.triggerParameter('Go');
        controller.update(0);
        // The Any State transition won over the state transition.
        expect(controller.getCurrentStateName()).to.be('C');
      });

      it('does not fire to the current state when self transitions are disabled', () => {
        const { controller } = createController({
          parameters: [{ name: 'Go', type: 'trigger', defaultValue: false }],
          states: [
            { id: 'a', name: 'A', transitions: [] },
            { id: 'b', name: 'B', transitions: [] },
          ],
          anyState: {
            x: 0,
            y: 0,
            transitions: [
              {
                id: 'any1',
                targetStateId: 'a',
                hasExitTime: false,
                canTransitionToSelf: false,
                conditions: [
                  { parameterName: 'Go', operator: 'isSet', value: 0 },
                ],
              },
            ],
          },
          entryStateId: 'a',
        });
        controller.start();
        controller.triggerParameter('Go');
        controller.update(0);
        // Already in A: the self transition is ignored.
        expect(controller.getCurrentStateName()).to.be('A');
        // ...but it fires from another state.
        controller.setStateByName('B');
        controller.triggerParameter('Go');
        controller.update(0);
        expect(controller.getCurrentStateName()).to.be('A');
      });
    });

    describe('Sub-state machines', () => {
      it('enters the entry state when a transition targets the sub-state machine', () => {
        const { controller } = createController({
          states: [
            {
              id: 'a',
              name: 'A',
              transitions: [
                {
                  id: 't1',
                  // The transition targets the sub-state machine itself: the
                  // runtime resolves it to the entry state of the machine.
                  targetStateId: '',
                  targetSubMachineId: 'grounded',
                  hasExitTime: false,
                  conditions: [],
                },
              ],
            },
            {
              id: 'walk',
              name: 'Walk',
              subMachineId: 'grounded',
              transitions: [],
            },
            {
              id: 'run',
              name: 'Run',
              subMachineId: 'grounded',
              transitions: [],
            },
          ],
          subMachines: [
            {
              id: 'grounded',
              name: 'Grounded',
              x: 0,
              y: 0,
              entryStateId: 'walk',
            },
          ],
          entryStateId: 'a',
        });
        controller.start();
        controller.update(0);
        expect(controller.getCurrentStateName()).to.be('Walk');
      });
    });
  });

  describe('AnimationStateMachineRuntimeBehavior', () => {
    const machineData = {
      parameters: [
        { name: 'Speed', type: 'number', defaultValue: 0 },
        { name: 'Fire', type: 'trigger', defaultValue: false },
      ],
      states: [
        {
          id: 'idle',
          name: 'Idle',
          animationName: 'Idle',
          speed: 1,
          restartAnimationOnEnter: true,
          transitions: [
            {
              id: 't1',
              targetStateId: 'run',
              hasExitTime: false,
              interruptionSource: 'none',
              conditions: [{ parameterName: 'Speed', operator: '>', value: 0 }],
            },
            {
              id: 't2',
              targetStateId: 'idle',
              hasExitTime: true,
              exitTime: 0.5,
              interruptionSource: 'none',
              conditions: [
                { parameterName: 'Fire', operator: 'isSet', value: 0 },
              ],
            },
          ],
        },
        {
          id: 'run',
          name: 'Run',
          animationName: 'Run',
          speed: 1,
          restartAnimationOnEnter: true,
          transitions: [
            {
              id: 't3',
              targetStateId: 'idle',
              hasExitTime: true,
              exitTime: 0.5,
              interruptionSource: 'none',
              conditions: [
                { parameterName: 'Speed', operator: '<=', value: 0 },
              ],
            },
          ],
        },
      ],
      entryStateId: 'idle',
    };

    it('plays the animation of the entry state', () => {
      const runtimeScene = createScene();
      const object = addSprite(runtimeScene, machineData);
      const behavior = object.getBehavior(behaviorName);
      expect(object.getAnimationName()).to.be('Idle');
      expect(behavior.getCurrentStateName()).to.be('Idle');
      expect(behavior.isInState('Idle')).to.be(true);
    });

    it('switches animation when a transition fires', () => {
      const runtimeScene = createScene();
      const object = addSprite(runtimeScene, machineData);
      const behavior = object.getBehavior(behaviorName);

      behavior.setNumberParameter('Speed', 10);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getAnimationName()).to.be('Run');
      expect(behavior.getCurrentStateName()).to.be('Run');
      expect(behavior.getNumberParameter('Speed')).to.be(10);
    });

    it('waits for the exit time (in animation frames) before switching', () => {
      const runtimeScene = createScene();
      const object = addSprite(runtimeScene, machineData);
      const behavior = object.getBehavior(behaviorName);

      behavior.setNumberParameter('Speed', 10);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getAnimationName()).to.be('Run');
      // The exit time of 0.5 on the "Run" state is reached after the first
      // animation frame changed (2 frames of 0.1 second each).
      behavior.setNumberParameter('Speed', 0);
      for (let i = 0; i < 3; i++) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(behavior.getCurrentStateName()).to.be('Run');
      for (let i = 0; i < 20; i++) {
        runtimeScene.renderAndStep(1000 / 60);
      }
      expect(behavior.getCurrentStateName()).to.be('Idle');
    });

    it('supports boolean parameters', () => {
      const runtimeScene = createScene();
      const object = addSprite(runtimeScene, {
        parameters: [{ name: 'Grounded', type: 'boolean', defaultValue: true }],
        states: [{ id: 'idle', name: 'Idle', animationName: 'Idle', transitions: [] }],
        entryStateId: 'idle',
      });
      const behavior = object.getBehavior(behaviorName);

      expect(behavior.isBooleanParameterSet('Grounded')).to.be(true);
      behavior.setBooleanParameter('Grounded', false);
      expect(behavior.isBooleanParameterSet('Grounded')).to.be(false);
      behavior.toggleBooleanParameter('Grounded');
      expect(behavior.isBooleanParameterSet('Grounded')).to.be(true);
    });

    it('can change the state from the events', () => {
      const runtimeScene = createScene();
      const object = addSprite(runtimeScene, machineData);
      const behavior = object.getBehavior(behaviorName);

      behavior.changeState('Run');
      expect(object.getAnimationName()).to.be('Run');
      expect(behavior.getCurrentStateName()).to.be('Run');
    });

    it('applies new behavior data on hot-reload while keeping the current state', () => {
      const runtimeScene = createScene();
      const object = addSprite(runtimeScene, machineData);
      const behavior = object.getBehavior(behaviorName);
      behavior.changeState('Run');
      expect(behavior.getCurrentStateName()).to.be('Run');

      // New data where the "Run" state plays the "Idle" animation.
      const newMachineData = JSON.parse(JSON.stringify(machineData));
      newMachineData.states.find(state => state.name === 'Run').animationName =
        'Idle';
      const applied = behavior.applyBehaviorOverriding({
        stateMachineData: JSON.stringify(newMachineData),
      });
      expect(applied).to.be(true);
      // The behavior stays in the same state...
      expect(behavior.getCurrentStateName()).to.be('Run');
      // ...and the new data is applied (Run now plays the Idle animation).
      expect(object.getAnimationName()).to.be('Idle');

      // Invalid data is rejected.
      expect(
        behavior.applyBehaviorOverriding({ stateMachineData: 'not json' })
      ).to.be(false);
    });

    it('publishes the state changes to the events (just entered/left)', () => {
      const runtimeScene = createScene();
      const object = addSprite(runtimeScene, machineData);
      const behavior = object.getBehavior(behaviorName);

      // The state machine starts on "Idle": the events of the first frame
      // see the initial entry.
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.hasJustEnteredStateNamed('Idle')).to.be(true);
      expect(behavior.hasJustExitedStateNamed('Idle')).to.be(false);
      expect(behavior.hasJustChangedState()).to.be(true);

      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.hasJustChangedState()).to.be(false);

      // Change the state (like an action would do during the events).
      behavior.changeState('Run');
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.hasJustEnteredStateNamed('Run')).to.be(true);
      expect(behavior.hasJustExitedStateNamed('Idle')).to.be(true);
      expect(behavior.getPreviousStateName()).to.be('Idle');
      expect(behavior.hasJustEnteredStateNamed('Idle')).to.be(false);

      // The change is only visible during one frame.
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.hasJustChangedState()).to.be(false);
    });

    it('drives the animation and its speed with blend trees', () => {
      const runtimeScene = createScene();
      const blendMachine = {
        parameters: [{ name: 'Speed', type: 'number', defaultValue: 0 }],
        states: [
          {
            id: 'locomotion',
            name: 'Locomotion',
            animationName: '',
            speed: 1,
            restartAnimationOnEnter: true,
            x: 0,
            y: 0,
            transitions: [],
            blendTree: {
              parameterName: 'Speed',
              children: [
                { animationName: 'Idle', threshold: 0, speed: 1 },
                { animationName: 'Run', threshold: 1, speed: 2 },
              ],
            },
          },
        ],
        entryStateId: 'locomotion',
      };
      const object = addSprite(runtimeScene, blendMachine);
      const behavior = object.getBehavior(behaviorName);

      // The value 0 plays the first animation.
      expect(object.getAnimationName()).to.be('Idle');
      expect(object.getAnimationSpeedScale()).to.be(1);

      // A value between the thresholds plays the closest animation with a
      // blended speed (1 + (2 - 1) * 0.4 = 1.4).
      behavior.setNumberParameter('Speed', 0.4);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getAnimationName()).to.be('Idle');
      expect(object.getAnimationSpeedScale()).to.be.above(1.35);
      expect(object.getAnimationSpeedScale()).to.be.below(1.45);

      // The maximum value plays the last animation with its speed.
      behavior.setNumberParameter('Speed', 1);
      runtimeScene.renderAndStep(1000 / 60);
      expect(object.getAnimationName()).to.be('Run');
      expect(object.getAnimationSpeedScale()).to.be(2);
    });
  });
});
