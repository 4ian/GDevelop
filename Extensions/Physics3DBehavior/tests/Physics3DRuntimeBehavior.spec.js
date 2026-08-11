describe('Physics3DRuntimeBehavior', () => {
  describe('data normalization', () => {
    it('resolves the shared-data normalizer from the gdjs namespace', () => {
      const originalJolt = window.Jolt;
      const originalNormalizer = gdjs.normalizePhysics3DSharedData;
      const sentinelError = new Error('shared normalizer called');
      window.Jolt = {
        Vec3: class {},
        RVec3: class {},
        Quat: class {},
      };
      gdjs.normalizePhysics3DSharedData = () => {
        throw sentinelError;
      };

      try {
        expect(
          () => new gdjs.Physics3DSharedData({}, { name: 'Physics3D' })
        ).to.throwException((error) => {
          expect(error).to.be(sentinelError);
        });
      } finally {
        gdjs.normalizePhysics3DSharedData = originalNormalizer;
        window.Jolt = originalJolt;
      }
    });

    it('resolves the behavior-data normalizer from the gdjs namespace', () => {
      const originalNormalizer = gdjs.normalizePhysics3DBehaviorData;
      const sentinelError = new Error('behavior normalizer called');
      gdjs.normalizePhysics3DBehaviorData = () => {
        throw sentinelError;
      };

      try {
        expect(
          () =>
            new gdjs.Physics3DRuntimeBehavior(
              {
                getGame: () => ({
                  isInGameEdition: () => false,
                }),
              },
              {
                name: 'Physics3D',
                type: 'Physics3D::Physics3DBehavior',
              },
              {}
            )
        ).to.throwException((error) => {
          expect(error).to.be(sentinelError);
        });
      } finally {
        gdjs.normalizePhysics3DBehaviorData = originalNormalizer;
      }
    });

    it('applies finite Physics3D shared defaults', () => {
      const normalized = gdjs.normalizePhysics3DSharedData({
        name: 'Physics3D',
        type: 'Physics3D::Physics3DBehavior',
      });

      expect(normalized.gravityX).to.be(0);
      expect(normalized.gravityY).to.be(0);
      expect(normalized.gravityZ).to.be(-9.8);
      expect(normalized.worldScale).to.be(100);
      expect(1 / normalized.worldScale).to.be(0.01);
      expect(normalized.invalidFields).to.contain('worldScale');
    });

    [undefined, 0, -1, NaN, Infinity].forEach((value) => {
      it(`falls back from invalid worldScale ${String(value)}`, () => {
        const normalized = gdjs.normalizePhysics3DSharedData({
          gravityX: 0,
          gravityY: 0,
          gravityZ: -9.8,
          worldScale: value,
        });

        expect(normalized.worldScale).to.be(100);
        expect(Number.isFinite(1 / normalized.worldScale)).to.be(true);
      });
    });

    it('keeps valid zero-valued fields and hydrates hidden behavior defaults', () => {
      const normalized = gdjs.normalizePhysics3DBehaviorData({
        name: 'Physics3D',
        shapeDimensionA: 0,
        massOverride: 0,
      });

      expect(normalized.shapeDimensionA).to.be(0);
      expect(normalized.shapeDimensionB).to.be(0);
      expect(normalized.shapeDimensionC).to.be(0);
      expect(normalized.shapeOffsetX).to.be(0);
      expect(normalized.massCenterOffsetZ).to.be(0);
      expect(normalized.massOverride).to.be(0);
      expect(normalized.layers).to.be(17);
      expect(normalized.masks).to.be(17);
    });

    [
      { bodyType: 'Dynamic', layers: 1, expectedLayers: 17 },
      { bodyType: 'Kinematic', layers: 1, expectedLayers: 17 },
      { bodyType: 'Static', layers: 16, expectedLayers: 17 },
    ].forEach(({ bodyType, layers, expectedLayers }) => {
      it(`repairs ${bodyType} layers that only select the other body-type group`, () => {
        const normalized = gdjs.normalizePhysics3DBehaviorData({
          name: 'Physics3D',
          bodyType,
          layers,
          masks: 17,
        });

        expect(normalized.layers).to.be(expectedLayers);
        expect(normalized.invalidFields).to.contain('layers');
      });
    });

    it('preserves an explicit zero layer bitfield', () => {
      const normalized = gdjs.normalizePhysics3DBehaviorData({
        name: 'Physics3D',
        bodyType: 'Dynamic',
        layers: 0,
        masks: 17,
      });

      expect(normalized.layers).to.be(0);
      expect(normalized.invalidFields).not.to.contain('layers');
    });
  });
});
