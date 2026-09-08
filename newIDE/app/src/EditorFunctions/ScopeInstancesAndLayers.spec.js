// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';
import { makeTestExtensions } from '../fixtures/TestExtensions';
import {
  NAMED_VARIANT_REJECTED_MESSAGE,
  makeStoreExtensionReadOnlyMessage,
} from './Scope';
import { EXTENSION_STORE_ORIGIN_NAME } from './SimplifiedProject/SimplifiedExtensions';

const gd: libGDevelop = global.gd;

const DIALOG_DEFAULT_VARIANT_SCOPE = {
  type: 'custom_object_variant',
  extension_name: 'UI',
  custom_object_name: 'Dialog',
  variant_name: '',
};
const DIALOG_DARK_VARIANT_SCOPE = {
  ...DIALOG_DEFAULT_VARIANT_SCOPE,
  variant_name: 'Dark',
};
const STORE_VARIANT_SCOPE = {
  type: 'custom_object_variant',
  extension_name: 'Health',
  custom_object_name: 'Bar',
  variant_name: '',
};

/**
 * A project with a scene, two external layouts (one associated to the scene,
 * one orphan), an authored extension holding a custom object with two
 * variants, and an extension installed from the store.
 */
const createFakeProjectWithCustomObject = (project: gdProject) => {
  const scene = project.insertNewLayout('Level', 0);
  scene.getLayers().insertNewLayer('Background', 1);
  scene.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
  project.getObjects().insertNewObject(project, 'Sprite', 'GlobalHud', 0);

  project.insertNewExternalLayout('Orphan', 0);
  project.insertNewExternalLayout('LevelChunk', 1).setAssociatedLayout('Level');

  const extension = project.insertNewEventsFunctionsExtension('UI', 0);
  const eventsBasedObject = extension
    .getEventsBasedObjects()
    .insertNew('Dialog', 0);
  // Every layers container already has the base layer (named "").
  const defaultVariant = eventsBasedObject.getDefaultVariant();
  defaultVariant.getObjects().insertNewObject(project, 'Sprite', 'Back', 0);
  defaultVariant
    .getObjects()
    .insertNewObject(project, 'TextObject::Text', 'Label', 1);
  const darkVariant = eventsBasedObject
    .getVariants()
    .insertNewVariant('Dark', 0);
  gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
    project,
    eventsBasedObject
  );

  const storeExtension = project.insertNewEventsFunctionsExtension('Health', 1);
  storeExtension.setOrigin(EXTENSION_STORE_ORIGIN_NAME, 'Health');
  const storeObject = storeExtension
    .getEventsBasedObjects()
    .insertNew('Bar', 0);
  storeObject
    .getDefaultVariant()
    .getObjects()
    .insertNewObject(project, 'Sprite', 'Fill', 0);

  return { scene, eventsBasedObject, defaultVariant, darkVariant };
};

const getVariant = (
  project: gdProject,
  variantName: string
): gdEventsBasedObjectVariant => {
  const eventsBasedObject = project
    .getEventsFunctionsExtension('UI')
    .getEventsBasedObjects()
    .get('Dialog');
  return variantName === ''
    ? eventsBasedObject.getDefaultVariant()
    : eventsBasedObject.getVariants().getVariant(variantName);
};

describe('scoped instances, layers and groups', () => {
  let project: gdProject;

  beforeEach(() => {
    makeTestExtensions(gd);
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    createFakeProjectWithCustomObject(project);
  });

  afterEach(() => {
    project.delete();
  });

  describe('external layouts', () => {
    it('adds instances to the external layout, validated against the layers of the associated scene', async () => {
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
      const result: EditorFunctionGenericOutput = await editorFunctions.put_2d_instances.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: {
              type: 'external_layout',
              external_layout_name: 'LevelChunk',
            },
            object_name: 'Player',
            layer_name: 'Background',
            brush_kind: 'point',
            brush_position: '10,20',
            new_instances_count: 2,
          },
        }
      );

      expect(result.success).toBe(true);
      const externalLayout = project.getExternalLayout('LevelChunk');
      expect(externalLayout.getInitialInstances().getInstancesCount()).toBe(2);
      // The instances went to the external layout, not to the scene itself.
      expect(
        project
          .getLayout('Level')
          .getInitialInstances()
          .getInstancesCount()
      ).toBe(0);
      // The editor is told which external layout (and which scene) changed.
      expect(fakeOptions.onInstancesModifiedOutsideEditor).toHaveBeenCalledWith(
        {
          scene: project.getLayout('Level'),
          externalLayout,
        }
      );
    });

    it('fails when the layer is not one of the associated scene', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.put_2d_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: {
              type: 'external_layout',
              external_layout_name: 'LevelChunk',
            },
            object_name: 'Player',
            layer_name: 'NotALayer',
            brush_kind: 'point',
            brush_position: '10,20',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Layer not found: NotALayer in external layout "LevelChunk".'
      );
      expect(
        project
          .getExternalLayout('LevelChunk')
          .getInitialInstances()
          .getInstancesCount()
      ).toBe(0);
    });

    it('fails when the external layout has no associated scene', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.put_2d_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: { type: 'external_layout', external_layout_name: 'Orphan' },
            object_name: 'Player',
            layer_name: '',
            brush_kind: 'point',
            brush_position: '10,20',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'External layout "Orphan" has no associated scene: set it in the editor first'
      );
    });

    it('describes the instances of an external layout', async () => {
      const instance = project
        .getExternalLayout('LevelChunk')
        .getInitialInstances()
        .insertNewInitialInstance();
      instance.setObjectName('GlobalHud');
      instance.setLayer('Background');
      instance.setX(5);

      const result: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: {
              type: 'external_layout',
              external_layout_name: 'LevelChunk',
            },
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.instancesForExternalLayoutNamed).toBe('LevelChunk');
      // The objects (and so the instances) are those of the associated scene.
      expect(result.instancesForSceneNamed).toBe('Level');
      const instances = result.instances || [];
      expect(instances).toHaveLength(1);
      expect(instances[0].name).toBe('GlobalHud');
    });
  });

  describe('custom object variants: instances', () => {
    it('puts and describes instances on the default variant', async () => {
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
      const putResult: EditorFunctionGenericOutput = await editorFunctions.put_2d_instances.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: DIALOG_DEFAULT_VARIANT_SCOPE,
            object_name: 'Back',
            layer_name: '',
            brush_kind: 'point',
            brush_position: '0,0',
          },
        }
      );

      expect(putResult.success).toBe(true);
      expect(
        getVariant(project, '')
          .getInitialInstances()
          .getInstancesCount()
      ).toBe(1);
      // The named variant has its own instances.
      expect(
        getVariant(project, 'Dark')
          .getInitialInstances()
          .getInstancesCount()
      ).toBe(0);
      expect(fakeOptions.onInstancesModifiedOutsideEditor).toHaveBeenCalledWith(
        {
          scene: null,
          eventsBasedObject: project
            .getEventsFunctionsExtension('UI')
            .getEventsBasedObjects()
            .get('Dialog'),
          variantName: '',
        }
      );

      const describeResult: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scope: DIALOG_DEFAULT_VARIANT_SCOPE },
        }
      );

      expect(describeResult.success).toBe(true);
      expect(describeResult.instancesForSceneNamed).toBeUndefined();
      expect(describeResult.instancesForScopeLabel).toBe(
        'custom object "UI::Dialog" (default variant)'
      );
      expect(describeResult.positionSemantics).toContain(
        '(0;0) is the position of the custom object'
      );
      expect((describeResult.instances || []).map(({ name }) => name)).toEqual([
        'Back',
      ]);
    });

    it('puts and describes instances on a named variant', async () => {
      const putResult: EditorFunctionGenericOutput = await editorFunctions.put_3d_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: DIALOG_DARK_VARIANT_SCOPE,
            object_name: 'Label',
            layer_name: '',
            brush_kind: 'point',
            brush_position: '1,2,3',
          },
        }
      );

      expect(putResult.success).toBe(true);
      expect(
        getVariant(project, 'Dark')
          .getInitialInstances()
          .getInstancesCount()
      ).toBe(1);
      expect(
        getVariant(project, '')
          .getInitialInstances()
          .getInstancesCount()
      ).toBe(0);

      const describeResult: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scope: DIALOG_DARK_VARIANT_SCOPE },
        }
      );

      expect(describeResult.instancesForScopeLabel).toBe(
        'custom object "UI::Dialog" (variant "Dark")'
      );
      expect(describeResult.positionSemantics).toContain(
        'the z of a child is relative to the z of the parent'
      );
      const instances = describeResult.instances || [];
      expect(instances).toHaveLength(1);
      expect(instances[0].name).toBe('Label');
    });

    it('refuses an object that is not a child of the custom object', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.put_2d_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: DIALOG_DEFAULT_VARIANT_SCOPE,
            object_name: 'Player',
            layer_name: '',
            brush_kind: 'point',
            brush_position: '0,0',
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Object "Player" not in custom object "UI::Dialog" (default variant). Use only existing objects (create them first if needed).'
      );
    });

    it('refuses to put instances in an extension from the store, but still describes them', async () => {
      const putResult: EditorFunctionGenericOutput = await editorFunctions.put_2d_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: STORE_VARIANT_SCOPE,
            object_name: 'Fill',
            layer_name: '',
            brush_kind: 'point',
            brush_position: '0,0',
          },
        }
      );

      expect(putResult.success).toBe(false);
      expect(putResult.message).toBe(
        makeStoreExtensionReadOnlyMessage('Health')
      );

      const describeResult: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scope: STORE_VARIANT_SCOPE },
        }
      );
      expect(describeResult.success).toBe(true);
    });
  });

  describe('custom object variants: properties, layers, effects and groups', () => {
    it('inspects the area, layers and groups of a variant', async () => {
      const variant = getVariant(project, '');
      variant.setAreaMinX(-10);
      variant.setAreaMaxZ(32);
      variant
        .getLayers()
        .getLayer('')
        .getEffects()
        .insertNewEffect('MySepia', 0)
        .setEffectType('FakeSepia');
      const group = variant
        .getObjects()
        .getObjectGroups()
        .insertNew('Everything', 0);
      group.addObject('Back');
      group.addObject('Label');

      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scope: DIALOG_DEFAULT_VARIANT_SCOPE },
        }
      );

      expect(result.success).toBe(true);
      // A variant has no scene properties (no background color, no resolution).
      expect(result.properties).toBeUndefined();
      expect(result.propertiesLayersEffectsForSceneNamed).toBeUndefined();
      expect(result.propertiesLayersEffectsForScopeLabel).toBe(
        'custom object "UI::Dialog" (default variant)'
      );
      expect(result.isDefaultVariant).toBe(true);
      expect(result.area).toEqual({
        minX: -10,
        minY: 0,
        minZ: 0,
        maxX: 64,
        maxY: 64,
        maxZ: 32,
      });
      const layers = result.layers || [];
      expect(layers).toHaveLength(1);
      expect(layers[0].name).toBe('');
      expect(layers[0].position).toBe(0);
      expect(layers[0].visible).toBe(true);
      expect(layers[0].effects).toHaveLength(1);
      expect(layers[0].effects[0].effectName).toBe('MySepia');
      expect(layers[0].effects[0].effectType).toBe('FakeSepia');
      expect(result.objectGroups).toEqual([
        { objectGroupName: 'Everything', objectNames: ['Back', 'Label'] },
      ]);
    });

    it('tells a named variant apart from the default one', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scope: DIALOG_DARK_VARIANT_SCOPE },
        }
      );

      expect(result.success).toBe(true);
      expect(result.isDefaultVariant).toBe(false);
      expect(result.propertiesLayersEffectsForScopeLabel).toBe(
        'custom object "UI::Dialog" (variant "Dark")'
      );
    });

    it('changes the area of a variant and warns about the scene-only properties', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: DIALOG_DARK_VARIANT_SCOPE,
            changed_properties: [
              { property_name: 'areaMaxX', new_value: '128' },
              { property_name: 'areaMinY', new_value: '-4' },
              { property_name: 'backgroundColor', new_value: '#ffffff' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Set areaMaxX to 128 for custom object "UI::Dialog" (variant "Dark").'
      );
      expect(result.warnings).toContain(
        'Unknown custom object variant property: "backgroundColor". Skipped.'
      );
      const darkVariant = getVariant(project, 'Dark');
      expect(darkVariant.getAreaMaxX()).toBe(128);
      expect(darkVariant.getAreaMinY()).toBe(-4);
      // The default variant is untouched: an area is variant-specific.
      expect(getVariant(project, '').getAreaMaxX()).toBe(64);
    });

    it('adds a layer, renames it and adds an effect on it, on a variant', async () => {
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
      const addResult: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: DIALOG_DEFAULT_VARIANT_SCOPE,
            changed_layers: [{ layer_name: 'Front' }],
          },
        }
      );

      expect(addResult.success).toBe(true);
      expect(addResult.message).toContain(
        'Layer "Front" did not exist in custom object "UI::Dialog" (default variant): created it at position 1'
      );

      const changeResult: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: DIALOG_DEFAULT_VARIANT_SCOPE,
            changed_layers: [
              { layer_name: 'Front', new_layer_name: 'Overlay' },
            ],
            changed_layer_effects: [
              {
                layer_name: '',
                effect_name: 'MySepia',
                effect_type: 'FakeSepia',
              },
            ],
          },
        }
      );

      expect(changeResult.success).toBe(true);
      expect(changeResult.message).toContain(
        'Renamed layer "Front" to "Overlay" for custom object "UI::Dialog" (default variant) (events and instances updated).'
      );
      // The editor is told which variant of which custom object changed.
      expect(fakeOptions.onInstancesModifiedOutsideEditor).toHaveBeenCalledWith(
        {
          scene: null,
          eventsBasedObject: project
            .getEventsFunctionsExtension('UI')
            .getEventsBasedObjects()
            .get('Dialog'),
          variantName: '',
        }
      );
      const layers = getVariant(project, '').getLayers();
      expect(layers.hasLayerNamed('Overlay')).toBe(true);
      expect(layers.hasLayerNamed('Front')).toBe(false);
      expect(
        layers
          .getLayer('')
          .getEffects()
          .hasEffectNamed('MySepia')
      ).toBe(true);
      // Layers are variant-specific: the named variant keeps its own.
      expect(
        getVariant(project, 'Dark')
          .getLayers()
          .hasLayerNamed('Overlay')
      ).toBe(false);
    });

    it('renames, merges and deletes the layers of a named variant, moving its own instances', async () => {
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
      const darkScope = {
        type: 'custom_object_variant',
        extension_name: 'UI',
        custom_object_name: 'Dialog',
        variant_name: 'Dark',
      };
      const dark = getVariant(project, 'Dark');
      dark.getLayers().insertNewLayer('Glow', 1);
      dark.getLayers().insertNewLayer('Old', 2);
      const onGlow = dark.getInitialInstances().insertNewInitialInstance();
      onGlow.setObjectName('Back');
      onGlow.setLayer('Glow');
      const onOld = dark.getInitialInstances().insertNewInitialInstance();
      onOld.setObjectName('Back');
      onOld.setLayer('Old');
      // The default variant has its own instance, untouched by the edits below.
      const defaultInstance = getVariant(project, '')
        .getInitialInstances()
        .insertNewInitialInstance();
      defaultInstance.setObjectName('Back');

      const renameResult: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: darkScope,
            changed_layers: [{ layer_name: 'Glow', new_layer_name: 'Shine' }],
          },
        }
      );
      expect(renameResult.success).toBe(true);
      expect(dark.getLayers().hasLayerNamed('Shine')).toBe(true);
      expect(onGlow.getLayer()).toBe('Shine');

      const mergeResult: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: darkScope,
            changed_layers: [
              {
                layer_name: 'Old',
                delete_this_layer: true,
                move_instances_to_layer: 'Shine',
              },
            ],
          },
        }
      );
      expect(mergeResult.success).toBe(true);
      expect(dark.getLayers().hasLayerNamed('Old')).toBe(false);
      expect(onOld.getLayer()).toBe('Shine');

      const deleteResult: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: darkScope,
            changed_layers: [{ layer_name: 'Shine', delete_this_layer: true }],
          },
        }
      );
      expect(deleteResult.success).toBe(true);
      expect(dark.getLayers().hasLayerNamed('Shine')).toBe(false);
      expect(dark.getInitialInstances().getInstancesCount()).toBe(0);
      expect(
        getVariant(project, '')
          .getInitialInstances()
          .getInstancesCount()
      ).toBe(1);
    });

    it('refuses to delete a variant with delete_this_scene', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: DIALOG_DARK_VARIANT_SCOPE,
            delete_this_scene: true,
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'A variant cannot be deleted here: use change_custom_object.changed_variants.'
      );
      expect(
        project
          .getEventsFunctionsExtension('UI')
          .getEventsBasedObjects()
          .get('Dialog')
          .getVariants()
          .hasVariantNamed('Dark')
      ).toBe(true);
    });

    it('creates a group on the default variant and propagates it to the named variants', async () => {
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: DIALOG_DEFAULT_VARIANT_SCOPE,
            changed_groups: [
              { group_name: 'Decorations', objects_to_add: ['Back', 'Label'] },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Created group "Decorations" in custom object "UI::Dialog" (default variant).'
      );
      const defaultGroups = getVariant(project, '')
        .getObjects()
        .getObjectGroups();
      expect(defaultGroups.has('Decorations')).toBe(true);
      expect(
        defaultGroups
          .get('Decorations')
          .getAllObjectsNames()
          .toJSArray()
      ).toEqual(['Back', 'Label']);
      // `complyVariantsToEventsBasedObject` copies the groups of the default
      // variant to every named variant.
      const darkGroups = getVariant(project, 'Dark')
        .getObjects()
        .getObjectGroups();
      expect(darkGroups.has('Decorations')).toBe(true);
      expect(
        darkGroups
          .get('Decorations')
          .getAllObjectsNames()
          .toJSArray()
      ).toEqual(['Back', 'Label']);
      expect(
        fakeOptions.onObjectGroupsModifiedOutsideEditor
      ).toHaveBeenCalledWith({
        scene: null,
        eventsBasedObject: project
          .getEventsFunctionsExtension('UI')
          .getEventsBasedObjects()
          .get('Dialog'),
        variantName: '',
      });
    });

    it('renames a group of the default variant', async () => {
      getVariant(project, '')
        .getObjects()
        .getObjectGroups()
        .insertNew('Decorations', 0)
        .addObject('Back');

      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: DIALOG_DEFAULT_VARIANT_SCOPE,
            changed_groups: [
              { group_name: 'Decorations', new_group_name: 'Ornaments' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Renamed group "Decorations" to "Ornaments" in custom object "UI::Dialog" (default variant).'
      );
      const groups = getVariant(project, '')
        .getObjects()
        .getObjectGroups();
      expect(groups.has('Ornaments')).toBe(true);
      expect(groups.has('Decorations')).toBe(false);
    });

    it('refuses a group change on a named variant', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: DIALOG_DARK_VARIANT_SCOPE,
            changed_groups: [
              { group_name: 'Decorations', objects_to_add: ['Back'] },
            ],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(NAMED_VARIANT_REJECTED_MESSAGE);
      expect(
        getVariant(project, 'Dark')
          .getObjects()
          .getObjectGroups()
          .has('Decorations')
      ).toBe(false);
    });

    it('refuses to change a variant of an extension from the store, but still inspects it', async () => {
      const changeResult: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: STORE_VARIANT_SCOPE,
            changed_properties: [{ property_name: 'areaMaxX', new_value: '9' }],
          },
        }
      );

      expect(changeResult.success).toBe(false);
      expect(changeResult.message).toBe(
        makeStoreExtensionReadOnlyMessage('Health')
      );

      const inspectResult: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scope: STORE_VARIANT_SCOPE },
        }
      );
      expect(inspectResult.success).toBe(true);
      expect(inspectResult.propertiesLayersEffectsForScopeLabel).toBe(
        'custom object "Health::Bar" (default variant)'
      );
    });
  });

  describe('legacy and scene scopes', () => {
    it('accepts the legacy scene_name, and a scope agreeing with it', async () => {
      const instance = project
        .getLayout('Level')
        .getInitialInstances()
        .insertNewInitialInstance();
      instance.setObjectName('Player');

      const legacyResult: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scene_name: 'Level' },
        }
      );
      expect(legacyResult.success).toBe(true);
      expect(legacyResult.instancesForSceneNamed).toBe('Level');
      expect(legacyResult.instancesForScopeLabel).toBeUndefined();
      expect(legacyResult.instances).toHaveLength(1);

      const bothGivenResult: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'Level',
            scope: { type: 'scene', scene_name: 'Level' },
          },
        }
      );
      expect(bothGivenResult.success).toBe(true);
      expect(bothGivenResult.instances).toHaveLength(1);
    });

    it('fails with the scene not found message on an unknown scene', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.describe_instances.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scene_name: 'Nope' },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Scene not found: "Nope". Scenes in this project: "Level".'
      );
    });

    it('refuses a scope type that is not allowed by the function', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.inspect_scene_properties_layers_effects.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: {
              type: 'external_layout',
              external_layout_name: 'LevelChunk',
            },
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        '`scope.type` "external_layout" is not accepted here: use one of "scene", "custom_object_variant".'
      );
    });
  });
});
