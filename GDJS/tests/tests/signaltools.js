// @ts-check

describe('gdjs.evtTools.signal', () => {
  const objectCalls = [];
  const behaviorCalls = [];

  before(() => {
    class SignalTestRuntimeObject extends gdjs.TestRuntimeObject {
      onSignal(signalName, payload) {
        objectCalls.push({
          receiver: this.getName(),
          receiverId: this.getUniqueId(),
          signalName,
          payload,
        });
        if (signalName === 'First') {
          gdjs.evtTools.signal.emitSceneSignal(
            this.getRuntimeScene(),
            'Second',
            'later'
          );
        }
      }
    }
    gdjs.registerObject('SignalTest::Object', SignalTestRuntimeObject);

    class SignalTestRuntimeBehavior extends gdjs.RuntimeBehavior {
      onSignal(signalName, payload) {
        behaviorCalls.push({
          receiver: this.getName(),
          ownerId: this.owner.getUniqueId(),
          signalName,
          payload,
        });
      }
    }
    gdjs.registerBehavior('SignalTest::Behavior', SignalTestRuntimeBehavior);
  });

  beforeEach(() => {
    objectCalls.length = 0;
    behaviorCalls.length = 0;
  });

  const objectData = (name, withBehavior = false) => ({
    name,
    type: 'SignalTest::Object',
    variables: [],
    behaviors: withBehavior
      ? [{ name: 'SignalBehavior', type: 'SignalTest::Behavior' }]
      : [],
    effects: [],
  });

  const createSignalRuntimeScene = () => {
    const runtimeScene = new gdjs.TestRuntimeScene(gdjs.getPixiRuntimeGame());
    runtimeScene.registerObject(objectData('Receiver', true));
    const receiver = runtimeScene.createObject('Receiver');
    if (!receiver) throw new Error('Unable to create signal test receiver.');
    return { runtimeScene, receiver };
  };

  const dispatchFrame = (runtimeScene) => {
    runtimeScene.renderAndStepWithEventsFunction(16, () => {});
  };

  it('delivers scene signals on the next frame and exposes them to scene events without a subscription', () => {
    const { runtimeScene } = createSignalRuntimeScene();

    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'LocaleChanged', 'fr');
    expect(
      gdjs.evtTools.signal.getDeliveredSceneSignals(
        runtimeScene,
        'LocaleChanged'
      )
    ).to.have.length(0);

    dispatchFrame(runtimeScene);
    const signals = gdjs.evtTools.signal.getDeliveredSceneSignals(
      runtimeScene,
      'LocaleChanged'
    );
    expect(signals).to.have.length(1);
    expect(objectCalls).to.have.length(0);
    expect(behaviorCalls).to.have.length(0);

    gdjs.evtTools.signal.setCurrentSignalForSceneCondition(
      runtimeScene,
      signals[0]
    );
    expect(
      gdjs.evtTools.signal.isSignalReceived(runtimeScene, 'LocaleChanged')
    ).to.be(true);
    expect(gdjs.evtTools.signal.getSignalName(runtimeScene)).to.be(
      'LocaleChanged'
    );
    expect(gdjs.evtTools.signal.getSignalPayload(runtimeScene)).to.be('fr');
    gdjs.evtTools.signal.clearCurrentSignalForSceneCondition(runtimeScene);

    expect(gdjs.evtTools.signal.getSignalName(runtimeScene)).to.be('');
    expect(gdjs.evtTools.signal.getSignalPayload(runtimeScene)).to.be('');
  });

  it('exposes a non-copying scene-only delivery batch', () => {
    const { runtimeScene, receiver } = createSignalRuntimeScene();

    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Scene', 'payload');
    gdjs.evtTools.signal.emitSignalToInstance(
      runtimeScene,
      receiver.getUniqueId(),
      'Direct',
      'ignored'
    );
    dispatchFrame(runtimeScene);

    const firstBatch =
      gdjs.evtTools.signal.getDeliveredSceneSignalBatch(runtimeScene);
    const secondRead =
      gdjs.evtTools.signal.getDeliveredSceneSignalBatch(runtimeScene);
    expect(secondRead).to.be(firstBatch);
    expect(firstBatch).to.have.length(1);
    expect(firstBatch[0].name).to.be('Scene');
  });

  it('captures signal aliases in long-lived asynchronous contexts', () => {
    const { runtimeScene } = createSignalRuntimeScene();
    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Captured', 'value');
    dispatchFrame(runtimeScene);
    const signal = gdjs.evtTools.signal.getDeliveredSceneSignalBatch(
      runtimeScene
    )[0];
    gdjs.evtTools.signal.setCurrentSignalForSceneCondition(
      runtimeScene,
      signal
    );

    const parent = new gdjs.LongLivedObjectsList();
    parent.backupSceneSignalContext(runtimeScene);
    const child = gdjs.LongLivedObjectsList.from(parent);
    gdjs.evtTools.signal.clearCurrentSignalForSceneCondition(runtimeScene);

    expect(parent.getSceneSignalName()).to.be('Captured');
    expect(parent.getSceneSignalPayload()).to.be('value');
    expect(child.getSceneSignalName()).to.be('Captured');
    expect(child.getSceneSignalPayload()).to.be('value');
  });

  it('notifies prefab and behavior instances only after their own exact subscriptions', () => {
    const { runtimeScene, receiver } = createSignalRuntimeScene();
    const behavior = receiver.getBehavior('SignalBehavior');

    gdjs.evtTools.signal.subscribeSceneSignal(
      runtimeScene,
      receiver,
      'LocaleChanged'
    );
    gdjs.evtTools.signal.subscribeSceneSignal(
      runtimeScene,
      behavior,
      'LocaleChanged'
    );
    // Repeating a subscription is idempotent.
    gdjs.evtTools.signal.subscribeSceneSignal(
      runtimeScene,
      receiver,
      'LocaleChanged'
    );
    gdjs.evtTools.signal.subscribeSceneSignal(
      runtimeScene,
      behavior,
      'OtherSignal'
    );

    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'LocaleChanged', 'ja');
    dispatchFrame(runtimeScene);

    expect(objectCalls).to.eql([
      {
        receiver: 'Receiver',
        receiverId: receiver.getUniqueId(),
        signalName: 'LocaleChanged',
        payload: 'ja',
      },
    ]);
    expect(behaviorCalls).to.eql([
      {
        receiver: 'SignalBehavior',
        ownerId: receiver.getUniqueId(),
        signalName: 'LocaleChanged',
        payload: 'ja',
      },
    ]);
  });

  it('reports each concrete scene signal subscriber to the signal monitor', () => {
    const { runtimeScene, receiver } = createSignalRuntimeScene();
    const behavior = receiver.getBehavior('SignalBehavior');
    runtimeScene.isSignalMonitorDebugEnabled = () => true;

    gdjs.evtTools.signal.subscribeSceneSignal(
      runtimeScene,
      receiver,
      'LocaleChanged'
    );
    gdjs.evtTools.signal.subscribeSceneSignal(
      runtimeScene,
      behavior,
      'LocaleChanged'
    );
    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'LocaleChanged', 'ja');
    dispatchFrame(runtimeScene);

    const signalRecord = runtimeScene.getSignalBus().getDebugInfo()
      .signalsThisFrame[0];
    expect(
      signalRecord.receiverPositions.map((receiverPosition) => ({
        objectName: receiverPosition.objectName,
        objectId: receiverPosition.objectId,
        receiverName: receiverPosition.receiverName,
        receiverKind: receiverPosition.receiverKind,
      }))
    ).to.eql([
      {
        objectName: 'Receiver',
        objectId: receiver.getUniqueId(),
        receiverName: 'Receiver',
        receiverKind: 'prefab',
      },
      {
        objectName: 'Receiver',
        objectId: receiver.getUniqueId(),
        receiverName: 'SignalBehavior',
        receiverKind: 'behavior',
      },
    ]);
  });

  it('keeps recent signal monitor records across delivery frames', () => {
    const { runtimeScene, receiver } = createSignalRuntimeScene();
    runtimeScene.isSignalMonitorDebugEnabled = () => true;
    gdjs.evtTools.signal.subscribeSceneSignal(
      runtimeScene,
      receiver,
      'TestSignal'
    );
    gdjs.evtTools.signal.subscribeSceneSignal(
      runtimeScene,
      receiver,
      'TestSignal222'
    );

    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'TestSignal', 'tst1');
    dispatchFrame(runtimeScene);
    gdjs.evtTools.signal.emitSceneSignal(
      runtimeScene,
      'TestSignal222',
      'test2'
    );
    dispatchFrame(runtimeScene);

    const debugInfo = runtimeScene.getSignalBus().getDebugInfo();
    expect(debugInfo.signalsThisFrame.map((signal) => signal.name)).to.eql([
      'TestSignal222',
    ]);
    expect(debugInfo.recentSignals.map((signal) => signal.name)).to.eql([
      'TestSignal',
      'TestSignal222',
    ]);
  });

  it('keeps an inactive behavior subscribed without replaying missed signals', () => {
    const { runtimeScene, receiver } = createSignalRuntimeScene();
    const behavior = receiver.getBehavior('SignalBehavior');
    if (!behavior) throw new Error('Unable to get signal test behavior.');
    gdjs.evtTools.signal.subscribeSceneSignal(runtimeScene, behavior, 'Ping');

    behavior.activate(false);
    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Ping', 'missed');
    dispatchFrame(runtimeScene);
    expect(behaviorCalls).to.have.length(0);

    behavior.activate(true);
    expect(behaviorCalls).to.have.length(0);
    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Ping', 'new');
    dispatchFrame(runtimeScene);
    expect(behaviorCalls.map((call) => call.payload)).to.eql(['new']);
  });

  it('delivers a direct signal only to the targeted prefab onSignal', () => {
    const { runtimeScene, receiver } = createSignalRuntimeScene();
    const behavior = receiver.getBehavior('SignalBehavior');
    gdjs.evtTools.signal.subscribeSceneSignal(runtimeScene, behavior, 'Direct');

    gdjs.evtTools.signal.emitSignalToInstance(
      runtimeScene,
      receiver.getUniqueId(),
      'Direct',
      'one'
    );
    dispatchFrame(runtimeScene);

    expect(objectCalls.map((call) => call.signalName)).to.eql(['Direct']);
    expect(behaviorCalls).to.have.length(0);
    expect(
      gdjs.evtTools.signal.getDeliveredSceneSignals(runtimeScene, 'Direct')
    ).to.have.length(0);
  });

  it('dismisses direct signals for missing instances and instances without onSignal', () => {
    const { runtimeScene } = createSignalRuntimeScene();
    runtimeScene.registerObject({
      name: 'PlainObject',
      type: 'TestObject::TestObject',
      variables: [],
      behaviors: [],
      effects: [],
    });
    const plainObject = runtimeScene.createObject('PlainObject');
    if (!plainObject) throw new Error('Unable to create plain object.');

    gdjs.evtTools.signal.emitSignalToInstance(
      runtimeScene,
      999999,
      'Missing',
      ''
    );
    gdjs.evtTools.signal.emitSignalToInstance(
      runtimeScene,
      plainObject.getUniqueId(),
      'NoHandler',
      ''
    );
    dispatchFrame(runtimeScene);

    expect(objectCalls).to.have.length(0);
    expect(
      runtimeScene.getSignalBus().getDebugInfo().signalsThisFrame
    ).to.have.length(2);
    expect(
      runtimeScene
        .getSignalBus()
        .getDebugInfo()
        .signalsThisFrame.map((signal) => signal.status)
    ).to.eql(['unhandled', 'unhandled']);
  });

  it('cleans subscriptions when an object or behavior is destroyed', () => {
    const { runtimeScene, receiver } = createSignalRuntimeScene();
    const behavior = receiver.getBehavior('SignalBehavior');
    gdjs.evtTools.signal.subscribeSceneSignal(runtimeScene, receiver, 'Ping');
    gdjs.evtTools.signal.subscribeSceneSignal(runtimeScene, behavior, 'Ping');

    receiver.removeBehavior('SignalBehavior');
    runtimeScene.markObjectForDeletion(receiver);
    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Ping', 'after-delete');
    dispatchFrame(runtimeScene);

    expect(objectCalls).to.have.length(0);
    expect(behaviorCalls).to.have.length(0);
  });

  it('uses a stable subscriber snapshot for each scene signal', () => {
    const { runtimeScene, receiver } = createSignalRuntimeScene();
    runtimeScene.registerObject(objectData('LateReceiver'));
    const lateReceiver = runtimeScene.createObject('LateReceiver');
    if (!lateReceiver) throw new Error('Unable to create late receiver.');

    const signalReceiver = /** @type {any} */ (receiver);
    const originalOnSignal = signalReceiver.onSignal.bind(receiver);
    signalReceiver.onSignal = (signalName, payload) => {
      originalOnSignal(signalName, payload);
      gdjs.evtTools.signal.subscribeSceneSignal(
        runtimeScene,
        lateReceiver,
        signalName
      );
    };
    gdjs.evtTools.signal.subscribeSceneSignal(runtimeScene, receiver, 'Ping');

    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Ping', 'first');
    dispatchFrame(runtimeScene);
    expect(objectCalls.map((call) => call.receiver)).to.eql(['Receiver']);

    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Ping', 'second');
    dispatchFrame(runtimeScene);
    expect(objectCalls.map((call) => call.receiver)).to.eql([
      'Receiver',
      'Receiver',
      'LateReceiver',
    ]);
  });

  it('keeps signals emitted by onSignal handlers for the following frame', () => {
    const { runtimeScene, receiver } = createSignalRuntimeScene();
    gdjs.evtTools.signal.subscribeSceneSignal(runtimeScene, receiver, 'First');
    gdjs.evtTools.signal.subscribeSceneSignal(runtimeScene, receiver, 'Second');

    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'First', 'now');
    dispatchFrame(runtimeScene);
    expect(objectCalls.map((call) => call.signalName)).to.eql(['First']);
    expect(runtimeScene.getSignalBus().getQueuedSignalsCount()).to.be(1);

    dispatchFrame(runtimeScene);
    expect(objectCalls.map((call) => call.signalName)).to.eql([
      'First',
      'Second',
    ]);
  });

  it('preserves FIFO delivery for repeated scene signal names', () => {
    const { runtimeScene, receiver } = createSignalRuntimeScene();
    gdjs.evtTools.signal.subscribeSceneSignal(runtimeScene, receiver, 'Ping');
    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Ping', '1');
    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Ping', '2');
    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'Ping', '3');

    dispatchFrame(runtimeScene);
    expect(objectCalls.map((call) => call.payload)).to.eql(['1', '2', '3']);
    expect(
      gdjs.evtTools.signal
        .getDeliveredSceneSignals(runtimeScene, 'Ping')
        .map((signal) => signal.payload)
    ).to.eql(['1', '2', '3']);
  });

  it('retains overflow ahead of newly emitted signals', () => {
    const { runtimeScene } = createSignalRuntimeScene();
    for (let index = 0; index < 10001; ++index) {
      gdjs.evtTools.signal.emitSceneSignal(
        runtimeScene,
        'Overflow',
        '' + index
      );
    }

    dispatchFrame(runtimeScene);
    expect(runtimeScene.getSignalBus().getQueuedSignalsCount()).to.be(1);
    expect(
      runtimeScene.getSignalBus().getDebugInfo().throttledSignalsCount
    ).to.be(1);

    gdjs.evtTools.signal.emitSceneSignal(runtimeScene, 'New', 'after');
    dispatchFrame(runtimeScene);
    expect(
      gdjs.evtTools.signal
        .getDeliveredSceneSignals(runtimeScene, '')
        .map((signal) => signal.name)
    ).to.eql(['Overflow', 'New']);
  });

  it('does not expose emitter metadata to handlers or public expressions', () => {
    const { runtimeScene, receiver } = createSignalRuntimeScene();
    gdjs.evtTools.signal.subscribeSceneSignal(runtimeScene, receiver, 'Ping');
    gdjs.evtTools.signal.emitSceneSignalFromEvents(
      runtimeScene,
      'Ping',
      'source=' + receiver.getUniqueId(),
      receiver
    );
    dispatchFrame(runtimeScene);

    expect(objectCalls[0]).to.eql({
      receiver: 'Receiver',
      receiverId: receiver.getUniqueId(),
      signalName: 'Ping',
      payload: 'source=' + receiver.getUniqueId(),
    });
    const deliveredSignal = gdjs.evtTools.signal.getDeliveredSceneSignals(
      runtimeScene,
      'Ping'
    )[0];
    expect(deliveredSignal).not.to.have.property('debugEmitter');
    const signalTools = /** @type {any} */ (gdjs.evtTools.signal);
    expect(signalTools.getSignalSenderObjectName).to.be(undefined);
    expect(signalTools.getSignalSenderInstanceId).to.be(undefined);
    expect(signalTools.getSignalDiagnostics).to.be(undefined);
  });
});
