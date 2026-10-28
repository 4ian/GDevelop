// @ts-check
/**
 * Tests for gdjs.RuntimeBehavior.
 */

describe('gdjs.RuntimeBehavior', () => {
  /** @type {gdjs.RuntimeGame} */
  let runtimeGame;
  /** @type {gdjs.TestRuntimeScene} */
  let runtimeScene;

  beforeEach(function () {
    runtimeGame = gdjs.getPixiRuntimeGame();
    runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
  });

  describe('updateFromBehaviorData', () => {
    /**
     * A behavior that records the diff passed to applyBehaviorOverriding,
     * so tests can verify what was forwarded by updateFromBehaviorData.
     */
    class RecordingRuntimeBehavior extends gdjs.RuntimeBehavior {
      constructor(runtimeScene, behaviorData, owner) {
        super(runtimeScene, behaviorData, owner);
        this.lastOverriding = null;
      }
      applyBehaviorOverriding(behaviorOverriding) {
        this.lastOverriding = behaviorOverriding;
        return true;
      }
    }
    gdjs.registerBehavior(
      'TestBehavior::RecordingBehavior',
      RecordingRuntimeBehavior
    );

    /** @returns {RecordingRuntimeBehavior} */
    const makeBehavior = (behaviorData) => {
      const object = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        variables: [],
        behaviors: [],
        effects: [],
      });
      return new RecordingRuntimeBehavior(runtimeScene, behaviorData, object);
    };

    it('forwards every property that changed (not only name/type)', () => {
      const initialData = {
        name: 'MyBehavior',
        type: 'TestBehavior::RecordingBehavior',
        speed: 100,
        gravity: 9.8,
        jumpHeight: 200,
      };
      const newData = {
        name: 'MyBehavior',
        type: 'TestBehavior::RecordingBehavior',
        speed: 250,
        gravity: 9.8,
        jumpHeight: 400,
      };
      const behavior = makeBehavior(initialData);

      const result = behavior.updateFromBehaviorData(initialData, newData);

      expect(result).to.be(true);
      expect(behavior.lastOverriding).to.eql({
        name: 'MyBehavior',
        type: 'TestBehavior::RecordingBehavior',
        speed: 250,
        jumpHeight: 400,
      });
    });

    it('does not include unchanged properties beyond name and type', () => {
      const data = {
        name: 'MyBehavior',
        type: 'TestBehavior::RecordingBehavior',
        speed: 100,
        gravity: 9.8,
      };
      const behavior = makeBehavior(data);

      behavior.updateFromBehaviorData(data, { ...data });

      expect(behavior.lastOverriding).to.eql({
        name: 'MyBehavior',
        type: 'TestBehavior::RecordingBehavior',
      });
    });

    it('returns false when applyBehaviorOverriding is not redefined', () => {
      const object = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        variables: [],
        behaviors: [],
        effects: [],
      });
      const behaviorData = {
        name: 'MyBehavior',
        type: 'TestBehavior::TestBehavior',
        speed: 100,
      };
      const behavior = new gdjs.TestRuntimeBehavior(
        runtimeScene,
        behaviorData,
        object
      );

      const updatedData = { ...behaviorData, speed: 200 };
      const result = behavior.updateFromBehaviorData(behaviorData, updatedData);
      expect(result).to.be(false);
    });

    it('updates the network synchronization when changed in the editor', () => {
      const behaviorData = {
        name: 'MyBehavior',
        type: 'TestBehavior::RecordingBehavior',
      };
      const behavior = makeBehavior(behaviorData);
      expect(behavior.isSyncedOverNetwork()).to.be(true);

      const notSynchronizedBehaviorData = {
        ...behaviorData,
        isSynchronizedOverNetwork: false,
      };
      behavior.updateFromBehaviorData(
        behaviorData,
        notSynchronizedBehaviorData
      );
      expect(behavior.isSyncedOverNetwork()).to.be(false);

      behavior.updateFromBehaviorData(
        notSynchronizedBehaviorData,
        behaviorData
      );
      expect(behavior.isSyncedOverNetwork()).to.be(true);
    });
  });

  describe('network synchronization', () => {
    /**
     * @param {BehaviorData} behaviorData
     * @returns {gdjs.RuntimeBehavior}
     */
    const makeBehavior = (behaviorData) => {
      const object = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        variables: [],
        behaviors: [],
        effects: [],
      });
      return new gdjs.TestRuntimeBehavior(runtimeScene, behaviorData, object);
    };

    it('is synchronized unless set otherwise in the behavior data', () => {
      expect(
        makeBehavior({
          name: 'MyBehavior',
          type: 'TestBehavior::TestBehavior',
        }).isSyncedOverNetwork()
      ).to.be(true);
      expect(
        makeBehavior({
          name: 'MyBehavior',
          type: 'TestBehavior::TestBehavior',
          isSynchronizedOverNetwork: true,
        }).isSyncedOverNetwork()
      ).to.be(true);
      expect(
        makeBehavior({
          name: 'MyBehavior',
          type: 'TestBehavior::TestBehavior',
          isSynchronizedOverNetwork: false,
        }).isSyncedOverNetwork()
      ).to.be(false);
    });

    it('can still be changed at runtime by the action', () => {
      const behavior = makeBehavior({
        name: 'MyBehavior',
        type: 'TestBehavior::TestBehavior',
        isSynchronizedOverNetwork: false,
      });

      behavior.enableSynchronization(true);

      expect(behavior.isSyncedOverNetwork()).to.be(true);
    });
  });
});
