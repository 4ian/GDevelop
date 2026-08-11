namespace gdjs {
  export type SpringBoneBackendPreference =
    | 'Auto'
    | 'CPU'
    | 'WebGPUPreferred';
  export type SpringBoneBackendKind = 'CPU' | 'WebGPU';
  export type SpringBoneFallbackReason =
    | WebGpuComputeFailureReason
    | 'webgpu-pipeline-failed'
    | 'webgpu-allocation-failed'
    | 'webgpu-map-failed'
    | 'webgpu-invalid-snapshot'
    | 'webgpu-stalled'
    | 'scene-budget-exceeded';

  export interface SpringBone3DBehaviorData extends BehaviorData {
    configurationResource: string;
    enabled: boolean;
    backendPreference: SpringBoneBackendPreference;
    simulationFrequency: number;
    maxSubsteps: number;
    blendWeight: number;
    movementInertia: number;
    rotationInertia: number;
    gravityScale: number;
    windX: number;
    windY: number;
    windZ: number;
    teleportDistance: number;
    teleportAngle: number;
  }

  export type SpringBoneConfigurationStatus =
    | 'loading'
    | 'ready'
    | 'missing-resource'
    | 'invalid-json'
    | 'missing-bone'
    | 'ambiguous-bone'
    | 'invalid-chain'
    | 'duplicate-bone'
    | 'duplicate-behavior'
    | 'budget-paused';

  export interface SpringBoneChainConfiguration {
    name: string;
    bones: string[];
    damping: number;
    stiffness: number;
    gravityX: number;
    gravityY: number;
    gravityZ: number;
    maxAngleRadians: number;
    collisionMargin: number;
    collisionStartPoint: number;
    collisionPointCount: number;
  }

  export interface SpringBoneColliderConfiguration {
    name: string;
    bone: string;
    aX: number;
    aY: number;
    aZ: number;
    bX: number;
    bY: number;
    bZ: number;
    radiusA: number;
    radiusB: number;
    chainMask: number;
  }

  export interface SpringBoneConfiguration {
    formatVersion: 1;
    chains: SpringBoneChainConfiguration[];
    colliders: SpringBoneColliderConfiguration[];
    pointCount: number;
  }

  export interface SpringBoneSimulationState {
    positions: Float32Array;
    previousPositions: Float32Array;
  }

  export interface SpringBoneSimulationSnapshot {
    sequence: number;
    positions: Float32Array;
    previousPositions: Float32Array;
  }

  export interface SpringBoneFrameData {
    targets: Float32Array;
    colliderWorldData: Float32Array;
    gravityScale: number;
    windX: number;
    windY: number;
    windZ: number;
  }
}
