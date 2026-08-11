const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

describe('libGD.js - Model3DObjectConfiguration', () => {
  let gd = null;

  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  test('serializes and restores shared animation model resources', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const configuration = new gd.Model3DObjectConfiguration();
    configuration.updateProperty('modelResourceName', 'Knight.glb');
    configuration.addSharedAnimationModelResource('Movement.glb');
    configuration.addSharedAnimationModelResource('Combat.glb');
    configuration.addSharedAnimationModelResource('Movement.glb');

    const animation = new gd.Model3DAnimation();
    animation.setName('Run');
    animation.setSource('Run');
    animation.setSourceModelResourceName('Movement.glb');
    animation.setShouldLoop(true);
    animation.setShouldUseRootMotion(false);
    configuration.addAnimation(animation);
    animation.delete();

    const element = new gd.SerializerElement();
    configuration.serializeTo(element);
    const serializedConfiguration = JSON.parse(gd.Serializer.toJSON(element));
    expect(
      serializedConfiguration.content.sharedAnimationModelResources
    ).toEqual([
      { resourceName: 'Movement.glb' },
      { resourceName: 'Combat.glb' },
    ]);
    expect(serializedConfiguration.content.animations[0]).toEqual({
      loop: true,
      name: 'Run',
      source: 'Run',
      sourceModelResourceName: 'Movement.glb',
      useRootMotion: false,
    });

    const restoredConfiguration = new gd.Model3DObjectConfiguration();
    restoredConfiguration.unserializeFrom(project, element);
    expect(restoredConfiguration.getSharedAnimationModelResourcesCount()).toBe(
      2
    );
    expect(restoredConfiguration.getSharedAnimationModelResourceName(0)).toBe(
      'Movement.glb'
    );
    expect(restoredConfiguration.getSharedAnimationModelResourceName(1)).toBe(
      'Combat.glb'
    );
    expect(
      restoredConfiguration.getAnimation(0).getSourceModelResourceName()
    ).toBe('Movement.glb');
    expect(restoredConfiguration.getAnimation(0).shouldUseRootMotion()).toBe(
      false
    );

    restoredConfiguration.delete();
    element.delete();
    configuration.delete();
    project.delete();
  });

  test('keeps old animations on the primary model by default', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const element = gd.Serializer.fromJSON(
      JSON.stringify({
        content: {
          animations: [{ name: 'Idle', source: 'Idle', loop: true }],
        },
      })
    );
    const configuration = new gd.Model3DObjectConfiguration();
    configuration.unserializeFrom(project, element);

    expect(configuration.getSharedAnimationModelResourcesCount()).toBe(0);
    expect(configuration.getAnimation(0).getSourceModelResourceName()).toBe('');
    expect(configuration.getAnimation(0).shouldUseRootMotion()).toBe(true);

    configuration.delete();
    project.delete();
  });
});
