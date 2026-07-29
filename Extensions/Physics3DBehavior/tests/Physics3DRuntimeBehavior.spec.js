describe('Physics3DRuntimeBehavior', () => {
  describe('data normalization', () => {
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
  });
});
