namespace gdjs {
  const epsilon = 1e-6;
  const constraintIterations = 5;

  export class SpringBoneSolver {
    readonly chainStarts: Uint16Array;
    readonly positions: Float32Array;
    readonly previousPositions: Float32Array;
    private _targets: Float32Array;
    private _colliderWorldData: Float32Array;
    private _configuration: SpringBoneConfiguration;
    private _gravityScale = 1;
    private _windX = 0;
    private _windY = 0;
    private _windZ = 0;

    constructor(
      configuration: SpringBoneConfiguration,
      state: SpringBoneSimulationState
    ) {
      this._configuration = configuration;
      this.chainStarts = new Uint16Array(configuration.chains.length);
      let pointOffset = 0;
      for (let index = 0; index < configuration.chains.length; index++) {
        this.chainStarts[index] = pointOffset;
        pointOffset += configuration.chains[index].bones.length;
      }
      this.positions = new Float32Array(configuration.pointCount * 3);
      this.previousPositions = new Float32Array(configuration.pointCount * 3);
      this._targets = new Float32Array(configuration.pointCount * 3);
      this._colliderWorldData = new Float32Array(
        configuration.colliders.length * 8
      );
      this.reset(state);
    }

    setFrameData(frameData: SpringBoneFrameData): void {
      if (
        frameData.targets.length !== this._targets.length ||
        frameData.colliderWorldData.length !== this._colliderWorldData.length
      ) {
        throw new Error('Invalid spring-bone frame data size.');
      }
      this._targets.set(frameData.targets);
      this._colliderWorldData.set(frameData.colliderWorldData);
      this._gravityScale = frameData.gravityScale;
      this._windX = frameData.windX;
      this._windY = frameData.windY;
      this._windZ = frameData.windZ;
    }

    step(deltaSeconds: number): void {
      const deltaSquared = deltaSeconds * deltaSeconds;
      for (
        let chainIndex = 0;
        chainIndex < this._configuration.chains.length;
        chainIndex++
      ) {
        const chain = this._configuration.chains[chainIndex];
        const start = this.chainStarts[chainIndex];
        const count = chain.bones.length;
        const rootOffset = start * 3;
        this.positions[rootOffset] = this.previousPositions[rootOffset] =
          this._targets[rootOffset];
        this.positions[rootOffset + 1] = this.previousPositions[rootOffset + 1] =
          this._targets[rootOffset + 1];
        this.positions[rootOffset + 2] = this.previousPositions[rootOffset + 2] =
          this._targets[rootOffset + 2];

        for (let localIndex = 1; localIndex < count; localIndex++) {
          const offset = (start + localIndex) * 3;
          const currentX = this.positions[offset];
          const currentY = this.positions[offset + 1];
          const currentZ = this.positions[offset + 2];
          let nextX =
            currentX +
            (currentX - this.previousPositions[offset]) * chain.damping +
            (chain.gravityX * this._gravityScale + this._windX) * deltaSquared;
          let nextY =
            currentY +
            (currentY - this.previousPositions[offset + 1]) * chain.damping +
            (chain.gravityY * this._gravityScale + this._windY) * deltaSquared;
          let nextZ =
            currentZ +
            (currentZ - this.previousPositions[offset + 2]) * chain.damping +
            (chain.gravityZ * this._gravityScale + this._windZ) * deltaSquared;
          nextX += (this._targets[offset] - nextX) * chain.stiffness;
          nextY += (this._targets[offset + 1] - nextY) * chain.stiffness;
          nextZ += (this._targets[offset + 2] - nextZ) * chain.stiffness;
          this.previousPositions[offset] = currentX;
          this.previousPositions[offset + 1] = currentY;
          this.previousPositions[offset + 2] = currentZ;
          this.positions[offset] = Math.fround(nextX);
          this.positions[offset + 1] = Math.fround(nextY);
          this.positions[offset + 2] = Math.fround(nextZ);
        }

        for (let iteration = 0; iteration < constraintIterations; iteration++) {
          for (let localIndex = 1; localIndex < count; localIndex++) {
            this._constrainPoint(chainIndex, localIndex);
          }
          this.positions[rootOffset] = this._targets[rootOffset];
          this.positions[rootOffset + 1] = this._targets[rootOffset + 1];
          this.positions[rootOffset + 2] = this._targets[rootOffset + 2];
        }
      }
      if (!this.hasFiniteState()) this.resetToTargets();
    }

    private _constrainPoint(chainIndex: number, localIndex: number): void {
      const chain = this._configuration.chains[chainIndex];
      const pointIndex = this.chainStarts[chainIndex] + localIndex;
      const parentOffset = (pointIndex - 1) * 3;
      const offset = pointIndex * 3;
      const targetParentOffset = parentOffset;
      const targetOffset = offset;
      const targetDeltaX =
        this._targets[targetOffset] - this._targets[targetParentOffset];
      const targetDeltaY =
        this._targets[targetOffset + 1] - this._targets[targetParentOffset + 1];
      const targetDeltaZ =
        this._targets[targetOffset + 2] - this._targets[targetParentOffset + 2];
      const restLength = Math.max(
        epsilon,
        Math.hypot(targetDeltaX, targetDeltaY, targetDeltaZ)
      );
      let deltaX = this.positions[offset] - this.positions[parentOffset];
      let deltaY = this.positions[offset + 1] - this.positions[parentOffset + 1];
      let deltaZ = this.positions[offset + 2] - this.positions[parentOffset + 2];
      let distance = Math.hypot(deltaX, deltaY, deltaZ);
      if (distance < epsilon) {
        deltaX = targetDeltaX;
        deltaY = targetDeltaY;
        deltaZ = targetDeltaZ;
        distance = restLength;
      }
      deltaX /= distance;
      deltaY /= distance;
      deltaZ /= distance;

      const targetDirectionX = targetDeltaX / restLength;
      const targetDirectionY = targetDeltaY / restLength;
      const targetDirectionZ = targetDeltaZ / restLength;
      const cosine = Math.min(
        1,
        Math.max(
          -1,
          deltaX * targetDirectionX +
            deltaY * targetDirectionY +
            deltaZ * targetDirectionZ
        )
      );
      const angle = Math.acos(cosine);
      if (angle > chain.maxAngleRadians && angle > epsilon) {
        const correction = (angle - chain.maxAngleRadians) / angle;
        deltaX += (targetDirectionX - deltaX) * correction;
        deltaY += (targetDirectionY - deltaY) * correction;
        deltaZ += (targetDirectionZ - deltaZ) * correction;
        const correctedLength = Math.max(
          epsilon,
          Math.hypot(deltaX, deltaY, deltaZ)
        );
        deltaX /= correctedLength;
        deltaY /= correctedLength;
        deltaZ /= correctedLength;
      }
      this.positions[offset] = this.positions[parentOffset] + deltaX * restLength;
      this.positions[offset + 1] =
        this.positions[parentOffset + 1] + deltaY * restLength;
      this.positions[offset + 2] =
        this.positions[parentOffset + 2] + deltaZ * restLength;

      if (
        localIndex < chain.collisionStartPoint ||
        localIndex >= chain.collisionStartPoint + chain.collisionPointCount
      ) {
        return;
      }
      for (
        let colliderIndex = 0;
        colliderIndex < this._configuration.colliders.length;
        colliderIndex++
      ) {
        const collider = this._configuration.colliders[colliderIndex];
        if ((collider.chainMask & (1 << chainIndex)) === 0) continue;
        const colliderOffset = colliderIndex * 8;
        const ax = this._colliderWorldData[colliderOffset];
        const ay = this._colliderWorldData[colliderOffset + 1];
        const az = this._colliderWorldData[colliderOffset + 2];
        const bx = this._colliderWorldData[colliderOffset + 4];
        const by = this._colliderWorldData[colliderOffset + 5];
        const bz = this._colliderWorldData[colliderOffset + 6];
        const abX = bx - ax;
        const abY = by - ay;
        const abZ = bz - az;
        const abLengthSquared = abX * abX + abY * abY + abZ * abZ;
        const t =
          abLengthSquared <= epsilon
            ? 0
            : Math.min(
                1,
                Math.max(
                  0,
                  ((this.positions[offset] - ax) * abX +
                    (this.positions[offset + 1] - ay) * abY +
                    (this.positions[offset + 2] - az) * abZ) /
                    abLengthSquared
                )
              );
        const closestX = ax + abX * t;
        const closestY = ay + abY * t;
        const closestZ = az + abZ * t;
        let pushX = this.positions[offset] - closestX;
        let pushY = this.positions[offset + 1] - closestY;
        let pushZ = this.positions[offset + 2] - closestZ;
        let pushLength = Math.hypot(pushX, pushY, pushZ);
        const radius =
          this._colliderWorldData[colliderOffset + 3] * (1 - t) +
          this._colliderWorldData[colliderOffset + 7] * t +
          chain.collisionMargin;
        if (pushLength >= radius) continue;
        if (pushLength < epsilon) {
          pushX = 0;
          pushY = 0;
          pushZ = 1;
          pushLength = 1;
        }
        const scale = radius / pushLength;
        this.positions[offset] = closestX + pushX * scale;
        this.positions[offset + 1] = closestY + pushY * scale;
        this.positions[offset + 2] = closestZ + pushZ * scale;
      }
    }

    resetToTargets(): void {
      this.positions.set(this._targets);
      this.previousPositions.set(this._targets);
    }

    reset(state: SpringBoneSimulationState): void {
      if (
        state.positions.length !== this.positions.length ||
        state.previousPositions.length !== this.previousPositions.length
      ) {
        throw new Error('Invalid spring-bone simulation state size.');
      }
      this.positions.set(state.positions);
      this.previousPositions.set(state.previousPositions);
      this._targets.set(state.positions);
    }

    hasFiniteState(): boolean {
      for (let index = 0; index < this.positions.length; index++) {
        if (
          !Number.isFinite(this.positions[index]) ||
          !Number.isFinite(this.previousPositions[index])
        ) {
          return false;
        }
      }
      return true;
    }
  }
}
