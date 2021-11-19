describe('gdjs.AffineTransformation', function () {
  const epsilon = 1 / (2 << 16);

  it('can conserve identity through identity', function () {
    const identityA = new gdjs.AffineTransformation();
    const identityB = new gdjs.AffineTransformation();

    expect(identityA.equals(identityB)).to.be(true);

    identityB.setToIdentity();
    expect(identityA.equals(identityB)).to.be(true);

    identityB.concatenate(identityA);
    expect(identityA.equals(identityB)).to.be(true);
  });

  it('can compose translations', function () {
    const translationA = new gdjs.AffineTransformation();
    translationA.setToTranslation(12 + 45, 67 + 89);

    const translationB = new gdjs.AffineTransformation();
    translationB.setToTranslation(12, 67);
    translationB.translate(45, 89);

    expect(translationA.equals(translationB)).to.be(true);
  });

  it('can compose rotations', function () {
    const rotationA = new gdjs.AffineTransformation();
    rotationA.setToRotation(Math.PI / 3 + Math.PI / 2);

    const rotationB = new gdjs.AffineTransformation();
    rotationB.setToRotation(Math.PI / 3);
    rotationB.rotate(Math.PI / 2);

    expect(rotationA.nearlyEquals(rotationB, epsilon)).to.be(true);
  });

  it('can do exact 90° rotation transformations', function () {
    const rotationA = new gdjs.AffineTransformation();
    rotationA.setToRotation(90 * Math.PI / 180);

    const result = [10, 5];
    rotationA.transform(result, result);
    expect(result).to.eql([-5, 10]);
  });

  it('can compose scales', function () {
    const scaleA = new gdjs.AffineTransformation();
    scaleA.setToScale(2 * 4, 3 * 5);

    const scaleB = new gdjs.AffineTransformation();
    scaleB.setToScale(2, 3);
    scaleB.scale(4, 5);

    expect(scaleA.equals(scaleB)).to.be(true);
  });
});
