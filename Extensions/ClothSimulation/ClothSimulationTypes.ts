namespace gdjs {
  export type ClothBackendPreference = 'Auto' | 'CPU' | 'WebGPUPreferred';
  export type ClothBackendKind = 'CPU' | 'WebGPU';
  export type ClothPinMode = 'None' | 'TopCorners' | 'TopEdge' | 'TopEveryN';
  export type ClothFallbackReason =
    | 'webgpu-unavailable'
    | 'webgpu-adapter-unavailable'
    | 'webgpu-device-failed'
    | 'webgpu-limit-insufficient'
    | 'webgpu-pipeline-failed'
    | 'webgpu-allocation-failed'
    | 'webgpu-device-lost'
    | 'webgpu-submit-failed'
    | 'webgpu-map-failed'
    | 'webgpu-invalid-snapshot'
    | 'scene-budget-exceeded';

  export interface Cloth3DObjectContent extends Object3DDataContent {
    segmentsX?: number;
    segmentsY?: number;
    backendPreference?: string;
    simulationFrequency?: number;
    maxSubsteps?: number;
    stiffness?: number;
    damping?: number;
    gravityX?: number;
    gravityY?: number;
    gravityZ?: number;
    windX?: number;
    windY?: number;
    windZ?: number;
    pinMode?: string;
    pinInterval?: number;
    sphereColliderEnabled?: boolean;
    sphereCenterX?: number;
    sphereCenterY?: number;
    sphereCenterZ?: number;
    sphereRadius?: number;
    color?: string;
    opacity?: number;
    roughness?: number;
    metalness?: number;
    doubleSided?: boolean;
    isCastingShadow?: boolean;
    isReceivingShadow?: boolean;
  }

  export interface Cloth3DObjectData extends Object3DData {
    content: Cloth3DObjectContent;
  }

  export interface NormalizedCloth3DObjectContent extends Object3DDataContent {
    width: number;
    height: number;
    depth: number;
    segmentsX: number;
    segmentsY: number;
    backendPreference: ClothBackendPreference;
    simulationFrequency: number;
    maxSubsteps: number;
    stiffness: number;
    damping: number;
    gravityX: number;
    gravityY: number;
    gravityZ: number;
    windX: number;
    windY: number;
    windZ: number;
    pinMode: ClothPinMode;
    pinInterval: number;
    sphereColliderEnabled: boolean;
    sphereCenterX: number;
    sphereCenterY: number;
    sphereCenterZ: number;
    sphereRadius: number;
    color: string;
    opacity: number;
    roughness: number;
    metalness: number;
    doubleSided: boolean;
    isCastingShadow: boolean;
    isReceivingShadow: boolean;
  }

  export interface NormalizedCloth3DObjectData extends Object3DData {
    content: NormalizedCloth3DObjectContent;
  }

  export const cloth3DObjectDefaultContent: Readonly<NormalizedCloth3DObjectContent> =
    {
      width: 200,
      height: 200,
      depth: 100,
      segmentsX: 30,
      segmentsY: 30,
      backendPreference: 'Auto',
      simulationFrequency: 360,
      maxSubsteps: 8,
      stiffness: 0.2,
      damping: 0.99,
      gravityX: 0,
      gravityY: 0,
      gravityZ: -600,
      windX: 0,
      windY: 0,
      windZ: 0,
      pinMode: 'TopEveryN',
      pinInterval: 5,
      sphereColliderEnabled: false,
      sphereCenterX: 0,
      sphereCenterY: 0,
      sphereCenterZ: 0,
      sphereRadius: 25,
      color: '32;64;128',
      opacity: 0.85,
      roughness: 0.8,
      metalness: 0,
      doubleSided: true,
      isCastingShadow: false,
      isReceivingShadow: true,
    };

  const finiteOrDefault = (value: unknown, defaultValue: number): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : defaultValue;

  const clamp = (value: number, minimum: number, maximum: number): number =>
    Math.min(maximum, Math.max(minimum, value));

  const normalizedInteger = (
    value: unknown,
    defaultValue: number,
    minimum: number,
    maximum: number
  ): number =>
    clamp(Math.trunc(finiteOrDefault(value, defaultValue)), minimum, maximum);

  const normalizedDimension = (
    value: unknown,
    defaultValue: number
  ): number => {
    const finiteValue = finiteOrDefault(value, defaultValue);
    return finiteValue <= 0 ? 1 : finiteValue;
  };

  const normalizedBoolean = (value: unknown, defaultValue: boolean): boolean =>
    typeof value === 'boolean' ? value : defaultValue;

  /** Convert supported RGB/hex strings to the canonical GDevelop RGB form. */
  export const normalizeClothColor = (value: unknown): string => {
    if (typeof value !== 'string') return cloth3DObjectDefaultContent.color;
    const rgbMatch = value.match(
      /^\s*(\d{1,3})\s*;\s*(\d{1,3})\s*;\s*(\d{1,3})\s*$/
    );
    if (rgbMatch) {
      const red = Number(rgbMatch[1]);
      const green = Number(rgbMatch[2]);
      const blue = Number(rgbMatch[3]);
      if (red <= 255 && green <= 255 && blue <= 255) {
        return `${red};${green};${blue}`;
      }
    }
    const hexMatch = value.match(/^#?([0-9a-fA-F]{6})$/);
    if (hexMatch) {
      const color = parseInt(hexMatch[1], 16);
      return `${(color >> 16) & 255};${(color >> 8) & 255};${color & 255}`;
    }
    return cloth3DObjectDefaultContent.color;
  };

  /**
   * Normalize untrusted serialized cloth data before it is used for counts or
   * allocations. The input and its content are never mutated.
   */
  export const normalizeCloth3DObjectData = (
    objectData: Cloth3DObjectData
  ): NormalizedCloth3DObjectData => {
    const input = objectData.content || ({} as Cloth3DObjectContent);
    const defaults = cloth3DObjectDefaultContent;
    const segmentsX = normalizedInteger(
      input.segmentsX,
      defaults.segmentsX,
      2,
      64
    );
    const segmentsY = normalizedInteger(
      input.segmentsY,
      defaults.segmentsY,
      2,
      64
    );
    const backendPreference: ClothBackendPreference =
      input.backendPreference === 'CPU' ||
      input.backendPreference === 'WebGPUPreferred' ||
      input.backendPreference === 'Auto'
        ? input.backendPreference
        : defaults.backendPreference;
    const pinMode: ClothPinMode =
      input.pinMode === 'None' ||
      input.pinMode === 'TopCorners' ||
      input.pinMode === 'TopEdge' ||
      input.pinMode === 'TopEveryN'
        ? input.pinMode
        : defaults.pinMode;

    return {
      ...objectData,
      content: {
        ...input,
        width: normalizedDimension(input.width, defaults.width),
        height: normalizedDimension(input.height, defaults.height),
        depth: normalizedDimension(input.depth, defaults.depth),
        segmentsX,
        segmentsY,
        backendPreference,
        simulationFrequency: normalizedInteger(
          input.simulationFrequency,
          defaults.simulationFrequency,
          30,
          360
        ),
        maxSubsteps: normalizedInteger(
          input.maxSubsteps,
          defaults.maxSubsteps,
          1,
          12
        ),
        stiffness: clamp(
          finiteOrDefault(input.stiffness, defaults.stiffness),
          0,
          1
        ),
        damping: clamp(finiteOrDefault(input.damping, defaults.damping), 0, 1),
        gravityX: clamp(
          finiteOrDefault(input.gravityX, defaults.gravityX),
          -100000,
          100000
        ),
        gravityY: clamp(
          finiteOrDefault(input.gravityY, defaults.gravityY),
          -100000,
          100000
        ),
        gravityZ: clamp(
          finiteOrDefault(input.gravityZ, defaults.gravityZ),
          -100000,
          100000
        ),
        windX: clamp(
          finiteOrDefault(input.windX, defaults.windX),
          -100000,
          100000
        ),
        windY: clamp(
          finiteOrDefault(input.windY, defaults.windY),
          -100000,
          100000
        ),
        windZ: clamp(
          finiteOrDefault(input.windZ, defaults.windZ),
          -100000,
          100000
        ),
        pinMode,
        pinInterval: normalizedInteger(
          input.pinInterval,
          defaults.pinInterval,
          1,
          segmentsX + 1
        ),
        sphereColliderEnabled: normalizedBoolean(
          input.sphereColliderEnabled,
          defaults.sphereColliderEnabled
        ),
        sphereCenterX: finiteOrDefault(
          input.sphereCenterX,
          defaults.sphereCenterX
        ),
        sphereCenterY: finiteOrDefault(
          input.sphereCenterY,
          defaults.sphereCenterY
        ),
        sphereCenterZ: finiteOrDefault(
          input.sphereCenterZ,
          defaults.sphereCenterZ
        ),
        sphereRadius: clamp(
          finiteOrDefault(input.sphereRadius, defaults.sphereRadius),
          0,
          1000000
        ),
        color: normalizeClothColor(input.color),
        opacity: clamp(finiteOrDefault(input.opacity, defaults.opacity), 0, 1),
        roughness: clamp(
          finiteOrDefault(input.roughness, defaults.roughness),
          0,
          1
        ),
        metalness: clamp(
          finiteOrDefault(input.metalness, defaults.metalness),
          0,
          1
        ),
        doubleSided: normalizedBoolean(input.doubleSided, defaults.doubleSided),
        isCastingShadow: normalizedBoolean(
          input.isCastingShadow,
          defaults.isCastingShadow
        ),
        isReceivingShadow: normalizedBoolean(
          input.isReceivingShadow,
          defaults.isReceivingShadow
        ),
      },
    };
  };

  export interface ClothStepParameters {
    stiffness: number;
    damping: number;
    accelerationX: number;
    accelerationY: number;
    accelerationZ: number;
    sphereColliderEnabled: boolean;
    sphereCenterX: number;
    sphereCenterY: number;
    sphereCenterZ: number;
    sphereRadius: number;
  }

  export interface ClothPinCommand {
    index: number;
    pinned: boolean;
    targetX?: number;
    targetY?: number;
    targetZ?: number;
  }

  export interface ClothSimulationState {
    positions: Float32Array;
    previousPositions: Float32Array;
    fixed: Uint8Array;
    pinTargets: Float32Array;
  }

  export interface ClothSimulationSnapshot {
    sequence: number;
    positions: Float32Array;
    previousPositions: Float32Array;
  }
}
