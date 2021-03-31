// @ts-check

/**
 * Basic tests for gdjs.SpriteRuntimeObject
 */
describe('gdjs.SpriteRuntimeObject', function() {
  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    // @ts-expect-error ts-migrate(2740) FIXME: Type '{ windowWidth: number; windowHeight: number;... Remove this comment to see the full error message
    properties: { windowWidth: 800, windowHeight: 600 },
    resources: { resources: [] }
  });
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);

  it('should handle scaling properly', function() {
    var object = new gdjs.SpriteRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      updateIfNotVisible: false,
      variables: [],
      behaviors: [],
      animations: [],
    });

    expect(object.getScaleX()).to.be(1);
    object.flipX(true);
    expect(object.getScaleX()).to.be(1);
    object.setScaleX(0.42);
    expect(object.getScaleX()).to.be(0.42);
    expect(object.isFlippedX()).to.be(true);
    object.flipX(false);
    expect(object.isFlippedX()).to.be(false);
    expect(object.getScaleX()).to.be(0.42);
  });

  describe('Animations', function() {
    var object = new gdjs.SpriteRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: '',
      updateIfNotVisible: false,
      behaviors: [],
      variables: [],
      animations: [
        {
          name: 'firstAnimation',
          useMultipleDirections: false,
          directions: [],
        },
        {
          name: 'secondAnimation',
          useMultipleDirections: false,
          directions: [],
        },
        {
          name: '',
          useMultipleDirections: false,
          directions: [],
        },
      ],
    });

    it('can change animation using animation name', function() {
      expect(object.getAnimationName()).to.be('firstAnimation');
      object.setAnimationName('secondAnimation');
      expect(object.getAnimationName()).to.be('secondAnimation');
      expect(object.getAnimation()).to.be(1);
      expect(object.isCurrentAnimationName('secondAnimation')).to.be(true);
      expect(object.isCurrentAnimationName('firstAnimation')).to.be(false);
    });

    it('keeps the same animation when using an invalid/empty name', function() {
      object.setAnimationName('unexisting animation');
      expect(object.getAnimation()).to.be(1);
      object.setAnimationName('');
      expect(object.getAnimation()).to.be(1);
    });

    it('can change animation using animation index', function() {
      object.setAnimation(2);
      expect(object.getAnimationName()).to.be('');
      object.setAnimation(0);
      expect(object.getAnimationName()).to.be('firstAnimation');
    });
  });
});
