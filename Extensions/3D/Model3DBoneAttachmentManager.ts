namespace gdjs {
  const boneAttachmentLogger = new gdjs.Logger('3D bone attachments');

  type BoneAttachmentOwner = gdjs.RuntimeObject & gdjs.Base3DHandler;

  type BoneAttachmentRecord = {
    behavior: gdjs.Base3DBehavior;
    owner: BoneAttachmentOwner;
    state: gdjs.Model3DBoneAttachment;
    container: gdjs.RuntimeInstanceContainer;
    attachmentDestroyCallback: () => void;
    targetDestroyCallback: () => void;
    pose: gdjs.Model3DBonePose;
  };

  type ContainerAttachmentState = {
    records: Map<gdjs.Base3DBehavior, BoneAttachmentRecord>;
    recordsByOwner: Map<gdjs.RuntimeObject, BoneAttachmentRecord>;
    sortedRecords: BoneAttachmentRecord[];
    isSortDirty: boolean;
  };

  /**
   * Maintains same-container transform constraints between 3D objects and
   * animated model bones.
   *
   * @internal
   */
  export class Model3DBoneAttachmentManager {
    private static _managersByScene = new WeakMap<
      gdjs.RuntimeScene,
      gdjs.Model3DBoneAttachmentManager
    >();

    private _containerStates = new Map<
      gdjs.RuntimeInstanceContainer,
      ContainerAttachmentState
    >();
    private _recordsByBehavior = new WeakMap<
      gdjs.Base3DBehavior,
      BoneAttachmentRecord
    >();
    private _initialFailures = new WeakMap<gdjs.Base3DBehavior, string>();

    private _boneQuaternion = new THREE.Quaternion();
    private _offsetQuaternion = new THREE.Quaternion();
    private _finalQuaternion = new THREE.Quaternion();
    private _offsetEuler = new THREE.Euler(0, 0, 0, 'ZYX');
    private _finalEuler = new THREE.Euler(0, 0, 0, 'ZYX');
    private _positionOffset = new THREE.Vector3();

    static getForScene(
      runtimeScene: gdjs.RuntimeScene
    ): gdjs.Model3DBoneAttachmentManager | null {
      return this._managersByScene.get(runtimeScene) || null;
    }

    static getOrCreateForScene(
      runtimeScene: gdjs.RuntimeScene
    ): gdjs.Model3DBoneAttachmentManager {
      let manager = this._managersByScene.get(runtimeScene);
      if (!manager) {
        manager = new gdjs.Model3DBoneAttachmentManager();
        this._managersByScene.set(runtimeScene, manager);
      }
      return manager;
    }

    static synchronizeContainer(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): void {
      // This method is registered as a bare callback, so it must not depend on
      // the call-site `this` value.
      const manager = gdjs.Model3DBoneAttachmentManager._managersByScene.get(
        instanceContainer.getScene()
      );
      if (manager) manager.synchronize(instanceContainer);
    }

    attach(
      behavior: gdjs.Base3DBehavior,
      target: gdjs.Model3DRuntimeObject | null | undefined,
      boneName: string
    ): boolean {
      const owner = behavior.owner as BoneAttachmentOwner;
      const container = owner.getInstanceContainer();
      const failure = this._validateNewAttachment(
        behavior,
        owner,
        target,
        boneName,
        container
      );
      if (failure) {
        this._warnInitialFailure(behavior, owner, target, boneName, failure);
        return false;
      }
      const modelTarget = target as gdjs.Model3DRuntimeObject;

      const existingState = behavior._getModel3DBoneAttachment();
      const keepsOffsets =
        !!existingState &&
        existingState.target === modelTarget &&
        existingState.boneName === boneName;
      const positionOffset: [number, number, number] = keepsOffsets
        ? [
            existingState!.positionOffset[0],
            existingState!.positionOffset[1],
            existingState!.positionOffset[2],
          ]
        : [0, 0, 0];
      const rotationOffset: [number, number, number] = keepsOffsets
        ? [
            existingState!.rotationOffset[0],
            existingState!.rotationOffset[1],
            existingState!.rotationOffset[2],
          ]
        : [0, 0, 0];

      const existingRecord = this._findRecord(behavior);
      if (existingRecord) this._removeRecord(existingRecord, false);
      const existingOwnerRecord = this._containerStates
        .get(container)
        ?.recordsByOwner.get(owner);
      if (existingOwnerRecord && existingOwnerRecord !== existingRecord) {
        this._removeRecord(existingOwnerRecord, true);
      }

      const state: gdjs.Model3DBoneAttachment = {
        target: modelTarget,
        boneName,
        positionOffset,
        rotationOffset,
        isResolved: false,
        lastFailure: null,
      };
      behavior._setModel3DBoneAttachment(state);

      const record = {} as BoneAttachmentRecord;
      record.behavior = behavior;
      record.owner = owner;
      record.state = state;
      record.container = container;
      record.pose = {
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        quaternionX: 0,
        quaternionY: 0,
        quaternionZ: 0,
        quaternionW: 1,
      };
      record.attachmentDestroyCallback = () => {
        if (this._findRecord(behavior) === record) {
          this._removeRecord(record, true);
        }
      };
      record.targetDestroyCallback = () => {
        if (this._findRecord(behavior) === record) {
          // The last synchronized logical transform is already stored on the
          // attachment. Removing the relationship therefore preserves it.
          this._removeRecord(record, true);
        }
      };

      const containerState = this._getOrCreateContainerState(container);
      containerState.records.set(behavior, record);
      containerState.recordsByOwner.set(owner, record);
      this._recordsByBehavior.set(behavior, record);
      containerState.isSortDirty = true;
      owner.registerDestroyCallback(record.attachmentDestroyCallback);
      modelTarget.registerDestroyCallback(record.targetDestroyCallback);
      this._initialFailures.delete(behavior);

      this.synchronizeBehavior(behavior);
      return true;
    }

    detach(behavior: gdjs.Base3DBehavior): void {
      const record = this._findRecord(behavior);
      if (record) this._removeRecord(record, true);
    }

    synchronizeBehavior(behavior: gdjs.Base3DBehavior): void {
      const record = this._findRecord(behavior);
      if (record) this._synchronizeRecord(record);
    }

    synchronize(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      const containerState = this._containerStates.get(instanceContainer);
      if (!containerState || containerState.records.size === 0) return;
      if (containerState.isSortDirty) {
        this._rebuildTopologicalOrder(containerState);
      }
      const sortedRecords = containerState.sortedRecords;
      for (let index = 0; index < sortedRecords.length; index++) {
        this._synchronizeRecord(sortedRecords[index]);
      }
    }

    private _getOrCreateContainerState(
      container: gdjs.RuntimeInstanceContainer
    ): ContainerAttachmentState {
      let containerState = this._containerStates.get(container);
      if (!containerState) {
        containerState = {
          records: new Map(),
          recordsByOwner: new Map(),
          sortedRecords: [],
          isSortDirty: true,
        };
        this._containerStates.set(container, containerState);
      }
      return containerState;
    }

    private _findRecord(
      behavior: gdjs.Base3DBehavior
    ): BoneAttachmentRecord | null {
      return this._recordsByBehavior.get(behavior) || null;
    }

    private _removeRecord(
      record: BoneAttachmentRecord,
      clearBehaviorState: boolean
    ): void {
      record.owner.unregisterDestroyCallback(record.attachmentDestroyCallback);
      record.state.target.unregisterDestroyCallback(
        record.targetDestroyCallback
      );
      this._recordsByBehavior.delete(record.behavior);

      const containerState = this._containerStates.get(record.container);
      if (containerState) {
        containerState.records.delete(record.behavior);
        if (containerState.recordsByOwner.get(record.owner) === record) {
          containerState.recordsByOwner.delete(record.owner);
        }
        containerState.isSortDirty = true;
        if (containerState.records.size === 0) {
          containerState.sortedRecords.length = 0;
          this._containerStates.delete(record.container);
        }
      }

      record.state.isResolved = false;
      if (
        clearBehaviorState &&
        record.behavior._getModel3DBoneAttachment() === record.state
      ) {
        record.behavior._setModel3DBoneAttachment(null);
      }
    }

    private _validateNewAttachment(
      behavior: gdjs.Base3DBehavior,
      owner: BoneAttachmentOwner,
      target: gdjs.Model3DRuntimeObject | null | undefined,
      boneName: string,
      container: gdjs.RuntimeInstanceContainer
    ): string | null {
      if (!gdjs.Base3DHandler.is3D(owner) || !owner.get3DRendererObject()) {
        return 'the attachment is not a rendered 3D object';
      }
      if (
        !(target instanceof gdjs.Model3DRuntimeObject) ||
        !target.get3DRendererObject() ||
        (target as any)._livingOnScene === false
      ) {
        return 'the target is not a live 3D model';
      }
      if (owner === target) return 'an object cannot be attached to itself';
      if (!boneName) return 'the bone name is empty';
      if (
        owner.getInstanceContainer() !== target.getInstanceContainer() ||
        target.getInstanceContainer() !== container
      ) {
        return 'the objects do not belong to the same instance container';
      }
      if (owner.getLayer() !== target.getLayer()) {
        return 'the objects are not on the same layer';
      }

      const attachmentLayerGroup = owner
        .getInstanceContainer()
        .getLayer(owner.getLayer())
        .getRenderer()
        .getThreeGroup();
      const targetLayerGroup = target
        .getInstanceContainer()
        .getLayer(target.getLayer())
        .getRenderer()
        .getThreeGroup();
      if (!attachmentLayerGroup || attachmentLayerGroup !== targetLayerGroup) {
        return 'the objects do not share a 3D layer group';
      }
      if (
        owner.get3DRendererObject()!.parent !== attachmentLayerGroup ||
        target.get3DRendererObject()!.parent !== targetLayerGroup
      ) {
        return 'a renderer root is not owned directly by its layer';
      }
      if (!target.hasBone(boneName)) {
        return target.isBoneNameAmbiguous(boneName)
          ? `the bone name "${boneName}" is ambiguous`
          : `the bone "${boneName}" does not exist`;
      }
      if (this._wouldCreateCycle(behavior, owner, target, container)) {
        return 'the relationship would create an attachment cycle';
      }
      return null;
    }

    private _wouldCreateCycle(
      behavior: gdjs.Base3DBehavior,
      owner: gdjs.RuntimeObject,
      target: gdjs.RuntimeObject,
      container: gdjs.RuntimeInstanceContainer
    ): boolean {
      const containerState = this._containerStates.get(container);
      if (!containerState) return false;

      let current: gdjs.RuntimeObject | null = target;
      const visited = new Set<gdjs.RuntimeObject>();
      while (current) {
        if (current === owner) return true;
        if (visited.has(current)) return true;
        visited.add(current);
        const record = containerState.recordsByOwner.get(current);
        if (!record || record.behavior === behavior) return false;
        current = record.state.target;
      }
      return false;
    }

    private _rebuildTopologicalOrder(
      containerState: ContainerAttachmentState
    ): void {
      const records = Array.from(containerState.records.values());
      const indegrees = new Map<BoneAttachmentRecord, number>();
      const dependents = new Map<
        BoneAttachmentRecord,
        BoneAttachmentRecord[]
      >();
      for (let index = 0; index < records.length; index++) {
        indegrees.set(records[index], 0);
      }
      for (let index = 0; index < records.length; index++) {
        const record = records[index];
        const targetRecord = containerState.recordsByOwner.get(
          record.state.target
        );
        if (!targetRecord) continue;
        indegrees.set(record, (indegrees.get(record) || 0) + 1);
        let targetDependents = dependents.get(targetRecord);
        if (!targetDependents) {
          targetDependents = [];
          dependents.set(targetRecord, targetDependents);
        }
        targetDependents.push(record);
      }

      const queue: BoneAttachmentRecord[] = [];
      for (let index = 0; index < records.length; index++) {
        if ((indegrees.get(records[index]) || 0) === 0) {
          queue.push(records[index]);
        }
      }

      const sortedRecords = containerState.sortedRecords;
      sortedRecords.length = 0;
      for (let queueIndex = 0; queueIndex < queue.length; queueIndex++) {
        const record = queue[queueIndex];
        sortedRecords.push(record);
        const recordDependents = dependents.get(record);
        if (!recordDependents) continue;
        for (let index = 0; index < recordDependents.length; index++) {
          const dependent = recordDependents[index];
          const newIndegree = (indegrees.get(dependent) || 0) - 1;
          indegrees.set(dependent, newIndegree);
          if (newIndegree === 0) queue.push(dependent);
        }
      }

      // Cycles are rejected transactionally, but retain deterministic behavior
      // if external runtime code corrupts the graph.
      if (sortedRecords.length !== records.length) {
        for (let index = 0; index < records.length; index++) {
          if (sortedRecords.indexOf(records[index]) === -1) {
            sortedRecords.push(records[index]);
          }
        }
      }
      containerState.isSortDirty = false;
    }

    private _synchronizeRecord(record: BoneAttachmentRecord): void {
      const failure = this._getSynchronizationFailure(record);
      if (failure) {
        this._setFailure(record, failure);
        return;
      }

      const state = record.state;
      const layerGroup = record.container
        .getLayer(record.owner.getLayer())
        .getRenderer()
        .getThreeGroup()!;
      if (!state.target.getBonePose(state.boneName, layerGroup, record.pose)) {
        this._setFailure(record, 'invalid-bone-transform');
        return;
      }

      const pose = record.pose;
      this._boneQuaternion.set(
        pose.quaternionX,
        pose.quaternionY,
        pose.quaternionZ,
        pose.quaternionW
      );
      this._positionOffset
        .set(
          state.positionOffset[0],
          state.positionOffset[1],
          state.positionOffset[2]
        )
        .applyQuaternion(this._boneQuaternion);

      this._offsetEuler.set(
        gdjs.toRad(state.rotationOffset[0]),
        gdjs.toRad(state.rotationOffset[1]),
        gdjs.toRad(state.rotationOffset[2]),
        'ZYX'
      );
      this._offsetQuaternion.setFromEuler(this._offsetEuler);
      this._finalQuaternion
        .copy(this._boneQuaternion)
        .multiply(this._offsetQuaternion)
        .normalize();
      this._finalEuler.setFromQuaternion(this._finalQuaternion, 'ZYX');

      const x = pose.positionX + this._positionOffset.x;
      const y = pose.positionY + this._positionOffset.y;
      const z = pose.positionZ + this._positionOffset.z;
      const rotationX = gdjs.toDegrees(this._finalEuler.x);
      const rotationY = gdjs.toDegrees(this._finalEuler.y);
      const rotationZ = gdjs.toDegrees(this._finalEuler.z);
      const owner = record.owner;
      if (owner.getX() !== x) owner.setX(x);
      if (owner.getY() !== y) owner.setY(y);
      if (owner.getZ() !== z) owner.setZ(z);
      if (owner.getRotationX() !== rotationX) owner.setRotationX(rotationX);
      if (owner.getRotationY() !== rotationY) owner.setRotationY(rotationY);
      if (owner.getAngle() !== rotationZ) owner.setAngle(rotationZ);

      state.isResolved = true;
      state.lastFailure = null;
    }

    private _getSynchronizationFailure(
      record: BoneAttachmentRecord
    ): gdjs.BoneAttachmentFailure | null {
      const owner = record.owner;
      const target = record.state.target;
      if (
        (owner as any)._livingOnScene === false ||
        (target as any)._livingOnScene === false
      ) {
        return 'deleted-object';
      }
      if (
        owner.getInstanceContainer() !== record.container ||
        target.getInstanceContainer() !== record.container
      ) {
        return 'container-mismatch';
      }
      if (owner.getLayer() !== target.getLayer()) return 'layer-mismatch';

      const ownerLayerGroup = record.container
        .getLayer(owner.getLayer())
        .getRenderer()
        .getThreeGroup();
      const targetLayerGroup = record.container
        .getLayer(target.getLayer())
        .getRenderer()
        .getThreeGroup();
      if (!ownerLayerGroup || ownerLayerGroup !== targetLayerGroup) {
        return 'layer-group-mismatch';
      }
      const ownerRendererRoot = owner.get3DRendererObject();
      const targetRendererRoot = target.get3DRendererObject();
      if (
        !ownerRendererRoot ||
        !targetRendererRoot ||
        ownerRendererRoot.parent !== ownerLayerGroup ||
        targetRendererRoot.parent !== targetLayerGroup
      ) {
        return 'renderer-parent-mismatch';
      }
      if (!target.hasBone(record.state.boneName)) {
        return target.isBoneNameAmbiguous(record.state.boneName)
          ? 'ambiguous-bone'
          : 'missing-bone';
      }
      return null;
    }

    private _setFailure(
      record: BoneAttachmentRecord,
      failure: gdjs.BoneAttachmentFailure
    ): void {
      const state = record.state;
      state.isResolved = false;
      if (state.lastFailure === failure) return;
      state.lastFailure = failure;
      boneAttachmentLogger.warn(
        `Bone attachment for "${record.owner.getName()}" to "${state.target.getName()}.${state.boneName}" is unresolved: ${failure}.`
      );
    }

    private _warnInitialFailure(
      behavior: gdjs.Base3DBehavior,
      owner: gdjs.RuntimeObject,
      target: gdjs.RuntimeObject | null | undefined,
      boneName: string,
      failure: string
    ): void {
      const signature = `${target ? target.id : 'no-target'}:${boneName}:${failure}`;
      if (this._initialFailures.get(behavior) === signature) return;
      this._initialFailures.set(behavior, signature);
      const targetDescription = target ? target.getName() : 'no target';
      boneAttachmentLogger.warn(
        `Unable to attach "${owner.getName()}" to "${targetDescription}.${boneName}": ${failure}.`
      );
    }
  }

  gdjs.registerRuntimeInstanceContainerPostObjectsUpdateCallback(
    gdjs.Model3DBoneAttachmentManager.synchronizeContainer
  );
  gdjs.registerRuntimeInstanceContainerPreObjectsRenderCallback(
    gdjs.Model3DBoneAttachmentManager.synchronizeContainer
  );
}
