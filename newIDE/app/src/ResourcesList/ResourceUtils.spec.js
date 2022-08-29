// @flow
import { renameResourcesInProject } from './ResourceUtils';
import { makeTestProject } from '../fixtures/TestProject';
const gd: libGDevelop = global.gd;

const addNewAnimationWithImageToSpriteObject = (
  object: gdObject,
  imageName: string
) => {
  const spriteObject = gd.asSpriteObject(object.getConfiguration());

  const animation = new gd.Animation();
  animation.setDirectionsCount(1);
  const sprite = new gd.Sprite();
  sprite.setImageName(imageName);
  animation.getDirection(0).addSprite(sprite);
  spriteObject.addAnimation(animation);
};

describe('ResourceUtils', () => {
  it('can rename a resource in the whole project', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();

    // Add some fake resources
    const resource1 = new gd.ImageResource();
    const resource2 = new gd.ImageResource();
    const audioResource1 = new gd.AudioResource();
    const audioResource2 = new gd.AudioResource();
    resource1.setName('fake-image1.png');
    resource1.setFile('fake-image1.png');
    resource2.setName('fake-image2.png');
    resource2.setFile('fake-image2.png');
    audioResource1.setName('fake-audio1.mp3');
    audioResource1.setFile('fake-audio1.mp3');
    audioResource2.setName('fake-audio2.mp3');
    audioResource2.setFile('fake-audio2.mp3');
    project.getResourcesManager().addResource(resource1);
    project.getResourcesManager().addResource(resource2);
    project.getResourcesManager().addResource(audioResource1);
    project.getResourcesManager().addResource(audioResource2);

    // Add objects using these resources
    const globalObject = project.insertNewObject(
      project,
      'Sprite',
      'MyGlobalObject',
      0
    );
    addNewAnimationWithImageToSpriteObject(globalObject, 'fake-image1.png');

    const scene = project.insertNewLayout('MyScene', 0);
    const object = scene.insertNewObject(project, 'Sprite', 'MyObject', 0);
    addNewAnimationWithImageToSpriteObject(object, 'fake-image1.png');

    // Also add an event referring to these resources.
    const event = new gd.StandardEvent();
    const action = new gd.Instruction();
    action.setType('PlaySound');
    action.setParametersCount(5);
    action.setParameter(0, ''); // The runtime scene passed as parameter
    action.setParameter(1, 'fake-audio1.mp3');
    action.setParameter(2, 'no');
    action.setParameter(3, '100');
    action.setParameter(4, '1');
    event.getActions().insert(action, 0);
    scene.getEvents().insertEvent(event, 0);

    // Rename some resources
    project.getResourcesManager().renameResource('fake-image1.png', 'Image1');
    project.getResourcesManager().renameResource('fake-audio1.mp3', 'Audio1');
    renameResourcesInProject(project, {
      'fake-image1.png': 'Image1',
      'fake-audio1.mp3': 'Audio1',
    });

    expect(project.getResourcesManager().hasResource('fake-image1.png')).toBe(
      false
    );
    expect(project.getResourcesManager().hasResource('Image1')).toBe(true);
    expect(project.getResourcesManager().hasResource('fake-audio1.mp3')).toBe(
      false
    );
    expect(project.getResourcesManager().hasResource('Audio1')).toBe(true);

    // Verify files have not changed:
    expect(
      project
        .getResourcesManager()
        .getResource('Image1')
        .getFile()
    ).toBe('fake-image1.png');
    expect(
      project
        .getResourcesManager()
        .getResource('Audio1')
        .getFile()
    ).toBe('fake-audio1.mp3');

    // Verify renaming was done in objects and in events.
    expect(
      gd
        .asSpriteObject(globalObject.getConfiguration())
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0)
        .getImageName()
    ).toBe('Image1');
    expect(
      gd
        .asSpriteObject(object.getConfiguration())
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0)
        .getImageName()
    ).toBe('Image1');
    expect(
      gd
        .asStandardEvent(scene.getEvents().getEventAt(0))
        .getActions()
        .get(0)
        .getParameter(1)
        .getPlainString()
    ).toBe('Audio1');
  });
});
