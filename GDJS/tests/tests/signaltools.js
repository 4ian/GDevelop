// @ts-check

describe('gdjs.evtTools.signal', () => {
  const signalCalls = [];
  const signalParameterCalls = [];

  before(() => {
    const SignalTestRuntimeObject = class SignalTestRuntimeObject extends gdjs.TestRuntimeObject {
      onSignal(signalName, payload, emitterObjectName, emitterInstanceId) {
        const runtimeScene = this.getRuntimeScene();
        const signalNameFromContext =
          gdjs.evtTools.signal.getSignalName(runtimeScene);
        const payloadFromContext = gdjs.evtTools.signal.getSignalPayloadNumber(
          runtimeScene,
          'value'
        );
        signalParameterCalls.push({
          receiver: this.getName(),
          signalName,
          payload:
            payload && payload.getType() === 'structure'
              ? payload.getChild('value').getAsNumber()
              : 0,
          emitterObjectName,
          emitterInstanceId,
        });
        signalCalls.push({
          receiver: this.getName(),
          signalName: signalNameFromContext,
          payload: payloadFromContext,
        });
        if (signalNameFromContext === 'First') {
          const nextPayload = new gdjs.Variable({ type: 'structure' });
          nextPayload.getChild('value').setNumber(2);
          gdjs.evtTools.signal.emitSceneSignal(
            runtimeScene,
            'Second',
            nextPayload,
            this
          );
        }
      }
    };
    gdjs.registerObject('SignalTest::Object', SignalTestRuntimeObject);

    const SignalTestRuntimeBehavior = class SignalTestRuntimeBehavior extends gdjs.RuntimeBehavior {
      onSignal(signalName, payload, emitterObjectName, emitterInstanceId) {
        signalParameterCalls.push({
          receiver: this.owner.getName() + '.' + this.getName(),
          signalName,
          payload:
            payload && payload.getType() === 'structure'
              ? payload.getChild('value').getAsNumber()
              : 0,
          emitterObjectName,
          emitterInstanceId,
        });
        signalCalls.push({
          receiver: this.owner.getName() + '.' + this.getName(),
          signalName: gdjs.evtTools.signal.getSignalName(
            this.owner.getRuntimeScene()
          ),
          payload: gdjs.evtTools.signal.getSignalPayloadNumber(
            this.owner.getRuntimeScene(),
            'value'
          ),
        });
      }
    };
    gdjs.registerBehavior('SignalTest::Behavior', SignalTestRuntimeBehavior);
  });

  beforeEach(() => {
    signalCalls.length = 0;
    signalParameterCalls.length = 0;
  });

  const createSignalRuntimeScene = () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene.registerObject({
      name: 'Receiver',
      type: 'SignalTest::Object',
      variables: [],
      behaviors: [
        {
          name: 'Listener',
          type: 'SignalTest::Behavior',
        },
      ],
      effects: [],
    });
    runtimeScene.createObject('Receiver');
    runtimeScene.getSignalBus().refreshReceiverIndex(runtimeScene);
    return runtimeScene;
  };

  it('queues signals until the next pre-events step and exposes their payload', () => {
    const runtimeScene = createSignalRuntimeScene();

    runtimeScene.renderAndStepWithEventsFunction(16, () => {
      const payload = new gdjs.Variable({ type: 'structure' });
      payload.getChild('value').setNumber(7);
      gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Ping', payload);
      payload.getChild('value').setNumber(99);

      expect(gdjs.evtTools.signal.isSignalReceived(runtimeScene, 'Ping')).to.be(
        false
      );
      expect(signalCalls.length).to.be(0);
    });

    runtimeScene.renderAndStepWithEventsFunction(16, () => {
      expect(gdjs.evtTools.signal.isSignalReceived(runtimeScene, 'Ping')).to.be(
        true
      );
      signalCalls.push({
        receiver: 'scene',
        signalName: gdjs.evtTools.signal.getSignalName(runtimeScene),
        payload: gdjs.evtTools.signal.getSignalPayloadNumber(
          runtimeScene,
          'value'
        ),
      });
    });

    expect(signalCalls).to.eql([
      { receiver: 'Receiver', signalName: 'Ping', payload: 7 },
      { receiver: 'Receiver.Listener', signalName: 'Ping', payload: 7 },
      { receiver: 'scene', signalName: 'Ping', payload: 7 },
    ]);
    expect(signalParameterCalls).to.eql([
      {
        receiver: 'Receiver',
        signalName: 'Ping',
        payload: 7,
        emitterObjectName: '',
        emitterInstanceId: -1,
      },
      {
        receiver: 'Receiver.Listener',
        signalName: 'Ping',
        payload: 7,
        emitterObjectName: '',
        emitterInstanceId: -1,
      },
    ]);
  });

  it('captures picked objects without reusing the caller picking list', () => {
    const runtimeScene = createSignalRuntimeScene();
    runtimeScene.registerObject({
      name: 'OtherReceiver',
      type: 'SignalTest::Object',
      variables: [],
      behaviors: [],
      effects: [],
    });
    runtimeScene.createObject('OtherReceiver');
    runtimeScene.getSignalBus().refreshReceiverIndex(runtimeScene);

    const objectsLists = new Hashtable();
    objectsLists.put('Receiver', runtimeScene.getObjects('Receiver').slice());

    gdjs.evtTools.signal.emitSignalToPickedObjects(
      runtimeScene,
      objectsLists,
      'Picked'
    );
    objectsLists.put(
      'OtherReceiver',
      runtimeScene.getObjects('OtherReceiver').slice()
    );
    objectsLists.get('Receiver').length = 0;

    runtimeScene.renderAndStepWithEventsFunction(16, () => {});

    expect(signalCalls.map(({ receiver }) => receiver)).to.eql([
      'Receiver',
      'Receiver.Listener',
    ]);
  });

  it('treats an omitted payload placeholder as no payload', () => {
    const runtimeScene = createSignalRuntimeScene();
    const objectsLists = new Hashtable();
    objectsLists.put('Receiver', runtimeScene.getObjects('Receiver').slice());

    gdjs.evtTools.signal.emitSignalToPickedObjects(
      runtimeScene,
      objectsLists,
      'NoPayload',
      gdjs.VariablesContainer.badVariable
    );

    runtimeScene.renderAndStepWithEventsFunction(16, () => {});

    expect(signalCalls).to.eql([
      { receiver: 'Receiver', signalName: 'NoPayload', payload: 0 },
      { receiver: 'Receiver.Listener', signalName: 'NoPayload', payload: 0 },
    ]);
    expect(signalParameterCalls).to.eql([
      {
        receiver: 'Receiver',
        signalName: 'NoPayload',
        payload: 0,
        emitterObjectName: '',
        emitterInstanceId: -1,
      },
      {
        receiver: 'Receiver.Listener',
        signalName: 'NoPayload',
        payload: 0,
        emitterObjectName: '',
        emitterInstanceId: -1,
      },
    ]);
  });

  it('uses the first object in an object-list sender as the emitter', () => {
    const runtimeScene = createSignalRuntimeScene();
    runtimeScene.registerObject({
      name: 'Emitter',
      type: 'SignalTest::Object',
      variables: [],
      behaviors: [],
      effects: [],
    });
    const emitter = runtimeScene.createObject('Emitter');
    runtimeScene.getSignalBus().refreshReceiverIndex(runtimeScene);

    const targetObjectsLists = new Hashtable();
    targetObjectsLists.put(
      'Receiver',
      runtimeScene.getObjects('Receiver').slice()
    );

    const senderObjectsLists = new Hashtable();
    senderObjectsLists.put('Emitter', [emitter]);

    gdjs.evtTools.signal.emitSignalToPickedObjects(
      runtimeScene,
      targetObjectsLists,
      'WithSender',
      null,
      senderObjectsLists
    );

    runtimeScene.renderAndStepWithEventsFunction(16, () => {});

    expect(signalParameterCalls).to.eql([
      {
        receiver: 'Receiver',
        signalName: 'WithSender',
        payload: 0,
        emitterObjectName: 'Emitter',
        emitterInstanceId: emitter.getUniqueId(),
      },
      {
        receiver: 'Receiver.Listener',
        signalName: 'WithSender',
        payload: 0,
        emitterObjectName: 'Emitter',
        emitterInstanceId: emitter.getUniqueId(),
      },
    ]);
  });

  it('dispatches signals emitted by receivers in the same FIFO cycle', () => {
    const runtimeScene = createSignalRuntimeScene();

    runtimeScene.renderAndStepWithEventsFunction(16, () => {
      const payload = new gdjs.Variable({ type: 'structure' });
      payload.getChild('value').setNumber(1);
      gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'First', payload);
    });

    runtimeScene.renderAndStepWithEventsFunction(16, () => {
      expect(
        gdjs.evtTools.signal.isSignalReceived(runtimeScene, 'First')
      ).to.be(true);
      signalCalls.push({
        receiver: 'scene',
        signalName: gdjs.evtTools.signal.getSignalName(runtimeScene),
        payload: gdjs.evtTools.signal.getSignalPayloadNumber(
          runtimeScene,
          'value'
        ),
      });

      expect(
        gdjs.evtTools.signal.isSignalReceived(runtimeScene, 'Second')
      ).to.be(true);
      signalCalls.push({
        receiver: 'scene',
        signalName: gdjs.evtTools.signal.getSignalName(runtimeScene),
        payload: gdjs.evtTools.signal.getSignalPayloadNumber(
          runtimeScene,
          'value'
        ),
      });
    });

    expect(signalCalls).to.eql([
      { receiver: 'Receiver', signalName: 'First', payload: 1 },
      { receiver: 'Receiver.Listener', signalName: 'First', payload: 1 },
      { receiver: 'Receiver', signalName: 'Second', payload: 2 },
      { receiver: 'Receiver.Listener', signalName: 'Second', payload: 2 },
      { receiver: 'scene', signalName: 'First', payload: 1 },
      { receiver: 'scene', signalName: 'Second', payload: 2 },
    ]);
    expect(
      signalParameterCalls
        .filter(({ signalName }) => signalName === 'Second')
        .map(({ receiver, signalName, payload, emitterObjectName }) => ({
          receiver,
          signalName,
          payload,
          emitterObjectName,
        }))
    ).to.eql([
      {
        receiver: 'Receiver',
        signalName: 'Second',
        payload: 2,
        emitterObjectName: 'Receiver',
      },
      {
        receiver: 'Receiver.Listener',
        signalName: 'Second',
        payload: 2,
        emitterObjectName: 'Receiver',
      },
    ]);
    signalParameterCalls
      .filter(({ signalName }) => signalName === 'Second')
      .forEach(({ emitterInstanceId }) => {
        expect(emitterInstanceId).to.be.greaterThan(-1);
      });
  });

  it('targets objects, object groups and behaviors without broadcasting', () => {
    const runtimeScene = createSignalRuntimeScene();
    runtimeScene.registerObject({
      name: 'OtherReceiver',
      type: 'SignalTest::Object',
      variables: [],
      behaviors: [],
      effects: [],
    });
    runtimeScene.createObject('OtherReceiver');
    // @ts-ignore - Build a group directly without loading full scene data.
    runtimeScene._objectGroups.set('Receivers', ['Receiver', 'OtherReceiver']);
    runtimeScene.getSignalBus().refreshReceiverIndex(runtimeScene);

    const objectPayload = new gdjs.Variable({ type: 'structure' });
    objectPayload.getChild('value').setNumber(3);
    gdjs.evtTools.signal.emitSignalToObject(
      runtimeScene,
      'OtherReceiver',
      'ObjectOnly',
      objectPayload
    );

    const groupPayload = new gdjs.Variable({ type: 'structure' });
    groupPayload.getChild('value').setNumber(4);
    gdjs.evtTools.signal.emitSignalToObjectGroup(
      runtimeScene,
      'Receivers',
      'Group',
      groupPayload
    );

    const behaviorPayload = new gdjs.Variable({ type: 'structure' });
    behaviorPayload.getChild('value').setNumber(5);
    gdjs.evtTools.signal.emitSignalToBehavior(
      runtimeScene,
      'Receiver',
      'Listener',
      'BehaviorOnly',
      behaviorPayload
    );

    runtimeScene.renderAndStepWithEventsFunction(16, () => {});

    expect(signalCalls).to.eql([
      { receiver: 'OtherReceiver', signalName: 'ObjectOnly', payload: 3 },
      { receiver: 'Receiver', signalName: 'Group', payload: 4 },
      { receiver: 'Receiver.Listener', signalName: 'Group', payload: 4 },
      { receiver: 'OtherReceiver', signalName: 'Group', payload: 4 },
      {
        receiver: 'Receiver.Listener',
        signalName: 'BehaviorOnly',
        payload: 5,
      },
    ]);
  });

  it('drops deleted picked objects before dispatch', () => {
    const runtimeScene = createSignalRuntimeScene();
    const receiver = runtimeScene.getObjects('Receiver')[0];
    const objectsLists = new Hashtable();
    objectsLists.put('Receiver', [receiver]);

    gdjs.evtTools.signal.emitSignalToPickedObjects(
      runtimeScene,
      objectsLists,
      'Picked'
    );
    receiver.deleteFromScene();

    runtimeScene.renderAndStepWithEventsFunction(16, () => {});

    expect(signalCalls.length).to.be(0);
  });
});
