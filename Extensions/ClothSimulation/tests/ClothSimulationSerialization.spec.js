// @ts-check

describe('Cloth simulation data compatibility', function () {
  it('fills every field for old or missing content', function () {
    const normalized = gdjs.normalizeCloth3DObjectData(
      /** @type {any} */ ({
        name: 'OldCloth',
        type: 'ClothSimulation::Cloth3DObject',
        variables: [],
        behaviors: [],
        effects: [],
        content: {},
      })
    );
    expect(normalized.content.width).to.be(200);
    expect(normalized.content.height).to.be(200);
    expect(normalized.content.depth).to.be(100);
    expect(normalized.content.segmentsX).to.be(30);
    expect(normalized.content.segmentsY).to.be(30);
    expect(normalized.content.backendPreference).to.be('Auto');
    expect(normalized.content.pinMode).to.be('TopEveryN');
    expect(normalized.content.color).to.be('32;64;128');
    expect(normalized.content.isReceivingShadow).to.be(true);
  });

  it('preserves valid siblings while independently replacing malformed fields', function () {
    const normalized = gdjs.normalizeCloth3DObjectData(
      /** @type {any} */ ({
        name: 'Cloth',
        type: 'ClothSimulation::Cloth3DObject',
        variables: [],
        behaviors: [],
        effects: [],
        content: {
          width: 321,
          height: Number.NaN,
          segmentsX: 7.9,
          segmentsY: 11,
          gravityX: 42,
          gravityY: Number.NEGATIVE_INFINITY,
          color: '#123456',
        },
      })
    );
    expect(normalized.content.width).to.be(321);
    expect(normalized.content.height).to.be(200);
    expect(normalized.content.segmentsX).to.be(7);
    expect(normalized.content.segmentsY).to.be(11);
    expect(normalized.content.gravityX).to.be(42);
    expect(normalized.content.gravityY).to.be(0);
    expect(normalized.content.color).to.be('18;52;86');
  });
});
