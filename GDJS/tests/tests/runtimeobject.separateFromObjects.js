// @ts-check
/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

describe('gdjs.RuntimeObject.separateFromObjects', () => {
  const runtimeGame = gdjs.getPixiRuntimeGame();
  const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

  const object = new gdjs.TestRuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    variables: [],
    behaviors: [],
    effects: [],
  });
  object.setCustomWidthAndHeight(100, 100);
  object.setCustomCenter(0, 0);

  const obstacle1 = new gdjs.TestRuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    variables: [],
    behaviors: [],
    effects: [],
  });
  obstacle1.setCustomWidthAndHeight(100, 100);
  obstacle1.setCustomCenter(0, 0);

  const obstacle2 = new gdjs.TestRuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    variables: [],
    behaviors: [],
    effects: [],
  });
  obstacle2.setCustomWidthAndHeight(100, 100);
  obstacle2.setCustomCenter(0, 0);

  it('can be separated from 2 aligned objects', () => {
    object.setPosition(200, 300);
    // 2 obstacles on the left
    obstacle1.setPosition(290, 250);
    obstacle2.setPosition(290, 350);

    expect(object.separateFromObjects([obstacle1, obstacle2], true)).to.be(
      true
    );
    expect(object.getX()).to.be(190);
    expect(object.getY()).to.be(300);
  });

  it('can be separated from 2 not exactly aligned objects', () => {
    object.setPosition(200, 300);
    // 2 obstacles on the left
    obstacle1.setPosition(290, 250);
    obstacle2.setPosition(295, 350);

    expect(object.separateFromObjects([obstacle1, obstacle2], true)).to.be(
      true
    );
    expect(object.getX()).to.be(190);
    expect(object.getY()).to.be(300);
  });

  it('can be separated from 2 objects that form a corner', () => {
    object.setPosition(200, 300);
    // 1 obstacle on the top
    obstacle1.setPosition(250, 220);
    // 1 obstacle on the left
    obstacle2.setPosition(290, 250);

    expect(object.separateFromObjects([obstacle1, obstacle2], true)).to.be(
      true
    );
    expect(object.getX()).to.be(190);
    expect(object.getY()).to.be(320);
  });

  it('can be separated from 2 rotated objects', () => {
    object.setPosition(200, 300);
    // 1 obstacle on the top left corner
    obstacle1.setPosition(250, 280);
    obstacle1.setAngle(-45);
    // 1 obstacle on the bottom left corner
    obstacle2.setPosition(250, 420);
    obstacle2.setAngle(-45);

    expect(object.separateFromObjects([obstacle1, obstacle2], true)).to.be(
      true
    );
    expect(object.getX()).to.be(170);
    expect(object.getY()).to.be(300);
  });

  it('can be separated from 2 aligned objects when everything is rotated', () => {
    object.setPosition(240, 350);
    object.setAngle(-45);
    // 2 obstacles on the top left
    obstacle1.setPosition(250, 250);
    obstacle1.setAngle(-45);
    obstacle2.setPosition(330, 330);
    obstacle1.setAngle(-45);

    expect(object.separateFromObjects([obstacle1, obstacle2], true)).to.be(
      true
    );
    expect(object.getX()).to.be.within(224, 225);
    expect(object.getY()).to.be.within(365, 366);
  });
});
