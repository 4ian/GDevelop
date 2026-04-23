namespace gdjs {
  /**
   * @category Behaviors > Physics 3D
   */
  export namespace physics3d {
    const _findActivePhysics3DBehavior = (
      object: gdjs.RuntimeObject,
      preferredBehaviorName: string
    ): gdjs.Physics3DRuntimeBehavior | null => {
      const preferredBehavior = object.getBehavior(
        preferredBehaviorName
      ) as gdjs.Physics3DRuntimeBehavior | null;
      if (
        preferredBehavior &&
        preferredBehavior instanceof gdjs.Physics3DRuntimeBehavior &&
        preferredBehavior.activated()
      ) {
        return preferredBehavior;
      }

      const rawBehaviors = (object as any)._behaviors as
        | gdjs.RuntimeBehavior[]
        | undefined;
      if (!rawBehaviors) {
        return null;
      }
      for (const behavior of rawBehaviors) {
        if (
          behavior instanceof gdjs.Physics3DRuntimeBehavior &&
          behavior.activated()
        ) {
          return behavior;
        }
      }
      return null;
    };

    type BulkJointCreator = (
      sourceBehavior: gdjs.Physics3DRuntimeBehavior,
      targetObject: gdjs.RuntimeObject,
      jointIdVariable: gdjs.Variable
    ) => void;

    const _linkPickedObjectsWithJoints = (
      sourceObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      sourceBehaviorName: string,
      targetObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      linkedPairsCountVariable: gdjs.Variable,
      lastJointIdVariable: gdjs.Variable,
      createJoint: BulkJointCreator
    ): void => {
      const sourceObjects = gdjs.objectsListsToArray(
        sourceObjectsLists as unknown as Hashtable<gdjs.RuntimeObject>
      );
      const targetObjects = gdjs.objectsListsToArray(
        targetObjectsLists as unknown as Hashtable<gdjs.RuntimeObject>
      );

      const processedPairKeys = new Set<string>();
      const tempJointIdVariable = new gdjs.Variable();

      let linkedPairsCount = 0;
      let lastJointId = 0;
      for (const sourceObject of sourceObjects) {
        const sourceBehavior = _findActivePhysics3DBehavior(
          sourceObject,
          sourceBehaviorName
        );
        if (!sourceBehavior) {
          continue;
        }

        for (const targetObject of targetObjects) {
          if (targetObject === sourceObject) {
            continue;
          }
          const targetBehavior = _findActivePhysics3DBehavior(
            targetObject,
            sourceBehaviorName
          );
          if (
            !targetBehavior ||
            targetBehavior._sharedData !== sourceBehavior._sharedData
          ) {
            continue;
          }

          const idA = sourceObject.getUniqueId();
          const idB = targetObject.getUniqueId();
          const pairKey = idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
          if (processedPairKeys.has(pairKey)) {
            continue;
          }
          processedPairKeys.add(pairKey);

          tempJointIdVariable.setNumber(0);
          createJoint(sourceBehavior, targetObject, tempJointIdVariable);
          const jointId = Math.round(tempJointIdVariable.getAsNumber());
          if (jointId > 0) {
            linkedPairsCount++;
            lastJointId = jointId;
          }
        }
      }

      linkedPairsCountVariable.setNumber(linkedPairsCount);
      lastJointIdVariable.setNumber(lastJointId);
    };

    export const areObjectsColliding = function (
      objectsLists1: Hashtable<Array<gdjs.RuntimeObject>>,
      behaviorName: string,
      objectsLists2: Hashtable<Array<gdjs.RuntimeObject>>,
      behaviorName2: string,
      inverted: boolean
    ) {
      return gdjs.evtTools.object.twoListsTest(
        gdjs.Physics3DRuntimeBehavior.areObjectsColliding,
        objectsLists1,
        objectsLists2,
        inverted,
        behaviorName
      );
    };

    export const haveObjectsStartedColliding = function (
      objectsLists1: Hashtable<Array<gdjs.RuntimeObject>>,
      behaviorName: string,
      objectsLists2: Hashtable<Array<gdjs.RuntimeObject>>,
      behaviorName2: string,
      inverted: boolean
    ) {
      return gdjs.evtTools.object.twoListsTest(
        gdjs.Physics3DRuntimeBehavior.hasCollisionStartedBetween,
        objectsLists1,
        objectsLists2,
        inverted,
        behaviorName
      );
    };

    export const haveObjectsStoppedColliding = function (
      objectsLists1: Hashtable<Array<gdjs.RuntimeObject>>,
      behaviorName: string,
      objectsLists2: Hashtable<Array<gdjs.RuntimeObject>>,
      behaviorName2: string,
      inverted: boolean
    ) {
      return gdjs.evtTools.object.twoListsTest(
        gdjs.Physics3DRuntimeBehavior.hasCollisionStoppedBetween,
        objectsLists1,
        objectsLists2,
        inverted,
        behaviorName
      );
    };

    export const addFixedJointsBetweenObjects = (
      sourceObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      sourceBehaviorName: string,
      targetObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      linkedPairsCountVariable: gdjs.Variable,
      lastJointIdVariable: gdjs.Variable
    ): void => {
      _linkPickedObjectsWithJoints(
        sourceObjectsLists,
        sourceBehaviorName,
        targetObjectsLists,
        linkedPairsCountVariable,
        lastJointIdVariable,
        (sourceBehavior, targetObject, jointIdVariable) => {
          sourceBehavior.addFixedJoint(targetObject, jointIdVariable);
        }
      );
    };

    export const addPointJointsBetweenObjects = (
      sourceObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      sourceBehaviorName: string,
      targetObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      anchorX: float,
      anchorY: float,
      anchorZ: float,
      linkedPairsCountVariable: gdjs.Variable,
      lastJointIdVariable: gdjs.Variable
    ): void => {
      _linkPickedObjectsWithJoints(
        sourceObjectsLists,
        sourceBehaviorName,
        targetObjectsLists,
        linkedPairsCountVariable,
        lastJointIdVariable,
        (sourceBehavior, targetObject, jointIdVariable) => {
          sourceBehavior.addPointJoint(
            targetObject,
            anchorX,
            anchorY,
            anchorZ,
            jointIdVariable
          );
        }
      );
    };

    export const addHingeJointsBetweenObjects = (
      sourceObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      sourceBehaviorName: string,
      targetObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      anchorX: float,
      anchorY: float,
      anchorZ: float,
      axisX: float,
      axisY: float,
      axisZ: float,
      linkedPairsCountVariable: gdjs.Variable,
      lastJointIdVariable: gdjs.Variable
    ): void => {
      _linkPickedObjectsWithJoints(
        sourceObjectsLists,
        sourceBehaviorName,
        targetObjectsLists,
        linkedPairsCountVariable,
        lastJointIdVariable,
        (sourceBehavior, targetObject, jointIdVariable) => {
          sourceBehavior.addHingeJoint(
            targetObject,
            anchorX,
            anchorY,
            anchorZ,
            axisX,
            axisY,
            axisZ,
            jointIdVariable
          );
        }
      );
    };

    export const addSliderJointsBetweenObjects = (
      sourceObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      sourceBehaviorName: string,
      targetObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      axisX: float,
      axisY: float,
      axisZ: float,
      linkedPairsCountVariable: gdjs.Variable,
      lastJointIdVariable: gdjs.Variable
    ): void => {
      _linkPickedObjectsWithJoints(
        sourceObjectsLists,
        sourceBehaviorName,
        targetObjectsLists,
        linkedPairsCountVariable,
        lastJointIdVariable,
        (sourceBehavior, targetObject, jointIdVariable) => {
          sourceBehavior.addSliderJoint(
            targetObject,
            axisX,
            axisY,
            axisZ,
            jointIdVariable
          );
        }
      );
    };

    export const addDistanceJointsBetweenObjects = (
      sourceObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      sourceBehaviorName: string,
      targetObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      minDistance: float,
      maxDistance: float,
      springFrequency: float,
      springDamping: float,
      linkedPairsCountVariable: gdjs.Variable,
      lastJointIdVariable: gdjs.Variable
    ): void => {
      _linkPickedObjectsWithJoints(
        sourceObjectsLists,
        sourceBehaviorName,
        targetObjectsLists,
        linkedPairsCountVariable,
        lastJointIdVariable,
        (sourceBehavior, targetObject, jointIdVariable) => {
          sourceBehavior.addDistanceJoint(
            targetObject,
            minDistance,
            maxDistance,
            springFrequency,
            springDamping,
            jointIdVariable
          );
        }
      );
    };

    export const addPulleyJointsBetweenObjects = (
      sourceObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      sourceBehaviorName: string,
      targetObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      pulleyAnchorAX: float,
      pulleyAnchorAY: float,
      pulleyAnchorAZ: float,
      pulleyAnchorBX: float,
      pulleyAnchorBY: float,
      pulleyAnchorBZ: float,
      localAnchorAX: float,
      localAnchorAY: float,
      localAnchorAZ: float,
      localAnchorBX: float,
      localAnchorBY: float,
      localAnchorBZ: float,
      totalLength: float,
      ratio: float,
      enabled: boolean,
      linkedPairsCountVariable: gdjs.Variable,
      lastJointIdVariable: gdjs.Variable
    ): void => {
      _linkPickedObjectsWithJoints(
        sourceObjectsLists,
        sourceBehaviorName,
        targetObjectsLists,
        linkedPairsCountVariable,
        lastJointIdVariable,
        (sourceBehavior, targetObject, jointIdVariable) => {
          sourceBehavior.addPulleyJoint(
            targetObject,
            pulleyAnchorAX,
            pulleyAnchorAY,
            pulleyAnchorAZ,
            pulleyAnchorBX,
            pulleyAnchorBY,
            pulleyAnchorBZ,
            localAnchorAX,
            localAnchorAY,
            localAnchorAZ,
            localAnchorBX,
            localAnchorBY,
            localAnchorBZ,
            totalLength,
            ratio,
            enabled,
            jointIdVariable
          );
        }
      );
    };

    export const addConeJointsBetweenObjects = (
      sourceObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      sourceBehaviorName: string,
      targetObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      anchorX: float,
      anchorY: float,
      anchorZ: float,
      twistAxisX: float,
      twistAxisY: float,
      twistAxisZ: float,
      halfConeAngle: float,
      linkedPairsCountVariable: gdjs.Variable,
      lastJointIdVariable: gdjs.Variable
    ): void => {
      _linkPickedObjectsWithJoints(
        sourceObjectsLists,
        sourceBehaviorName,
        targetObjectsLists,
        linkedPairsCountVariable,
        lastJointIdVariable,
        (sourceBehavior, targetObject, jointIdVariable) => {
          sourceBehavior.addConeJoint(
            targetObject,
            anchorX,
            anchorY,
            anchorZ,
            twistAxisX,
            twistAxisY,
            twistAxisZ,
            halfConeAngle,
            jointIdVariable
          );
        }
      );
    };

    export const addSwingTwistJointsBetweenObjects = (
      sourceObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      sourceBehaviorName: string,
      targetObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      anchorX: float,
      anchorY: float,
      anchorZ: float,
      twistAxisX: float,
      twistAxisY: float,
      twistAxisZ: float,
      normalHalfConeAngle: float,
      planeHalfConeAngle: float,
      twistMinAngle: float,
      twistMaxAngle: float,
      linkedPairsCountVariable: gdjs.Variable,
      lastJointIdVariable: gdjs.Variable
    ): void => {
      _linkPickedObjectsWithJoints(
        sourceObjectsLists,
        sourceBehaviorName,
        targetObjectsLists,
        linkedPairsCountVariable,
        lastJointIdVariable,
        (sourceBehavior, targetObject, jointIdVariable) => {
          sourceBehavior.addSwingTwistJoint(
            targetObject,
            anchorX,
            anchorY,
            anchorZ,
            twistAxisX,
            twistAxisY,
            twistAxisZ,
            normalHalfConeAngle,
            planeHalfConeAngle,
            twistMinAngle,
            twistMaxAngle,
            jointIdVariable
          );
        }
      );
    };

    type BehaviorNamePair = { character: string; physics: string };

    const isOnPlatformAdapter = (
      characterObject: gdjs.RuntimeObject,
      physicsObject: gdjs.RuntimeObject,
      behaviorNamePair: BehaviorNamePair
    ): boolean => {
      const characterBehavior = characterObject.getBehavior(
        behaviorNamePair.character
      ) as gdjs.PhysicsCharacter3DRuntimeBehavior;
      const physicsBehavior = physicsObject.getBehavior(
        behaviorNamePair.physics
      ) as gdjs.Physics3DRuntimeBehavior;
      if (!characterBehavior || !physicsBehavior) {
        return false;
      }
      return characterBehavior.isOnFloorObject(physicsBehavior);
    };

    const behaviorNamePair: BehaviorNamePair = { character: '', physics: '' };

    export const isOnPlatform = (
      characterObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      characterBehaviorName: string,
      physicsObjectsLists: Hashtable<Array<gdjs.RuntimeObject>>,
      physicsBehaviorName: string,
      inverted: boolean
    ) => {
      behaviorNamePair.character = characterBehaviorName;
      behaviorNamePair.physics = physicsBehaviorName;
      return gdjs.evtTools.object.twoListsTest(
        isOnPlatformAdapter,
        characterObjectsLists,
        physicsObjectsLists,
        inverted,
        behaviorNamePair
      );
    };
  }
}
