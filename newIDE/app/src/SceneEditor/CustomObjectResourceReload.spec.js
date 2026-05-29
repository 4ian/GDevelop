// @flow
import { makeTestProject } from '../fixtures/TestProject';
import {
  getImageResourceNamesForEditedObject,
  shouldResetObjectRendererForCustomObjectChildrenEdit,
} from './CustomObjectResourceReload';

const gd: libGDevelop = global.gd;

const addSpriteFrame = (object: gdObject, imageName: string) => {
  const spriteConfig = gd.asSpriteConfiguration(object.getConfiguration());
  const animation = new gd.Animation();
  animation.setDirectionsCount(1);
  const sprite = new gd.Sprite();
  sprite.setImageName(imageName);
  animation.getDirection(0).addSprite(sprite);
  spriteConfig.getAnimations().addAnimation(animation);
};

describe('CustomObjectResourceReload', () => {
  it('only reloads the edited child object resources', () => {
    const { project } = makeTestProject(gd);
    const eventsBasedObject = project.getEventsBasedObject(
      'Button::PanelSpriteButton'
    );
    const editedObject = eventsBasedObject
      .getObjects()
      .insertNewObject(project, 'Sprite', 'EditedSprite', 0);
    const unrelatedObject = eventsBasedObject
      .getObjects()
      .insertNewObject(project, 'Sprite', 'UnrelatedSprite', 1);
    addSpriteFrame(editedObject, 'fake-image1.png');
    addSpriteFrame(unrelatedObject, 'fake-image2.png');

    expect(getImageResourceNamesForEditedObject(project, editedObject)).toEqual(
      ['fake-image1.png']
    );
  });

  it('only resets the edited child and dependent custom objects', () => {
    const { project, testLayout, customObject, spriteObject } = makeTestProject(
      gd
    );
    const eventsBasedObject = project.getEventsBasedObject(
      'Button::PanelSpriteButton'
    );
    const editedObject = eventsBasedObject
      .getObjects()
      .insertNewObject(project, 'Sprite', 'EditedSprite', 0);
    const otherExtension = project.insertNewEventsFunctionsExtension(
      'OtherExtension',
      0
    );
    otherExtension.getEventsBasedObjects().insertNew('OtherCustomObject', 0);
    const unrelatedCustomObject = testLayout
      .getObjects()
      .insertNewObject(
        project,
        'OtherExtension::OtherCustomObject',
        'OtherCustomObject',
        0
      );

    expect(
      shouldResetObjectRendererForCustomObjectChildrenEdit({
        project,
        object: editedObject,
        editedEventsBasedObject: eventsBasedObject,
        editedObject,
      })
    ).toBe(true);
    expect(
      shouldResetObjectRendererForCustomObjectChildrenEdit({
        project,
        object: customObject,
        editedEventsBasedObject: eventsBasedObject,
        editedObject,
      })
    ).toBe(true);
    expect(
      shouldResetObjectRendererForCustomObjectChildrenEdit({
        project,
        object: unrelatedCustomObject,
        editedEventsBasedObject: eventsBasedObject,
        editedObject,
      })
    ).toBe(false);
    expect(
      shouldResetObjectRendererForCustomObjectChildrenEdit({
        project,
        object: spriteObject,
        editedEventsBasedObject: eventsBasedObject,
        editedObject,
      })
    ).toBe(false);
  });
});
