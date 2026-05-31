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
  describe('getImageResourceNamesForEditedObject', () => {
    it('only returns the resources of the edited object', () => {
      const { project } = makeTestProject(gd);
      const eventsBasedObject = project.getEventsBasedObject(
        'Button::PanelSpriteButton'
      );
      const editedObject = eventsBasedObject
        .getObjects()
        .insertNewObject(project, 'Sprite', 'EditedSprite', 0);
      const siblingObject = eventsBasedObject
        .getObjects()
        .insertNewObject(project, 'Sprite', 'SiblingSprite', 1);
      addSpriteFrame(editedObject, 'fake-image1.png');
      addSpriteFrame(siblingObject, 'fake-image2.png');

      expect(
        getImageResourceNamesForEditedObject(project, editedObject)
      ).toEqual(['fake-image1.png']);
    });
  });

  describe('shouldResetObjectRendererForCustomObjectChildrenEdit', () => {
    it('resets the edited object, direct/transitive dependents but not unrelated objects', () => {
      const {
        project,
        testLayout,
        customObject, // A "Button::PanelSpriteButton" (the edited type itself).
        spriteObject, // A plain Sprite.
      } = makeTestProject(gd);

      const editedEventsBasedObject = project.getEventsBasedObject(
        'Button::PanelSpriteButton'
      );
      const editedObject = editedEventsBasedObject
        .getObjects()
        .insertNewObject(project, 'Sprite', 'EditedSprite', 0);

      // A custom object that (transitively) nests the edited events-based object.
      const nestingExtension = project.insertNewEventsFunctionsExtension(
        'NestingExtension',
        0
      );
      const containerEventsBasedObject = nestingExtension
        .getEventsBasedObjects()
        .insertNew('Container', 0);
      containerEventsBasedObject
        .getObjects()
        .insertNewObject(project, 'Button::PanelSpriteButton', 'NestedButton', 0);
      const nestingCustomObject = testLayout
        .getObjects()
        .insertNewObject(
          project,
          'NestingExtension::Container',
          'MyContainer',
          0
        );

      // A custom object that does not depend on the edited events-based object.
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
          'MyOtherCustomObject',
          0
        );

      const check = object =>
        shouldResetObjectRendererForCustomObjectChildrenEdit({
          project,
          object,
          editedEventsBasedObject,
          editedObject,
        });

      // The edited object itself.
      expect(check(editedObject)).toBe(true);
      // A custom object of the edited type (direct dependency).
      expect(check(customObject)).toBe(true);
      // A custom object that transitively nests the edited type.
      expect(check(nestingCustomObject)).toBe(true);
      // A custom object that does not depend on the edited type.
      expect(check(unrelatedCustomObject)).toBe(false);
      // A plain object.
      expect(check(spriteObject)).toBe(false);
    });

    it('does not reset unrelated objects when no specific object was edited', () => {
      const { project, spriteObject } = makeTestProject(gd);
      const editedEventsBasedObject = project.getEventsBasedObject(
        'Button::PanelSpriteButton'
      );

      // Without an editedObject, only dependents of the edited events-based
      // object are reset (e.g. on a structural change like a deletion).
      expect(
        shouldResetObjectRendererForCustomObjectChildrenEdit({
          project,
          object: spriteObject,
          editedEventsBasedObject,
        })
      ).toBe(false);
    });
  });
});
