// @flow
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';
import {
  BOTH_GIVEN_DISAGREE_MESSAGE,
  NAMED_VARIANT_REJECTED_MESSAGE,
  makeStoreExtensionReadOnlyMessage,
} from './Scope';
import { EXTENSION_STORE_ORIGIN_NAME } from './SimplifiedProject/SimplifiedExtensions';
import { mapFor } from '../Utils/MapFor';

const gd: libGDevelop = global.gd;

const defaultVariantScope = {
  type: 'custom_object_variant',
  extension_name: 'UI',
  custom_object_name: 'Dialog',
  variant_name: '',
};
const darkVariantScope = {
  ...defaultVariantScope,
  variant_name: 'Dark',
};

/**
 * A project with a scene "Level" (object "Player"), an extension "UI" with a
 * custom object "Dialog" (children "Back" and "Label", plus a named variant
 * "Dark" with the same children) and a read-only store extension "Health"
 * with a custom object "Bar" (child "Fill").
 */
const createFakeProjectWithCustomObject = (project: gdProject) => {
  const scene = project.insertNewLayout('Level', 0);
  scene.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);

  const extension = project.insertNewEventsFunctionsExtension('UI', 0);
  const dialog = extension.getEventsBasedObjects().insertNew('Dialog', 0);
  dialog.getEventsFunctions().insertNewEventsFunction('Open', 0);
  const dialogObjects = dialog.getDefaultVariant().getObjects();
  dialogObjects.insertNewObject(project, 'Sprite', 'Back', 0);
  dialogObjects.insertNewObject(project, 'TextObject::Text', 'Label', 1);
  dialog.getVariants().insertNewVariant('Dark', 0);
  gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
    project,
    dialog
  );

  const storeExtension = project.insertNewEventsFunctionsExtension('Health', 1);
  storeExtension.setOrigin(EXTENSION_STORE_ORIGIN_NAME, 'Health');
  const bar = storeExtension.getEventsBasedObjects().insertNew('Bar', 0);
  bar
    .getDefaultVariant()
    .getObjects()
    .insertNewObject(project, 'Sprite', 'Fill', 0);

  return { scene, extension, dialog };
};

const getObjectNames = (objectsContainer: gdObjectsContainer): Array<string> =>
  mapFor(0, objectsContainer.getObjectsCount(), i =>
    objectsContainer.getObjectAt(i).getName()
  );

describe('Objects and behaviors in a custom object variant', () => {
  let project: gdProject;
  let dialog: gdEventsBasedObject;

  beforeEach(() => {
    makeTestExtensions(gd);
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    dialog = createFakeProjectWithCustomObject(project).dialog;
  });

  afterEach(() => {
    project.delete();
  });

  const getDefaultVariantObjects = () =>
    dialog.getDefaultVariant().getObjects();
  const getDarkVariantObjects = () =>
    dialog
      .getVariants()
      .getVariant('Dark')
      .getObjects();

  describe('structural edits on a named variant', () => {
    it('refuses to create an object, add a behavior or delete an object, and accepts them on the default variant', async () => {
      const options = makeFakeLaunchFunctionOptionsWithProject(project);

      const createOnNamedVariant: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...options,
          args: {
            scope: darkVariantScope,
            object_name: 'Icon',
            object_type: 'Sprite',
          },
        }
      );
      expect(createOnNamedVariant.success).toBe(false);
      expect(createOnNamedVariant.message).toBe(NAMED_VARIANT_REJECTED_MESSAGE);

      const addBehaviorOnNamedVariant: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...options,
          args: {
            scope: darkVariantScope,
            object_name: 'Back',
            behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        }
      );
      expect(addBehaviorOnNamedVariant.success).toBe(false);
      expect(addBehaviorOnNamedVariant.message).toBe(
        NAMED_VARIANT_REJECTED_MESSAGE
      );

      const deleteOnNamedVariant: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...options,
          args: {
            scope: darkVariantScope,
            object_name: 'Label',
            delete_this_object: true,
          },
        }
      );
      expect(deleteOnNamedVariant.success).toBe(false);
      expect(deleteOnNamedVariant.message).toBe(NAMED_VARIANT_REJECTED_MESSAGE);

      // Nothing was changed on any variant.
      expect(getObjectNames(getDefaultVariantObjects())).toEqual([
        'Back',
        'Label',
      ]);
      expect(getObjectNames(getDarkVariantObjects())).toEqual([
        'Back',
        'Label',
      ]);

      // The same calls on the default variant are applied...
      const createOnDefaultVariant: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...options,
          args: {
            scope: defaultVariantScope,
            object_name: 'Icon',
            object_type: 'Sprite',
          },
        }
      );
      expect(createOnDefaultVariant.success).toBe(true);
      expect(createOnDefaultVariant.message).toContain(
        'Created object "Icon" (type "Sprite", custom object "UI::Dialog" (default variant)) from scratch.'
      );

      const addBehaviorOnDefaultVariant: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...options,
          args: {
            scope: defaultVariantScope,
            object_name: 'Back',
            behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        }
      );
      expect(addBehaviorOnDefaultVariant.success).toBe(true);

      const deleteOnDefaultVariant: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...options,
          args: {
            scope: defaultVariantScope,
            object_name: 'Label',
            delete_this_object: true,
          },
        }
      );
      expect(deleteOnDefaultVariant.success).toBe(true);
      expect(deleteOnDefaultVariant.message).toBe('Deleted object "Label".');

      // ...and the named variant inherits them.
      expect(getObjectNames(getDefaultVariantObjects())).toEqual([
        'Back',
        'Icon',
      ]);
      expect(getObjectNames(getDarkVariantObjects())).toEqual(
        getObjectNames(getDefaultVariantObjects())
      );
      expect(
        getDarkVariantObjects()
          .getObject('Back')
          .hasBehaviorNamed('PlatformerObject')
      ).toBe(true);
    });

    it('allows changing a property of a child on a named variant', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: darkVariantScope,
            object_name: 'Label',
            changed_properties: [
              { property_name: 'text', new_value: 'Dark mode' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(
        getDarkVariantObjects()
          .getObject('Label')
          .getConfiguration()
          .getProperties()
          .get('text')
          .getValue()
      ).toBe('Dark mode');
      // The default variant keeps its own value (properties are per variant).
      expect(
        getDefaultVariantObjects()
          .getObject('Label')
          .getConfiguration()
          .getProperties()
          .get('text')
          .getValue()
      ).toBe('Text');
    });
  });

  describe('create_or_replace_object', () => {
    it('duplicates a scene object into a custom object as a child', async () => {
      const options = makeFakeLaunchFunctionOptionsWithProject(project);
      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...options,
          args: {
            scope: defaultVariantScope,
            object_name: 'PlayerAvatar',
            duplicated_object_name: 'Player',
            duplicated_object_scope: { type: 'scene', scene_name: 'Level' },
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Duplicated "Player" (scene "Level") as "PlayerAvatar" (custom object "UI::Dialog" (default variant)); same type/behaviors/properties/effects.'
      );
      expect(getObjectNames(getDefaultVariantObjects())).toEqual([
        'Back',
        'Label',
        'PlayerAvatar',
      ]);
      expect(getObjectNames(getDarkVariantObjects())).toEqual([
        'Back',
        'Label',
        'PlayerAvatar',
      ]);
      // The editor is told which custom object variant was changed.
      expect(options.onObjectsModifiedOutsideEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          scene: null,
          eventsBasedObject: expect.objectContaining({ ptr: dialog.ptr }),
          variantName: '',
        })
      );
    });

    it('accepts the legacy duplicated_object_scene to designate the source scene', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: defaultVariantScope,
            object_name: 'PlayerAvatar',
            duplicated_object_name: 'Player',
            duplicated_object_scene: 'Level',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(getDefaultVariantObjects().hasObjectNamed('PlayerAvatar')).toBe(
        true
      );
    });

    it('refuses a child object named "Object" (it designates the custom object itself)', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: defaultVariantScope,
            object_name: 'Object',
            object_type: 'Sprite',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        '"Object" is a reserved child name: in the events of custom object "UI::Dialog" (default variant) it designates the custom object itself. Use another `object_name`.'
      );
      expect(getDefaultVariantObjects().hasObjectNamed('Object')).toBe(false);
    });

    it('refuses a child whose type is the custom object itself, or depends on it', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: defaultVariantScope,
            object_name: 'InnerDialog',
            object_type: 'UI::Dialog',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Cannot use type "UI::Dialog" for a child of custom object "UI::Dialog" (default variant): "UI::Dialog" is (or contains) this custom object, which would be circular.'
      );
      expect(getDefaultVariantObjects().hasObjectNamed('InnerDialog')).toBe(
        false
      );

      // A type that (indirectly) contains the custom object is refused too.
      const extension = project.getEventsFunctionsExtension('UI');
      const wrapper = extension.getEventsBasedObjects().insertNew('Wrapper', 1);
      wrapper
        .getDefaultVariant()
        .getObjects()
        .insertNewObject(project, 'UI::Dialog', 'InnerDialog', 0);

      const indirectResult: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: defaultVariantScope,
            object_name: 'InnerWrapper',
            object_type: 'UI::Wrapper',
          },
        }
      );
      expect(indirectResult.success).toBe(false);
      expect(indirectResult.message).toBe(
        'Cannot use type "UI::Wrapper" for a child of custom object "UI::Dialog" (default variant): "UI::Wrapper" is (or contains) this custom object, which would be circular.'
      );
    });

    it('refuses target_object_scope outside a scene', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: defaultVariantScope,
            object_name: 'Icon',
            object_type: 'Sprite',
            target_object_scope: 'global',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        '`target_object_scope` only applies to scenes: a child of custom object "UI::Dialog" (default variant) is always local to it.'
      );
    });

    it('accepts the legacy scene_name with an agreeing scope, and refuses a disagreeing one', async () => {
      const options = makeFakeLaunchFunctionOptionsWithProject(project);

      const agreeing: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...options,
          args: {
            scene_name: 'Level',
            scope: { type: 'scene', scene_name: 'Level' },
            object_name: 'Enemy',
            object_type: 'Sprite',
          },
        }
      );
      expect(agreeing.success).toBe(true);
      expect(agreeing.message).toContain(
        'Created object "Enemy" (type "Sprite", scene "Level") from scratch.'
      );

      const disagreeing: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...options,
          args: {
            scene_name: 'Level',
            scope: { type: 'scene', scene_name: 'OtherLevel' },
            object_name: 'Enemy2',
            object_type: 'Sprite',
          },
        }
      );
      expect(disagreeing.success).toBe(false);
      expect(disagreeing.message).toBe(BOTH_GIVEN_DISAGREE_MESSAGE);
    });
  });

  describe('change_object_properties_effects', () => {
    it('renames a child on the default variant and renames it in the named variants', async () => {
      // An instance of the child on the named variant must follow the rename.
      const darkInstance = project
        .getEventsFunctionsExtension('UI')
        .getEventsBasedObjects()
        .get('Dialog')
        .getVariants()
        .getVariant('Dark')
        .getInitialInstances()
        .insertNewInitialInstance();
      darkInstance.setObjectName('Back');
      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: defaultVariantScope,
            object_name: 'Back',
            changed_properties: [
              { property_name: 'name', new_value: 'Background' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Renamed object "Back" to "Background" (events and references updated).'
      );
      expect(getObjectNames(getDefaultVariantObjects())).toEqual([
        'Background',
        'Label',
      ]);
      expect(getObjectNames(getDarkVariantObjects())).toEqual([
        'Background',
        'Label',
      ]);
      expect(darkInstance.getObjectName()).toBe('Background');
    });

    it('refuses to rename a child to the reserved name "Object"', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: defaultVariantScope,
            object_name: 'Back',
            changed_properties: [
              { property_name: 'name', new_value: 'Object' },
            ],
          },
        }
      );
      expect(result.message).toContain('"Object" is a reserved child name');
      expect(getObjectNames(getDefaultVariantObjects())).toEqual([
        'Back',
        'Label',
      ]);
    });

    it('refuses to rename a child on a named variant', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: darkVariantScope,
            object_name: 'Back',
            changed_properties: [
              { property_name: 'name', new_value: 'Background' },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(NAMED_VARIANT_REJECTED_MESSAGE);
      expect(getObjectNames(getDarkVariantObjects())).toEqual([
        'Back',
        'Label',
      ]);
    });

    it('fails on an unknown child with a message naming the custom object', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: defaultVariantScope,
            object_name: 'Missing',
            changed_properties: [{ property_name: 'text', new_value: 'Hi' }],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Object not found: "Missing" in custom object "UI::Dialog" (default variant).'
      );
    });
  });

  describe('inspect_object_properties_effects', () => {
    it('reads a child of a variant and keys the deduplication on the scope label', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scope: darkVariantScope, object_name: 'Label' },
        }
      );

      expect(result.success).toBe(true);
      expect(result.objectName).toBe('Label');
      expect(result.objectPropertiesDeduplicationKey).toBe(
        'custom object "UI::Dialog" (variant "Dark")-Label'
      );
    });

    it('fails on an unknown child with a message naming the custom object', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_object_properties_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scope: defaultVariantScope, object_name: 'Missing' },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Object not found: "Missing" in custom object "UI::Dialog" (default variant).'
      );
    });
  });

  describe('behaviors of a child object', () => {
    it('does not return sharedProperties for a child of a custom object', async () => {
      const options = makeFakeLaunchFunctionOptionsWithProject(project);
      const addResult: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...options,
          args: {
            scope: defaultVariantScope,
            object_name: 'Back',
            behavior_type: 'PhysicsBehavior::PhysicsBehavior',
            behavior_name: 'Physics',
          },
        }
      );
      expect(addResult.success).toBe(true);
      expect(addResult.addedBehaviors).toEqual([
        {
          objectName: 'Back',
          behaviorName: 'Physics',
          behaviorType: 'PhysicsBehavior::PhysicsBehavior',
        },
      ]);

      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_behavior_properties.launchFunction(
        {
          ...options,
          args: {
            scope: defaultVariantScope,
            object_name: 'Back',
            behavior_name: 'Physics',
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.properties).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'Friction' })])
      );
      // Behavior shared data only exists in a scene.
      expect(result.sharedProperties).toBeUndefined();
    });

    it('changes a behavior property of a child on a named variant', async () => {
      const options = makeFakeLaunchFunctionOptionsWithProject(project);
      await editorFunctions.add_behavior.launchFunction({
        ...options,
        args: {
          scope: defaultVariantScope,
          object_name: 'Back',
          behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          behavior_name: 'PlatformerObject',
        },
      });

      const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
        {
          ...options,
          args: {
            scope: darkVariantScope,
            object_name: 'Back',
            behavior_name: 'PlatformerObject',
            changed_properties: [
              { property_name: 'Gravity', new_value: '2000' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(
        getDarkVariantObjects()
          .getObject('Back')
          .getBehavior('PlatformerObject')
          .getProperties()
          .get('Gravity')
          .getValue()
      ).toBe('2000');
    });

    it('refuses to delete a behavior of a child on a named variant', async () => {
      const options = makeFakeLaunchFunctionOptionsWithProject(project);
      await editorFunctions.add_behavior.launchFunction({
        ...options,
        args: {
          scope: defaultVariantScope,
          object_name: 'Back',
          behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          behavior_name: 'PlatformerObject',
        },
      });

      const result: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
        {
          ...options,
          args: {
            scope: darkVariantScope,
            object_name: 'Back',
            behavior_name: 'PlatformerObject',
            delete_this_behavior: true,
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(NAMED_VARIANT_REJECTED_MESSAGE);
      expect(
        getDarkVariantObjects()
          .getObject('Back')
          .hasBehaviorNamed('PlatformerObject')
      ).toBe(true);

      // On the default variant, the removal is propagated to the named ones.
      const removalOnDefaultVariant: EditorFunctionGenericOutput = await editorFunctions.change_behavior_property.launchFunction(
        {
          ...options,
          args: {
            scope: defaultVariantScope,
            object_name: 'Back',
            behavior_name: 'PlatformerObject',
            delete_this_behavior: true,
          },
        }
      );
      expect(removalOnDefaultVariant.success).toBe(true);
      expect(
        getDarkVariantObjects()
          .getObject('Back')
          .hasBehaviorNamed('PlatformerObject')
      ).toBe(false);
    });

    it('fails on an unknown child with a message naming the custom object', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: defaultVariantScope,
            object_name: 'Missing',
            behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Object or group not found: "Missing" in custom object "UI::Dialog" (default variant).'
      );
    });
  });

  describe('read-only store extensions', () => {
    const storeVariantScope = {
      type: 'custom_object_variant',
      extension_name: 'Health',
      custom_object_name: 'Bar',
      variant_name: '',
    };

    it('refuses every mutation but allows reading', async () => {
      const options = makeFakeLaunchFunctionOptionsWithProject(project);
      const expectedMessage = makeStoreExtensionReadOnlyMessage('Health');

      const createResult: EditorFunctionGenericOutput = await editorFunctions.create_or_replace_object.launchFunction(
        {
          ...options,
          args: {
            scope: storeVariantScope,
            object_name: 'Icon',
            object_type: 'Sprite',
          },
        }
      );
      expect(createResult.success).toBe(false);
      expect(createResult.message).toBe(expectedMessage);

      const addBehaviorResult: EditorFunctionGenericOutput = await editorFunctions.add_behavior.launchFunction(
        {
          ...options,
          args: {
            scope: storeVariantScope,
            object_name: 'Fill',
            behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
          },
        }
      );
      expect(addBehaviorResult.success).toBe(false);
      expect(addBehaviorResult.message).toBe(expectedMessage);

      const changeResult: EditorFunctionGenericOutput = await editorFunctions.change_object_properties_effects.launchFunction(
        {
          ...options,
          args: {
            scope: storeVariantScope,
            object_name: 'Fill',
            delete_this_object: true,
          },
        }
      );
      expect(changeResult.success).toBe(false);
      expect(changeResult.message).toBe(expectedMessage);

      // Reading how the extension is made is always allowed.
      const inspectResult: EditorFunctionGenericOutput = await editorFunctions.inspect_object_properties_effects.launchFunction(
        {
          ...options,
          args: { scope: storeVariantScope, object_name: 'Fill' },
        }
      );
      expect(inspectResult.success).toBe(true);
      expect(inspectResult.objectName).toBe('Fill');

      const bar = project
        .getEventsFunctionsExtension('Health')
        .getEventsBasedObjects()
        .get('Bar');
      expect(getObjectNames(bar.getDefaultVariant().getObjects())).toEqual([
        'Fill',
      ]);
    });
  });
});
