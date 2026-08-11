namespace gdjs {
  /**
   * Normalize Physics3D shared data before it is used to build the Jolt world.
   * This file intentionally has no Jolt dependency so compatibility checks can
   * run before the physics runtime is loaded.
   */
  export const normalizePhysics3DSharedData = (sharedData: any): any => {
    const source = sharedData || {};
    const invalidFields: Array<string> = [];
    const readFinite = (name: string, defaultValue: number): number => {
      const value = source[name];
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      invalidFields.push(name);
      return defaultValue;
    };
    const gravityX = readFinite('gravityX', 0);
    const gravityY = readFinite('gravityY', 0);
    const gravityZ = readFinite('gravityZ', -9.8);
    const worldScaleValue = source.worldScale;
    const worldScale =
      typeof worldScaleValue === 'number' &&
      Number.isFinite(worldScaleValue) &&
      worldScaleValue > 0
        ? worldScaleValue
        : 100;
    if (worldScale !== worldScaleValue) invalidFields.push('worldScale');
    return {
      ...source,
      gravityX,
      gravityY,
      gravityZ,
      worldScale,
      invalidFields,
    };
  };

  /**
   * Normalize fields that the editor normally writes but hand-authored or old
   * multi-file projects can omit.
   */
  export const normalizePhysics3DBehaviorData = (behaviorData: any): any => {
    const source = behaviorData || {};
    const invalidFields: Array<string> = [];
    const readFinite = (name: string, defaultValue: number): number => {
      const value = source[name];
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      invalidFields.push(name);
      return defaultValue;
    };
    const readInteger = (name: string, defaultValue: number): number => {
      const value = source[name];
      if (typeof value === 'number' && Number.isInteger(value)) return value;
      invalidFields.push(name);
      return defaultValue;
    };
    const bodyType =
      typeof source.bodyType === 'string' ? source.bodyType : 'Dynamic';
    let layers = readInteger('layers', 17);
    const bodyTypeLayersMask = bodyType === 'Static' ? 0x0f : 0xf0;
    const defaultBodyTypeLayer = bodyType === 'Static' ? 1 : 1 << 4;
    // A non-zero bitfield containing only layers for the other body type is
    // invalid: the runtime body-type filter would otherwise turn it into an
    // effective layer of zero. Keep an explicit zero as a supported way to
    // opt out of collisions, but repair legacy or hand-authored mismatches.
    if (layers !== 0 && (layers & bodyTypeLayersMask) === 0) {
      layers |= defaultBodyTypeLayer;
      invalidFields.push('layers');
    }
    return {
      ...source,
      bodyType,
      bullet: !!source.bullet,
      fixedRotation: !!source.fixedRotation,
      shape: typeof source.shape === 'string' ? source.shape : 'Box',
      shapeOrientation:
        typeof source.shapeOrientation === 'string'
          ? source.shapeOrientation
          : 'Z',
      shapeDimensionA: readFinite('shapeDimensionA', 0),
      shapeDimensionB: readFinite('shapeDimensionB', 0),
      shapeDimensionC: readFinite('shapeDimensionC', 0),
      shapeOffsetX: readFinite('shapeOffsetX', 0),
      shapeOffsetY: readFinite('shapeOffsetY', 0),
      shapeOffsetZ: readFinite('shapeOffsetZ', 0),
      massCenterOffsetX: readFinite('massCenterOffsetX', 0),
      massCenterOffsetY: readFinite('massCenterOffsetY', 0),
      massCenterOffsetZ: readFinite('massCenterOffsetZ', 0),
      massOverride: readFinite('massOverride', 0),
      density: Math.max(0.0001, readFinite('density', 1)),
      friction: readFinite('friction', 0.3),
      restitution: readFinite('restitution', 0.1),
      linearDamping: Math.max(0, readFinite('linearDamping', 0.1)),
      angularDamping: Math.max(0, readFinite('angularDamping', 0.1)),
      gravityScale: readFinite('gravityScale', 1),
      layers,
      masks: readInteger('masks', 17),
      invalidFields,
    };
  };
}
