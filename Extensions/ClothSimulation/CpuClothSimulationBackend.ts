/**
 * Adapted from the three.js webgpu_compute_cloth example:
 * https://github.com/mrdoob/three.js/blob/cd3aa0d/examples/webgpu_compute_cloth.html
 * Copyright 2010-2026 three.js authors
 * SPDX-License-Identifier: MIT
 */
namespace gdjs {
  const solverEpsilon = 1e-6;

  export class CpuClothSimulationBackend implements ClothSimulationBackend {
    readonly kind: ClothBackendKind = 'CPU';
    readonly generation: number;
    private _topology: ClothSimulationTopology;
    private _positions: Float32Array;
    private _previousPositions: Float32Array;
    private _fixed: Uint8Array;
    private _pinTargets: Float32Array;
    private _springCorrections: Float32Array;
    private _snapshotPositions: Float32Array;
    private _snapshotPreviousPositions: Float32Array;
    private _latestSnapshot: ClothSimulationSnapshot | null = null;
    private _parameters: ClothStepParameters = {
      stiffness: 0.2,
      damping: 0.99,
      accelerationX: 0,
      accelerationY: 0,
      accelerationZ: -600,
      sphereColliderEnabled: false,
      sphereCenterX: 0,
      sphereCenterY: 0,
      sphereCenterZ: 0,
      sphereRadius: 0,
    };
    private _disposed = false;

    constructor(
      topology: ClothSimulationTopology,
      state: ClothSimulationState,
      generation: number
    ) {
      this._topology = topology;
      this.generation = generation;
      this._positions = new Float32Array(topology.particleCount * 3);
      this._previousPositions = new Float32Array(topology.particleCount * 3);
      this._fixed = new Uint8Array(topology.particleCount);
      this._pinTargets = new Float32Array(topology.particleCount * 3);
      this._springCorrections = new Float32Array(topology.springCount * 3);
      this._snapshotPositions = new Float32Array(topology.particleCount * 3);
      this._snapshotPreviousPositions = new Float32Array(
        topology.particleCount * 3
      );
      this.reset(state);
    }

    applyParameters(parameters: ClothStepParameters): void {
      this._parameters = parameters;
    }

    applyPinCommands(commands: readonly ClothPinCommand[]): void {
      if (this._disposed) return;
      for (
        let commandIndex = 0;
        commandIndex < commands.length;
        commandIndex++
      ) {
        const command = commands[commandIndex];
        const index = command.index;
        if (index < 0 || index >= this._topology.particleCount) continue;
        const offset = index * 3;
        if (command.pinned) {
          const targetX = Number.isFinite(command.targetX)
            ? command.targetX!
            : this._positions[offset];
          const targetY = Number.isFinite(command.targetY)
            ? command.targetY!
            : this._positions[offset + 1];
          const targetZ = Number.isFinite(command.targetZ)
            ? command.targetZ!
            : this._positions[offset + 2];
          this._fixed[index] = 1;
          this._pinTargets[offset] =
            this._positions[offset] =
            this._previousPositions[offset] =
              Math.fround(targetX);
          this._pinTargets[offset + 1] =
            this._positions[offset + 1] =
            this._previousPositions[offset + 1] =
              Math.fround(targetY);
          this._pinTargets[offset + 2] =
            this._positions[offset + 2] =
            this._previousPositions[offset + 2] =
              Math.fround(targetZ);
        } else {
          this._fixed[index] = 0;
          this._previousPositions[offset] = this._positions[offset];
          this._previousPositions[offset + 1] = this._positions[offset + 1];
          this._previousPositions[offset + 2] = this._positions[offset + 2];
        }
      }
    }

    step(fixedDeltaSeconds: number): void {
      if (this._disposed) return;
      const topology = this._topology;
      const positions = this._positions;
      const previousPositions = this._previousPositions;
      const corrections = this._springCorrections;
      const stiffness = this._parameters.stiffness;

      // Pass A: each spring writes only its own correction.
      for (
        let springIndex = 0;
        springIndex < topology.springCount;
        springIndex++
      ) {
        const first = topology.springEndpoints[springIndex * 2] * 3;
        const second = topology.springEndpoints[springIndex * 2 + 1] * 3;
        const deltaX = positions[second] - positions[first];
        const deltaY = positions[second + 1] - positions[first + 1];
        const deltaZ = positions[second + 2] - positions[first + 2];
        const distance = Math.max(
          Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ),
          solverEpsilon
        );
        const correctionScale =
          (0.5 *
            stiffness *
            (distance - topology.springRestLengths[springIndex])) /
          distance;
        const correctionOffset = springIndex * 3;
        corrections[correctionOffset] = Math.fround(deltaX * correctionScale);
        corrections[correctionOffset + 1] = Math.fround(
          deltaY * correctionScale
        );
        corrections[correctionOffset + 2] = Math.fround(
          deltaZ * correctionScale
        );
      }

      // Pass B: spring positions are no longer read, so particles can update in place.
      const deltaSquared = fixedDeltaSeconds * fixedDeltaSeconds;
      for (
        let particleIndex = 0;
        particleIndex < topology.particleCount;
        particleIndex++
      ) {
        const positionOffset = particleIndex * 3;
        if (this._fixed[particleIndex]) {
          positions[positionOffset] = previousPositions[positionOffset] =
            this._pinTargets[positionOffset];
          positions[positionOffset + 1] = previousPositions[
            positionOffset + 1
          ] = this._pinTargets[positionOffset + 1];
          positions[positionOffset + 2] = previousPositions[
            positionOffset + 2
          ] = this._pinTargets[positionOffset + 2];
          continue;
        }

        let springDeltaX = 0;
        let springDeltaY = 0;
        let springDeltaZ = 0;
        const adjacencyStart = topology.adjacencyOffsets[particleIndex];
        const adjacencyEnd = topology.adjacencyOffsets[particleIndex + 1];
        for (
          let adjacencyIndex = adjacencyStart;
          adjacencyIndex < adjacencyEnd;
          adjacencyIndex++
        ) {
          const correctionOffset =
            topology.adjacencySpringIndices[adjacencyIndex] * 3;
          const sign = topology.adjacencySigns[adjacencyIndex];
          springDeltaX += corrections[correctionOffset] * sign;
          springDeltaY += corrections[correctionOffset + 1] * sign;
          springDeltaZ += corrections[correctionOffset + 2] * sign;
        }

        const currentX = positions[positionOffset];
        const currentY = positions[positionOffset + 1];
        const currentZ = positions[positionOffset + 2];
        const previousX = previousPositions[positionOffset];
        const previousY = previousPositions[positionOffset + 1];
        const previousZ = previousPositions[positionOffset + 2];
        let predictedX =
          currentX +
          (currentX - previousX) * this._parameters.damping +
          springDeltaX +
          this._parameters.accelerationX * deltaSquared;
        let predictedY =
          currentY +
          (currentY - previousY) * this._parameters.damping +
          springDeltaY +
          this._parameters.accelerationY * deltaSquared;
        let predictedZ =
          currentZ +
          (currentZ - previousZ) * this._parameters.damping +
          springDeltaZ +
          this._parameters.accelerationZ * deltaSquared;

        const sphereRadius = this._parameters.sphereRadius;
        if (this._parameters.sphereColliderEnabled && sphereRadius > 0) {
          let sphereDeltaX = predictedX - this._parameters.sphereCenterX;
          let sphereDeltaY = predictedY - this._parameters.sphereCenterY;
          let sphereDeltaZ = predictedZ - this._parameters.sphereCenterZ;
          let sphereDistance = Math.sqrt(
            sphereDeltaX * sphereDeltaX +
              sphereDeltaY * sphereDeltaY +
              sphereDeltaZ * sphereDeltaZ
          );
          if (sphereDistance < sphereRadius) {
            if (sphereDistance < solverEpsilon) {
              sphereDeltaX = currentX - previousX;
              sphereDeltaY = currentY - previousY;
              sphereDeltaZ = currentZ - previousZ;
              sphereDistance = Math.sqrt(
                sphereDeltaX * sphereDeltaX +
                  sphereDeltaY * sphereDeltaY +
                  sphereDeltaZ * sphereDeltaZ
              );
              if (sphereDistance < solverEpsilon) {
                sphereDeltaX = 0;
                sphereDeltaY = 0;
                sphereDeltaZ = 1;
                sphereDistance = 1;
              }
            }
            const projectionScale = sphereRadius / sphereDistance;
            predictedX =
              this._parameters.sphereCenterX + sphereDeltaX * projectionScale;
            predictedY =
              this._parameters.sphereCenterY + sphereDeltaY * projectionScale;
            predictedZ =
              this._parameters.sphereCenterZ + sphereDeltaZ * projectionScale;
          }
        }

        previousPositions[positionOffset] = currentX;
        previousPositions[positionOffset + 1] = currentY;
        previousPositions[positionOffset + 2] = currentZ;
        positions[positionOffset] = Math.fround(predictedX);
        positions[positionOffset + 1] = Math.fround(predictedY);
        positions[positionOffset + 2] = Math.fround(predictedZ);
      }
    }

    requestSnapshot(sequence: number): void {
      if (this._disposed) return;
      this._snapshotPositions.set(this._positions);
      this._snapshotPreviousPositions.set(this._previousPositions);
      if (!this._latestSnapshot) {
        this._latestSnapshot = {
          sequence,
          positions: this._snapshotPositions,
          previousPositions: this._snapshotPreviousPositions,
        };
      } else {
        this._latestSnapshot.sequence = sequence;
      }
    }

    getLatestSnapshot(): ClothSimulationSnapshot | null {
      return this._latestSnapshot;
    }

    exportLatestRecoverableState(): ClothSimulationState {
      return {
        positions: this._positions.slice(),
        previousPositions: this._previousPositions.slice(),
        fixed: this._fixed.slice(),
        pinTargets: this._pinTargets.slice(),
      };
    }

    reset(state: ClothSimulationState): void {
      if (
        state.positions.length !== this._positions.length ||
        state.previousPositions.length !== this._previousPositions.length ||
        state.fixed.length !== this._fixed.length ||
        state.pinTargets.length !== this._pinTargets.length
      ) {
        throw new Error('Invalid cloth simulation state size.');
      }
      this._positions.set(state.positions);
      this._previousPositions.set(state.previousPositions);
      this._fixed.set(state.fixed);
      this._pinTargets.set(state.pinTargets);
      this._springCorrections.fill(0);
      this._latestSnapshot = null;
    }

    getParticlePosition(index: number): [number, number, number] | null {
      if (index < 0 || index >= this._topology.particleCount) return null;
      const offset = index * 3;
      return [
        this._positions[offset],
        this._positions[offset + 1],
        this._positions[offset + 2],
      ];
    }

    hasFiniteState(): boolean {
      for (let index = 0; index < this._positions.length; index++) {
        if (
          !Number.isFinite(this._positions[index]) ||
          !Number.isFinite(this._previousPositions[index])
        ) {
          return false;
        }
      }
      return true;
    }

    dispose(): void {
      if (this._disposed) return;
      this._disposed = true;
      this._latestSnapshot = null;
    }
  }
}
