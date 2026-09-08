// @flow
import {
  applyPropertyChanges,
  getAllowedPropertyTypes,
  type PropertyChange,
  type PropertyChangesResult,
} from './PropertyChanges';

const gd: libGDevelop = global.gd;

/**
 * A project with an extension holding a behavior (a property and a shared
 * property) and a custom object with properties, plus a scene using both.
 */
const createFakeProjectWithExtension = () => {
  // $FlowFixMe[invalid-constructor]
  const project = new gd.ProjectHelper.createNewGDJSProject();
  const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);

  const eventsBasedBehavior = extension
    .getEventsBasedBehaviors()
    .insertNew('MyBehavior', 0);
  eventsBasedBehavior
    .getPropertyDescriptors()
    .insertNew('Health', 0)
    .setType('Number')
    .setValue('100');
  eventsBasedBehavior
    .getSharedPropertyDescriptors()
    .insertNew('Gravity', 0)
    .setType('Number')
    .setValue('9.8');

  const eventsBasedObject = extension
    .getEventsBasedObjects()
    .insertNew('MyButton', 0);
  eventsBasedObject
    .getPropertyDescriptors()
    .insertNew('Fill', 0)
    .setType('Color')
    .setValue('255;255;255');
  eventsBasedObject
    .getPropertyDescriptors()
    .insertNew('Size', 1)
    .setType('Number')
    .setValue('32');

  const scene = project.insertNewLayout('Level', 0);
  const button = scene
    .getObjects()
    .insertNewObject(project, 'MyExt::MyButton', 'Button', 0);
  button.getConfiguration().updateProperty('Fill', '255;0;0');
  const player = scene
    .getObjects()
    .insertNewObject(project, 'Sprite', 'Player', 1);
  player.addNewBehavior(project, 'MyExt::MyBehavior', 'MyBehavior');
  player.getBehavior('MyBehavior').updateProperty('Health', '50');

  return {
    project,
    extension,
    eventsBasedBehavior,
    eventsBasedObject,
    button,
    player,
  };
};

const expectSuccess = (
  result: PropertyChangesResult
): {| success: true, changedCount: number, messages: Array<string> |} => {
  if (!result.success) {
    throw new Error(`Expected a success, got the failure: ${result.message}`);
  }
  return result;
};

const expectFailureMessage = (result: PropertyChangesResult): string => {
  if (result.success) throw new Error('Expected a failure.');
  return result.message;
};

describe('PropertyChanges', () => {
  let project: gdProject;
  let extension: gdEventsFunctionsExtension;
  let eventsBasedBehavior: gdEventsBasedBehavior;
  let eventsBasedObject: gdEventsBasedObject;
  let button: gdObject;
  let player: gdObject;

  beforeEach(() => {
    ({
      project,
      extension,
      eventsBasedBehavior,
      eventsBasedObject,
      button,
      player,
    } = createFakeProjectWithExtension());
  });

  afterEach(() => {
    project.delete();
  });

  const changeObjectProperties = (
    changes: Array<PropertyChange>
  ): PropertyChangesResult =>
    applyPropertyChanges({
      project,
      eventsFunctionsExtension: extension,
      owner: 'object',
      entity: eventsBasedObject,
      propertiesContainer: eventsBasedObject.getPropertyDescriptors(),
      changes,
    });

  const changeBehaviorProperties = (
    changes: Array<PropertyChange>
  ): PropertyChangesResult =>
    applyPropertyChanges({
      project,
      eventsFunctionsExtension: extension,
      owner: 'behavior',
      entity: eventsBasedBehavior,
      propertiesContainer: eventsBasedBehavior.getPropertyDescriptors(),
      changes,
    });

  const changeBehaviorSharedProperties = (
    changes: Array<PropertyChange>
  ): PropertyChangesResult =>
    applyPropertyChanges({
      project,
      eventsFunctionsExtension: extension,
      owner: 'behavior-shared',
      entity: eventsBasedBehavior,
      propertiesContainer: eventsBasedBehavior.getSharedPropertyDescriptors(),
      changes,
    });

  describe('creating properties', () => {
    it('inserts a property with a Number type by default', () => {
      const result = expectSuccess(
        changeObjectProperties([{ property_name: 'Speed' }])
      );

      expect(result.changedCount).toBe(1);
      const properties = eventsBasedObject.getPropertyDescriptors();
      expect(properties.has('Speed')).toBe(true);
      expect(properties.get('Speed').getType()).toBe('Number');
      // Appended after the existing properties.
      expect(properties.getAt(properties.getCount() - 1).getName()).toBe(
        'Speed'
      );
    });

    it('handles two entries on the same property in one call (create then edit, rename then edit)', () => {
      const created = expectSuccess(
        changeObjectProperties([
          { property_name: 'Style', type: 'Choice', choices: ['a', 'b'] },
          { property_name: 'Style', label: 'Style of the button' },
        ])
      );
      expect(created.changedCount).toBe(2);
      const style = eventsBasedObject.getPropertyDescriptors().get('Style');
      expect(style.getType()).toBe('Choice');
      expect(style.getLabel()).toBe('Style of the button');

      expectSuccess(
        changeObjectProperties([
          { property_name: 'Style', new_name: 'Look' },
          { property_name: 'Look', label: 'Look of the button' },
        ])
      );
      expect(eventsBasedObject.getPropertyDescriptors().has('Style')).toBe(
        false
      );
      expect(
        eventsBasedObject
          .getPropertyDescriptors()
          .get('Look')
          .getLabel()
      ).toBe('Look of the button');
    });

    it('makes the name safe and unique, and says which name to use', () => {
      const result = expectSuccess(
        changeObjectProperties([
          { property_name: 'My speed!', type: 'String', label: 'My speed' },
        ])
      );

      const properties = eventsBasedObject.getPropertyDescriptors();
      expect(properties.has('My_speed_')).toBe(true);
      expect(properties.get('My_speed_').getType()).toBe('String');
      expect(properties.get('My_speed_').getLabel()).toBe('My speed');
      expect(result.messages.join(' ')).toContain('use "My_speed_"');
    });

    it('sets every field of a new property', () => {
      expectSuccess(
        changeObjectProperties([
          {
            property_name: 'Speed',
            type: 'Number',
            label: 'Speed',
            description: 'How fast it moves',
            group: 'Movement',
            default_value: '250',
            measurement_unit: 'PixelSpeed',
            advanced: true,
          },
        ])
      );

      const property = eventsBasedObject.getPropertyDescriptors().get('Speed');
      expect(property.getLabel()).toBe('Speed');
      expect(property.getDescription()).toBe('How fast it moves');
      expect(property.getGroup()).toBe('Movement');
      expect(property.getValue()).toBe('250');
      expect(property.getMeasurementUnit().getName()).toBe('PixelSpeed');
      expect(property.isAdvanced()).toBe(true);
    });
  });

  describe('renaming properties', () => {
    it('renames an object property and the objects using it', () => {
      expectSuccess(
        changeObjectProperties([
          { property_name: 'Fill', new_name: 'BackgroundColor' },
        ])
      );

      expect(
        eventsBasedObject.getPropertyDescriptors().has('BackgroundColor')
      ).toBe(true);
      expect(eventsBasedObject.getPropertyDescriptors().has('Fill')).toBe(
        false
      );
      // The refactorer moved the value stored on the object of the scene.
      const properties = button.getConfiguration().getProperties();
      expect(properties.has('BackgroundColor')).toBe(true);
      expect(properties.get('BackgroundColor').getValue()).toBe('255;0;0');
    });

    it('renames a behavior property and the behaviors using it', () => {
      expectSuccess(
        changeBehaviorProperties([
          { property_name: 'Health', new_name: 'HitPoints' },
        ])
      );

      expect(
        eventsBasedBehavior.getPropertyDescriptors().has('HitPoints')
      ).toBe(true);
      const properties = player.getBehavior('MyBehavior').getProperties();
      expect(properties.has('HitPoints')).toBe(true);
      expect(properties.get('HitPoints').getValue()).toBe('50');
    });

    it('renames a shared property', () => {
      expectSuccess(
        changeBehaviorSharedProperties([
          { property_name: 'Gravity', new_name: 'WorldGravity' },
        ])
      );

      const sharedProperties = eventsBasedBehavior.getSharedPropertyDescriptors();
      expect(sharedProperties.has('WorldGravity')).toBe(true);
      expect(sharedProperties.has('Gravity')).toBe(false);
      expect(sharedProperties.get('WorldGravity').getValue()).toBe('9.8');
    });

    it('makes the new name unique against the other properties', () => {
      const result = expectSuccess(
        changeObjectProperties([{ property_name: 'Fill', new_name: 'Size' }])
      );

      expect(eventsBasedObject.getPropertyDescriptors().has('Size2')).toBe(
        true
      );
      expect(result.messages.join(' ')).toContain('use "Size2"');
    });
  });

  describe('changing the type', () => {
    it('changes the type of a property', () => {
      expectSuccess(
        changeObjectProperties([{ property_name: 'Size', type: 'String' }])
      );

      expect(
        eventsBasedObject
          .getPropertyDescriptors()
          .get('Size')
          .getType()
      ).toBe('String');
    });

    it('gives the "json" resource kind when none is given', () => {
      expectSuccess(
        changeBehaviorProperties([
          { property_name: 'Icon', type: 'Resource' },
          { property_name: 'Sound', type: 'Resource', extra_info: 'audio' },
        ])
      );

      const properties = eventsBasedBehavior.getPropertyDescriptors();
      expect(
        properties
          .get('Icon')
          .getExtraInfo()
          .at(0)
      ).toBe('json');
      expect(
        properties
          .get('Sound')
          .getExtraInfo()
          .at(0)
      ).toBe('audio');
    });

    it('never hides a required behavior property', () => {
      expectSuccess(
        changeBehaviorProperties([
          {
            property_name: 'Platformer',
            type: 'Behavior',
            extra_info: 'PlatformBehavior::PlatformerObjectBehavior',
            hidden: true,
          },
        ])
      );

      const property = eventsBasedBehavior
        .getPropertyDescriptors()
        .get('Platformer');
      expect(property.getType()).toBe('Behavior');
      expect(property.isHidden()).toBe(false);
      expect(property.getExtraInfo().at(0)).toBe(
        'PlatformBehavior::PlatformerObjectBehavior'
      );
    });

    it('asks for the behavior type of a Behavior property', () => {
      const message = expectFailureMessage(
        changeBehaviorProperties([
          { property_name: 'Platformer', type: 'Behavior' },
        ])
      );

      expect(message).toContain('`extra_info`');
      expect(message).toContain('MyExtension::MyBehavior');
      expect(
        eventsBasedBehavior.getPropertyDescriptors().has('Platformer')
      ).toBe(false);
    });
  });

  describe('choices', () => {
    it('sets the choices from a list of objects or from a comma-separated string', () => {
      expectSuccess(
        changeObjectProperties([
          {
            property_name: 'Style',
            type: 'Choice',
            choices: [{ value: 'flat', label: 'Flat' }, { value: 'raised' }],
          },
          {
            property_name: 'Corner',
            type: 'Choice',
            choices: 'sharp, round',
          },
        ])
      );

      const properties = eventsBasedObject.getPropertyDescriptors();
      const styleChoices = properties.get('Style').getChoices();
      expect(styleChoices.size()).toBe(2);
      expect(styleChoices.at(0).getValue()).toBe('flat');
      expect(styleChoices.at(0).getLabel()).toBe('Flat');
      // Without a label, the value is used as the label.
      expect(styleChoices.at(1).getLabel()).toBe('raised');
      expect(
        properties
          .get('Corner')
          .getChoices()
          .size()
      ).toBe(2);
      expect(
        properties
          .get('Corner')
          .getChoices()
          .at(1)
          .getValue()
      ).toBe('round');
    });

    it('refuses choices on a property that is not a Choice', () => {
      const message = expectFailureMessage(
        changeObjectProperties([{ property_name: 'Size', choices: 'a,b' }])
      );

      expect(message).toContain('"Choice" or "NumberWithChoices"');
      expect(
        eventsBasedObject
          .getPropertyDescriptors()
          .get('Size')
          .getChoices()
          .size()
      ).toBe(0);
    });
  });

  describe('measurement units', () => {
    it('lists the existing units when the unit is unknown', () => {
      const message = expectFailureMessage(
        changeObjectProperties([
          { property_name: 'Size', measurement_unit: 'Furlong' },
        ])
      );

      expect(message).toContain('Measurement unit "Furlong" does not exist');
      expect(message).toContain('"Pixel"');
    });
  });

  describe('deleting properties', () => {
    it('deletes a property and warns about the events using it', () => {
      const result = expectSuccess(
        changeObjectProperties([
          { property_name: 'Fill', delete_this_property: true },
        ])
      );

      expect(eventsBasedObject.getPropertyDescriptors().has('Fill')).toBe(
        false
      );
      expect(result.messages.join(' ')).toContain('are now invalid');
    });

    it('lists the existing properties when the property to delete is unknown', () => {
      const message = expectFailureMessage(
        changeObjectProperties([
          { property_name: 'Unknown', delete_this_property: true },
        ])
      );

      expect(message).toBe(
        'Property "Unknown" not found: it cannot be deleted. Existing properties: "Fill", "Size".'
      );
    });
  });

  describe('getter and setter generation', () => {
    it('generates the two functions of a property', () => {
      expectSuccess(
        changeObjectProperties([
          { property_name: 'Size', generate_getter_and_setter: true },
        ])
      );

      const functions = eventsBasedObject.getEventsFunctions();
      expect(functions.hasEventsFunctionNamed('Size')).toBe(true);
      expect(functions.hasEventsFunctionNamed('SetSize')).toBe(true);
    });

    it('explains why it could not generate them', () => {
      expectSuccess(
        changeObjectProperties([
          { property_name: 'Size', generate_getter_and_setter: true },
        ])
      );
      const result = expectSuccess(
        changeObjectProperties([
          { property_name: 'Size', generate_getter_and_setter: true },
        ])
      );

      expect(result.messages.join(' ')).toContain('already exist');
    });
  });

  describe('allowed types per owner', () => {
    it('lists the types of each owner', () => {
      expect(getAllowedPropertyTypes('object')).toContain('LeaderboardId');
      expect(getAllowedPropertyTypes('object')).not.toContain('Layer');
      expect(getAllowedPropertyTypes('behavior')).toContain('Behavior');
      expect(getAllowedPropertyTypes('behavior-shared')).toContain('Layer');
      expect(getAllowedPropertyTypes('behavior-shared')).not.toContain(
        'Behavior'
      );
    });

    it('refuses a LeaderboardId property on a behavior', () => {
      const message = expectFailureMessage(
        changeBehaviorProperties([
          { property_name: 'Leaderboard', type: 'LeaderboardId' },
        ])
      );

      expect(message).toContain(
        'Type "LeaderboardId" is not allowed for a custom behavior property'
      );
      expect(message).toContain('"Number"');
      expect(
        eventsBasedBehavior.getPropertyDescriptors().has('Leaderboard')
      ).toBe(false);
    });

    it('refuses a Layer property on a custom object', () => {
      const message = expectFailureMessage(
        changeObjectProperties([{ property_name: 'RenderedOn', type: 'Layer' }])
      );

      expect(message).toContain(
        'Type "Layer" is not allowed for a custom object property'
      );
      expect(message).toContain('"LeaderboardId"');
    });

    it('refuses a Behavior shared property', () => {
      const message = expectFailureMessage(
        changeBehaviorSharedProperties([
          {
            property_name: 'Platformer',
            type: 'Behavior',
            extra_info: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        ])
      );

      expect(message).toContain(
        'Type "Behavior" is not allowed for a custom behavior shared property'
      );
      expect(
        eventsBasedBehavior.getSharedPropertyDescriptors().has('Platformer')
      ).toBe(false);
    });
  });

  describe('atomicity', () => {
    it('applies nothing when one change of the call is refused', () => {
      const message = expectFailureMessage(
        changeObjectProperties([
          { property_name: 'Fill', new_name: 'BackgroundColor' },
          { property_name: 'Size', type: 'MultilineString' },
          { property_name: 'Broken', type: 'NotAType' },
        ])
      );

      expect(message).toContain('Type "NotAType" is not allowed');
      const properties = eventsBasedObject.getPropertyDescriptors();
      expect(properties.has('Fill')).toBe(true);
      expect(properties.has('BackgroundColor')).toBe(false);
      expect(properties.get('Size').getType()).toBe('Number');
      expect(properties.has('Broken')).toBe(false);
    });

    it('changes nothing when there is nothing to change', () => {
      const result = expectSuccess(
        changeObjectProperties([{ property_name: 'Fill' }])
      );

      expect(result.changedCount).toBe(0);
      expect(result.messages).toEqual([]);
    });
  });
});
