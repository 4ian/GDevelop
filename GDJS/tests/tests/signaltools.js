// @ts-check

describe('gdjs.evtTools.signal', () => {
  const signalCalls = [];
  const signalParameterCalls = [];
  const signalReceiverIds = [];

  before(() => {
    const SignalTestRuntimeObject = class SignalTestRuntimeObject extends gdjs.TestRuntimeObject {
      onSignal(signalName, payload, emitterObjectName, emitterInstanceId) {
        const runtimeScene = this.getRuntimeScene();
        const signalNameFromContext =
          gdjs.evtTools.signal.getSignalName(runtimeScene);
        const payloadFromContext =
          gdjs.evtTools.signal.getSignalPayloadString(runtimeScene);
        signalParameterCalls.push({
          receiver: this.getName(),
          signalName,
          payload,
          emitterObjectName,
          emitterInstanceId,
        });
        signalReceiverIds.push({
          receiver: this.getName(),
          receiverId: this.getUniqueId(),
          signalName,
        });
        signalCalls.push({
          receiver: this.getName(),
          signalName: signalNameFromContext,
          payload: payloadFromContext,
        });
        if (signalNameFromContext === 'First') {
          gdjs.evtTools.signal.emitSceneSignal(
            runtimeScene,
            'Second',
            '2',
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
          payload,
          emitterObjectName,
          emitterInstanceId,
        });
        signalReceiverIds.push({
          receiver: this.owner.getName() + '.' + this.getName(),
          receiverId: this.owner.getUniqueId(),
          signalName,
        });
        signalCalls.push({
          receiver: this.owner.getName() + '.' + this.getName(),
          signalName: gdjs.evtTools.signal.getSignalName(
            this.owner.getRuntimeScene()
          ),
          payload: gdjs.evtTools.signal.getSignalPayloadString(
            this.owner.getRuntimeScene()
          ),
        });
      }
    };
    gdjs.registerBehavior('SignalTest::Behavior', SignalTestRuntimeBehavior);
  });

  beforeEach(() => {
    signalCalls.length = 0;
    signalParameterCalls.length = 0;
    signalReceiverIds.length = 0;
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
      gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Ping', '7');

      expect(gdjs.evtTools.signal.isSignalReceived(runtimeScene, 'Ping')).to.be(
        false
      );
      expect(signalCalls.length).to.be(0);
    });

    runtimeScene.renderAndStepWithEventsFunction(16, () => {
      expect(gdjs.evtTools.signal.isSignalReceived(runtimeScene, 'Ping')).to.be(
        true
      );
      expect(gdjs.evtTools.signal.getSignalPayloadNumber(runtimeScene)).to.be(
        7
      );
      signalCalls.push({
        receiver: 'scene',
        signalName: gdjs.evtTools.signal.getSignalName(runtimeScene),
        payload: gdjs.evtTools.signal.getSignalPayloadString(runtimeScene),
      });
    });

    expect(signalCalls).to.eql([
      { receiver: 'Receiver', signalName: 'Ping', payload: '7' },
      { receiver: 'Receiver.Listener', signalName: 'Ping', payload: '7' },
      { receiver: 'scene', signalName: 'Ping', payload: '7' },
    ]);
    expect(signalParameterCalls).to.eql([
      {
        receiver: 'Receiver',
        signalName: 'Ping',
        payload: '7',
        emitterObjectName: '',
        emitterInstanceId: -1,
      },
      {
        receiver: 'Receiver.Listener',
        signalName: 'Ping',
        payload: '7',
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
      { receiver: 'Receiver', signalName: 'NoPayload', payload: '' },
      { receiver: 'Receiver.Listener', signalName: 'NoPayload', payload: '' },
    ]);
    expect(signalParameterCalls).to.eql([
      {
        receiver: 'Receiver',
        signalName: 'NoPayload',
        payload: '',
        emitterObjectName: '',
        emitterInstanceId: -1,
      },
      {
        receiver: 'Receiver.Listener',
        signalName: 'NoPayload',
        payload: '',
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
        payload: '',
        emitterObjectName: 'Emitter',
        emitterInstanceId: emitter.getUniqueId(),
      },
      {
        receiver: 'Receiver.Listener',
        signalName: 'WithSender',
        payload: '',
        emitterObjectName: 'Emitter',
        emitterInstanceId: emitter.getUniqueId(),
      },
    ]);
  });

  it('dispatches signals emitted by receivers in the same FIFO cycle', () => {
    const runtimeScene = createSignalRuntimeScene();

    runtimeScene.renderAndStepWithEventsFunction(16, () => {
      gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'First', '1');
    });

    runtimeScene.renderAndStepWithEventsFunction(16, () => {
      expect(
        gdjs.evtTools.signal.isSignalReceived(runtimeScene, 'First')
      ).to.be(true);
      signalCalls.push({
        receiver: 'scene',
        signalName: gdjs.evtTools.signal.getSignalName(runtimeScene),
        payload: gdjs.evtTools.signal.getSignalPayloadString(runtimeScene),
      });

      expect(
        gdjs.evtTools.signal.isSignalReceived(runtimeScene, 'Second')
      ).to.be(true);
      signalCalls.push({
        receiver: 'scene',
        signalName: gdjs.evtTools.signal.getSignalName(runtimeScene),
        payload: gdjs.evtTools.signal.getSignalPayloadString(runtimeScene),
      });
    });

    expect(signalCalls).to.eql([
      { receiver: 'Receiver', signalName: 'First', payload: '1' },
      { receiver: 'Receiver.Listener', signalName: 'First', payload: '1' },
      { receiver: 'Receiver', signalName: 'Second', payload: '2' },
      { receiver: 'Receiver.Listener', signalName: 'Second', payload: '2' },
      { receiver: 'scene', signalName: 'First', payload: '1' },
      { receiver: 'scene', signalName: 'Second', payload: '2' },
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
        payload: '2',
        emitterObjectName: 'Receiver',
      },
      {
        receiver: 'Receiver.Listener',
        signalName: 'Second',
        payload: '2',
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

    gdjs.evtTools.signal.emitSignalToObject(
      runtimeScene,
      'OtherReceiver',
      'ObjectOnly',
      '3'
    );

    gdjs.evtTools.signal.emitSignalToObjectGroup(
      runtimeScene,
      'Receivers',
      'Group',
      '4'
    );

    gdjs.evtTools.signal.emitSignalToBehavior(
      runtimeScene,
      'Receiver',
      'Listener',
      'BehaviorOnly',
      '5'
    );

    runtimeScene.renderAndStepWithEventsFunction(16, () => {});

    expect(signalCalls).to.eql([
      { receiver: 'OtherReceiver', signalName: 'ObjectOnly', payload: '3' },
      { receiver: 'Receiver', signalName: 'Group', payload: '4' },
      { receiver: 'Receiver.Listener', signalName: 'Group', payload: '4' },
      { receiver: 'OtherReceiver', signalName: 'Group', payload: '4' },
      {
        receiver: 'Receiver.Listener',
        signalName: 'BehaviorOnly',
        payload: '5',
      },
    ]);
  });

  it('targets one object instance by unique id', () => {
    const runtimeScene = createSignalRuntimeScene();
    const firstReceiver = runtimeScene.getObjects('Receiver')[0];
    const secondReceiver = runtimeScene.createObject('Receiver');
    const objectsLists = new Hashtable();
    objectsLists.put('Receiver', []);

    gdjs.evtTools.signal.emitSignalToObjectInstance(
      runtimeScene,
      objectsLists,
      secondReceiver.getUniqueId(),
      'InstanceOnly'
    );

    runtimeScene.renderAndStepWithEventsFunction(16, () => {});

    expect(signalCalls).to.eql([
      { receiver: 'Receiver', signalName: 'InstanceOnly', payload: '' },
      { receiver: 'Receiver.Listener', signalName: 'InstanceOnly', payload: '' },
    ]);
    expect(signalReceiverIds).to.eql([
      {
        receiver: 'Receiver',
        receiverId: secondReceiver.getUniqueId(),
        signalName: 'InstanceOnly',
      },
      {
        receiver: 'Receiver.Listener',
        receiverId: secondReceiver.getUniqueId(),
        signalName: 'InstanceOnly',
      },
    ]);
    expect(
      signalReceiverIds.some(
        ({ receiverId }) => receiverId === firstReceiver.getUniqueId()
      )
    ).to.be(false);
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

  it('records signal animation debug points only when enabled', () => {
    const runtimeScene = createSignalRuntimeScene();
    runtimeScene.registerObject({
      name: 'Sender',
      type: 'SignalTest::Object',
      variables: [],
      behaviors: [],
      effects: [],
    });
    const sender = runtimeScene.createObject('Sender');
    const receiver = runtimeScene.getObjects('Receiver')[0];
    sender.setPosition(10, 20);
    receiver.setPosition(90, 40);

    gdjs.evtTools.signal.emitSignalToObject(
      runtimeScene,
      'Receiver',
      'Pulse',
      'payload',
      sender
    );
    runtimeScene.renderAndStepWithEventsFunction(16, () => {});

    expect(runtimeScene.getSignalBus().getSignalAnimationDebugRecords()).to.eql(
      []
    );

    runtimeScene.enableSignalAnimationDebugDraw(true);
    gdjs.evtTools.signal.emitSignalToObject(
      runtimeScene,
      'Receiver',
      'Pulse',
      'payload',
      sender
    );
    runtimeScene.renderAndStepWithEventsFunction(16, () => {});

    const records = runtimeScene.getSignalBus().getSignalAnimationDebugRecords();
    expect(records.length).to.be(1);
    expect(records[0].name).to.be('Pulse');
    expect(records[0].source.objectName).to.be('Sender');
    expect(records[0].source.objectId).to.be(sender.getUniqueId());
    expect(records[0].receivers.map(({ receiverName }) => receiverName)).to.eql(
      ['Receiver', 'Receiver.*(1)']
    );
    records[0].receivers.forEach(receiverRecord => {
      expect(receiverRecord.objectName).to.be('Receiver');
      expect(receiverRecord.objectId).to.be(receiver.getUniqueId());
      expect(receiverRecord.x).to.be(receiver.getCenterXInScene());
      expect(receiverRecord.y).to.be(receiver.getCenterYInScene());
    });
  });

  it('records scene signal animations as scene receivers', () => {
    const runtimeScene = createSignalRuntimeScene();
    runtimeScene.registerObject({
      name: 'Sender',
      type: 'SignalTest::Object',
      variables: [],
      behaviors: [],
      effects: [],
    });
    const sender = runtimeScene.createObject('Sender');
    sender.setPosition(10, 20);
    runtimeScene.getSignalBus().refreshReceiverIndex(runtimeScene);
    runtimeScene.enableSignalAnimationDebugDraw(true);

    gdjs.evtTools.signal.emitSceneSignal(
      runtimeScene,
      'ScenePulse',
      'payload',
      sender
    );
    runtimeScene.renderAndStepWithEventsFunction(16, () => {
      const signal = gdjs.evtTools.signal.getDeliveredSignals(
        runtimeScene,
        'ScenePulse'
      )[0];
      gdjs.evtTools.signal.recordSceneSignalReceived(runtimeScene, signal);
    });

    const records = runtimeScene.getSignalBus().getSignalAnimationDebugRecords();
    expect(records.length).to.be(1);
    expect(records[0].name).to.be('ScenePulse');
    expect(records[0].source.objectName).to.be('Sender');
    expect(records[0].receivers.map(({ receiverName }) => receiverName)).to.eql(
      ['scene']
    );
  });
});
