namespace gdjs {
  export class SpringBoneConfigurationError extends Error {
    readonly status: SpringBoneConfigurationStatus;

    constructor(status: SpringBoneConfigurationStatus) {
      super(status);
      this.status = status;
    }
  }

  const finiteNumber = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;

  const finiteVector3 = (value: unknown): [number, number, number] | null => {
    if (!Array.isArray(value) || value.length !== 3) return null;
    const x = finiteNumber(value[0]);
    const y = finiteNumber(value[1]);
    const z = finiteNumber(value[2]);
    return x === null || y === null || z === null ? null : [x, y, z];
  };

  const clamped = (value: unknown, fallback: number, min: number, max: number) => {
    const number = finiteNumber(value);
    return Math.min(max, Math.max(min, number === null ? fallback : number));
  };

  /** Normalize and validate an untrusted version-1 spring-bone JSON resource. */
  export const parseSpringBoneConfiguration = (
    input: unknown
  ): SpringBoneConfiguration => {
    if (!input || typeof input !== 'object') {
      throw new gdjs.SpringBoneConfigurationError('invalid-json');
    }
    const root = input as any;
    if (root.formatVersion !== 1 || !Array.isArray(root.chains)) {
      throw new gdjs.SpringBoneConfigurationError('invalid-json');
    }
    if (root.chains.length === 0 || root.chains.length > 32) {
      throw new gdjs.SpringBoneConfigurationError('invalid-chain');
    }

    const chainNames = new Map<string, number>();
    const configuredBones = new Set<string>();
    const chains: SpringBoneChainConfiguration[] = [];
    let pointCount = 0;
    for (let chainIndex = 0; chainIndex < root.chains.length; chainIndex++) {
      const raw = root.chains[chainIndex];
      if (!raw || typeof raw !== 'object') {
        throw new gdjs.SpringBoneConfigurationError('invalid-chain');
      }
      const name = typeof raw.name === 'string' ? raw.name.trim() : '';
      if (!name || chainNames.has(name) || !Array.isArray(raw.bones)) {
        throw new gdjs.SpringBoneConfigurationError('invalid-chain');
      }
      if (raw.bones.length < 2 || raw.bones.length > 64) {
        throw new gdjs.SpringBoneConfigurationError('invalid-chain');
      }
      const bones: string[] = [];
      for (let boneIndex = 0; boneIndex < raw.bones.length; boneIndex++) {
        const bone =
          typeof raw.bones[boneIndex] === 'string'
            ? raw.bones[boneIndex].trim()
            : '';
        if (!bone || configuredBones.has(bone)) {
          throw new gdjs.SpringBoneConfigurationError('duplicate-bone');
        }
        configuredBones.add(bone);
        bones.push(bone);
      }
      pointCount += bones.length;
      if (pointCount > 256) {
        throw new gdjs.SpringBoneConfigurationError('invalid-chain');
      }
      const gravity = finiteVector3(raw.gravity);
      if (!gravity) {
        throw new gdjs.SpringBoneConfigurationError('invalid-chain');
      }
      const collisionStartPoint = Math.min(
        bones.length - 1,
        Math.max(1, Math.trunc(clamped(raw.collisionStartPoint, 1, 1, 64)))
      );
      const collisionPointCount = Math.min(
        bones.length - collisionStartPoint,
        Math.max(
          0,
          Math.trunc(
            clamped(
              raw.collisionPointCount,
              bones.length - collisionStartPoint,
              0,
              64
            )
          )
        )
      );
      chainNames.set(name, chainIndex);
      chains.push({
        name,
        bones,
        damping: clamped(raw.damping, 0.9, 0, 1),
        stiffness: clamped(raw.stiffness, 0.1, 0, 1),
        gravityX: gravity[0],
        gravityY: gravity[1],
        gravityZ: gravity[2],
        maxAngleRadians:
          (clamped(raw.maxAngleDegrees, 180, 0, 180) * Math.PI) / 180,
        collisionMargin: clamped(raw.collisionMargin, 0, 0, 1000000),
        collisionStartPoint,
        collisionPointCount,
      });
    }

    const rawColliders = Array.isArray(root.colliders) ? root.colliders : [];
    if (rawColliders.length > 64) {
      throw new gdjs.SpringBoneConfigurationError('invalid-json');
    }
    const colliderNames = new Set<string>();
    const colliders: SpringBoneColliderConfiguration[] = [];
    for (let colliderIndex = 0; colliderIndex < rawColliders.length; colliderIndex++) {
      const raw = rawColliders[colliderIndex];
      if (!raw || typeof raw !== 'object') {
        throw new gdjs.SpringBoneConfigurationError('invalid-json');
      }
      const name = typeof raw.name === 'string' ? raw.name.trim() : '';
      const bone = typeof raw.bone === 'string' ? raw.bone.trim() : '';
      if (!name || !bone || colliderNames.has(name)) {
        throw new gdjs.SpringBoneConfigurationError('invalid-json');
      }
      colliderNames.add(name);

      let chainMask = 0;
      if (Array.isArray(raw.chains) && raw.chains.length > 0) {
        for (let index = 0; index < raw.chains.length; index++) {
          const chainIndex = chainNames.get(raw.chains[index]);
          if (chainIndex === undefined) {
            throw new gdjs.SpringBoneConfigurationError('invalid-json');
          }
          chainMask |= 1 << chainIndex;
        }
      } else {
        chainMask = chains.length === 32 ? 0xffffffff : (1 << chains.length) - 1;
      }

      let a: [number, number, number] | null = null;
      let b: [number, number, number] | null = null;
      let radiusA: number | null = null;
      let radiusB: number | null = null;
      if (raw.type === 'sphere') {
        a = b = finiteVector3(raw.center);
        radiusA = radiusB = finiteNumber(raw.radius);
      } else if (raw.type === 'capsule') {
        a = finiteVector3(raw.a);
        b = finiteVector3(raw.b);
        if (!a || !b) {
          const center = finiteVector3(raw.center);
          const axis = finiteVector3(raw.axis);
          const length = finiteNumber(raw.length);
          if (!center || !axis || length === null || length <= 0) {
            throw new gdjs.SpringBoneConfigurationError('invalid-json');
          }
          const axisLength = Math.hypot(axis[0], axis[1], axis[2]);
          if (axisLength <= 1e-8) {
            throw new gdjs.SpringBoneConfigurationError('invalid-json');
          }
          const half = length / (2 * axisLength);
          a = [
            center[0] - axis[0] * half,
            center[1] - axis[1] * half,
            center[2] - axis[2] * half,
          ];
          b = [
            center[0] + axis[0] * half,
            center[1] + axis[1] * half,
            center[2] + axis[2] * half,
          ];
        }
        radiusA = finiteNumber(raw.radiusA ?? raw.radius);
        radiusB = finiteNumber(raw.radiusB ?? raw.radius);
      }
      if (
        !a ||
        !b ||
        radiusA === null ||
        radiusB === null ||
        radiusA <= 0 ||
        radiusB <= 0
      ) {
        throw new gdjs.SpringBoneConfigurationError('invalid-json');
      }
      colliders.push({
        name,
        bone,
        aX: a[0],
        aY: a[1],
        aZ: a[2],
        bX: b[0],
        bY: b[1],
        bZ: b[2],
        radiusA,
        radiusB,
        chainMask: chainMask >>> 0,
      });
    }

    return { formatVersion: 1, chains, colliders, pointCount };
  };
}
