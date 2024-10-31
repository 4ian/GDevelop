/// <reference path="./jolt-physics.d.ts" />

namespace gdjs {
  gdjs.registerAsynchronouslyLoadingLibraryPromise(
    new Promise((resolve) => {
      const tryInitializeJoltPhysics = () => {
        // @ts-ignore
        if (global.initializeJoltPhysics) {
          resolve(
            // @ts-ignore
            global.initializeJoltPhysics().then((Jolt: any) => {
              window.Jolt = Jolt;
            })
          );
          return;
        }
        // Jolt is not ready yet, wait another 200ms
        setTimeout(tryInitializeJoltPhysics, 200);
      };
      tryInitializeJoltPhysics();
    })
  );

  export interface RuntimeScene {
    physics3DSharedData: gdjs.Physics3DSharedData | null;
  }
  interface Physics3DNetworkSyncDataType {
    tpx: number | undefined;
    tpy: number | undefined;
    tqa: number | undefined;
    lvx: number | undefined;
    lvy: number | undefined;
    av: number | undefined;
    aw: boolean | undefined;
    layers: number;
    masks: number;
  }

  export interface Physics3DNetworkSyncData extends BehaviorNetworkSyncData {
    props: Physics3DNetworkSyncDataType;
  }
  export class Physics3DSharedData {
    constructor(instanceContainer: gdjs.RuntimeInstanceContainer, sharedData) {}

    // (string)jointId -> (b2Joint)b2Joint
    static getSharedData(
      runtimeScene: gdjs.RuntimeScene,
      behaviorName: string
    ): gdjs.Physics3DSharedData {
      // Create one if needed
      if (!runtimeScene.physics3DSharedData) {
        const initialData = runtimeScene.getInitialSharedDataForBehavior(
          behaviorName
        );
        runtimeScene.physics3DSharedData = new gdjs.Physics3DSharedData(
          runtimeScene,
          initialData
        );
      }
      return runtimeScene.physics3DSharedData;
    }
  }
  gdjs.registerRuntimeSceneUnloadedCallback(function (runtimeScene) {
    if (
      // @ts-ignore
      runtimeScene.physics3DSharedData &&
      // @ts-ignore
      runtimeScene.physics3DSharedData.world
    ) {
      // @ts-ignore
      Box2D.destroy(runtimeScene.physics3DSharedData.world);
    }
  });

  export class Physics3DRuntimeBehavior extends gdjs.RuntimeBehavior {
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      return true;
    }

    getNetworkSyncData(): Physics2NetworkSyncData {
      return super.getNetworkSyncData();
    }

    updateFromNetworkSyncData(networkSyncData: Physics2NetworkSyncData) {
      super.updateFromNetworkSyncData(networkSyncData);
    }

    onDeActivate() {}

    onActivate() {}

    onDestroy() {}

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    onObjectHotReloaded() {}
  }

  gdjs.registerBehavior(
    'Physics3D::Physics3DBehavior',
    gdjs.Physics3DRuntimeBehavior
  );
}
