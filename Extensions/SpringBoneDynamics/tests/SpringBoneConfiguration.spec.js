// @ts-check

describe('Spring bone configuration', function () {
  const makeConfiguration = () => ({
    formatVersion: 1,
    chains: [
      {
        name: 'Hair',
        bones: ['Hair_1', 'Hair_2', 'Hair_End'],
        damping: 0.9,
        stiffness: 0.2,
        gravity: [0, 0, -600],
        maxAngleDegrees: 80,
        collisionPointCount: 2,
      },
    ],
    colliders: [
      {
        name: 'Head',
        type: 'capsule',
        bone: 'Head',
        center: [0, 0, 1],
        axis: [0, 0, 1],
        length: 0.5,
        radiusA: 0.2,
        radiusB: 0.1,
        chains: ['Hair'],
      },
    ],
  });

  it('normalizes a version-1 chain and tapered capsule', function () {
    const parsed = gdjs.parseSpringBoneConfiguration(makeConfiguration());
    expect(parsed.pointCount).to.be(3);
    expect(parsed.chains[0].collisionStartPoint).to.be(1);
    expect(parsed.chains[0].collisionPointCount).to.be(2);
    expect(parsed.colliders[0].aZ).to.be(0.75);
    expect(parsed.colliders[0].bZ).to.be(1.25);
    expect(parsed.colliders[0].radiusA).to.be(0.2);
    expect(parsed.colliders[0].chainMask).to.be(1);
  });

  it('rejects duplicate bones and unknown collider chain filters', function () {
    const duplicate = makeConfiguration();
    duplicate.chains[0].bones[2] = 'Hair_1';
    expect(() => gdjs.parseSpringBoneConfiguration(duplicate)).to.throwError(
      /duplicate-bone/
    );
    const unknown = makeConfiguration();
    unknown.colliders[0].chains = ['Missing'];
    expect(() => gdjs.parseSpringBoneConfiguration(unknown)).to.throwError(
      /invalid-json/
    );
  });

  it('rejects unsupported versions and non-finite forces', function () {
    const version = makeConfiguration();
    version.formatVersion = 2;
    expect(() => gdjs.parseSpringBoneConfiguration(version)).to.throwError(
      /invalid-json/
    );
    const nonFinite = makeConfiguration();
    nonFinite.chains[0].gravity[2] = Number.NaN;
    expect(() => gdjs.parseSpringBoneConfiguration(nonFinite)).to.throwError(
      /invalid-chain/
    );
  });
});
