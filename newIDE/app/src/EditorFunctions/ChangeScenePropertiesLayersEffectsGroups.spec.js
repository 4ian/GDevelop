// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';
import { makeTestExtensions } from '../fixtures/TestExtensions';

const gd: libGDevelop = global.gd;

describe('change_scene_properties_layers_effects_groups', () => {
  let project: gdProject;
  let testScene: gdLayout;

  beforeEach(() => {
    makeTestExtensions(gd);
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    testScene = project.insertNewLayout('TestScene', 0);
  });

  afterEach(() => {
    project.delete();
  });

  it('deletes a layer and moves its instances to another layer', async () => {
    testScene.getLayers().insertNewLayer('Background', 1);
    testScene.getLayers().insertNewLayer('UI', 2);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Button', 0);
    const instance = testScene.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName('Button');
    instance.setLayer('UI');

    const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...fakeOptions,
        args: {
          scene_name: 'TestScene',
          changed_layers: [
            {
              layer_name: 'UI',
              delete_this_layer: true,
              move_instances_to_layer: 'Background',
            },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      'Removed layer "UI" for scene "TestScene" (instances moved to layer "Background").'
    );
    expect(testScene.hasLayerNamed('UI')).toBe(false);
    expect(testScene.hasLayerNamed('Background')).toBe(true);
    // The instance was moved to the target layer instead of being deleted.
    expect(instance.getLayer()).toBe('Background');
    // The editor is notified that instances have been modified.
    expect(fakeOptions.onInstancesModifiedOutsideEditor).toHaveBeenCalledWith({
      scene: testScene,
    });
  });

  it('deletes a layer and moves its instances to the base layer (named "")', async () => {
    testScene.getLayers().insertNewLayer('UI', 1);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Button', 0);
    const instance = testScene.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName('Button');
    instance.setLayer('UI');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_layers: [
            {
              layer_name: 'UI',
              delete_this_layer: true,
              move_instances_to_layer: '',
            },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      'Removed layer "UI" for scene "TestScene" (instances moved to the base layer).'
    );
    expect(testScene.hasLayerNamed('UI')).toBe(false);
    // The instance was moved to the base layer instead of being deleted.
    expect(instance.getLayer()).toBe('');
  });

  it('deletes a layer along with its instances when move_instances_to_layer is not set', async () => {
    testScene.getLayers().insertNewLayer('UI', 1);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Button', 0);
    const instance = testScene.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName('Button');
    instance.setLayer('UI');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_layers: [{ layer_name: 'UI', delete_this_layer: true }],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      'Removed layer "UI" for scene "TestScene" (its instances were removed too).'
    );
    expect(testScene.hasLayerNamed('UI')).toBe(false);
    expect(testScene.getInitialInstances().getInstancesCount()).toBe(0);
  });

  // Layer deletion/merge must also handle the external layouts associated
  // with the scene — the exact area covered by the WholeProjectRefactorer.
  it('moves the instances of associated external layouts when deleting a layer', async () => {
    testScene.getLayers().insertNewLayer('UI', 1);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Button', 0);
    const externalLayout = project.insertNewExternalLayout(
      'MyExternalLayout',
      0
    );
    externalLayout.setAssociatedLayout('TestScene');
    const externalInstance = externalLayout
      .getInitialInstances()
      .insertNewInitialInstance();
    externalInstance.setObjectName('Button');
    externalInstance.setLayer('UI');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_layers: [
            {
              layer_name: 'UI',
              delete_this_layer: true,
              move_instances_to_layer: '',
            },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(testScene.hasLayerNamed('UI')).toBe(false);
    // The external layout instance was moved to the base layer, not orphaned.
    expect(externalInstance.getLayer()).toBe('');
  });

  it('removes the instances of associated external layouts when deleting a layer with its instances', async () => {
    testScene.getLayers().insertNewLayer('UI', 1);
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Button', 0);
    const externalLayout = project.insertNewExternalLayout(
      'MyExternalLayout',
      0
    );
    externalLayout.setAssociatedLayout('TestScene');
    const externalInstance = externalLayout
      .getInitialInstances()
      .insertNewInitialInstance();
    externalInstance.setObjectName('Button');
    externalInstance.setLayer('UI');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_layers: [{ layer_name: 'UI', delete_this_layer: true }],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(testScene.hasLayerNamed('UI')).toBe(false);
    // The external layout instances on the deleted layer are removed too.
    expect(externalLayout.getInitialInstances().getInstancesCount()).toBe(0);
  });

  // The position block used to look up the deleted layer and report a move
  // that never happened.
  it('ignores new_layer_position when the layer is deleted in the same item', async () => {
    testScene.getLayers().insertNewLayer('UI', 1);

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_layers: [
            {
              layer_name: 'UI',
              delete_this_layer: true,
              new_layer_position: 0,
            },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain('Removed layer "UI"');
    expect(result.warnings).toContain(
      '"new_layer_position" was ignored: layer "UI" was deleted.'
    );
    // No false "Moved layer" report for a layer that no longer exists.
    expect(result.message).not.toContain('Moved layer');
    expect(testScene.hasLayerNamed('UI')).toBe(false);
  });

  // `moveLayer` silently no-ops on an out-of-range position: the tool must
  // clamp (documented as "set on top") and report the real position.
  it('clamps an out-of-range new_layer_position to the top', async () => {
    testScene.getLayers().insertNewLayer('Background', 1);
    testScene.getLayers().insertNewLayer('UI', 2);
    expect(testScene.getLayers().getLayerPosition('Background')).toBe(1);

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_layers: [
            { layer_name: 'Background', new_layer_position: 99 },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      'Moved layer "Background" to position 2 for scene "TestScene".'
    );
    // The layer was really moved on top (last position).
    expect(testScene.getLayers().getLayerPosition('Background')).toBe(2);
  });

  it('refuses to delete a layer when the target layer for instances does not exist', async () => {
    testScene.getLayers().insertNewLayer('UI', 1);

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_layers: [
            {
              layer_name: 'UI',
              delete_this_layer: true,
              move_instances_to_layer: 'DoesNotExist',
            },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('No changes. See warnings.');
    expect(result.warnings).toBe(
      'Layer "DoesNotExist" does not exist in scene "TestScene": layer "UI" was NOT deleted (its instances would have nowhere to go). The base layer is named "".'
    );
    expect(testScene.hasLayerNamed('UI')).toBe(true);
  });

  it('renames a layer effect', async () => {
    const effects = testScene
      .getLayers()
      .getLayer('')
      .getEffects();
    effects.insertNewEffect('MySepia', 0).setEffectType('FakeSepia');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_layer_effects: [
            {
              layer_name: '',
              effect_name: 'MySepia',
              new_effect_name: 'OldTimes',
            },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      'Renamed the "MySepia" effect on layer "" to "OldTimes".'
    );
    expect(effects.hasEffectNamed('MySepia')).toBe(false);
    expect(effects.hasEffectNamed('OldTimes')).toBe(true);
    // The effect type is kept when renaming.
    expect(effects.getEffect('OldTimes').getEffectType()).toBe('FakeSepia');
  });

  // The effects container does not enforce name uniqueness: renaming onto a
  // taken name used to leave two effects with the same name.
  it('refuses to rename a layer effect to an existing effect name', async () => {
    const effects = testScene
      .getLayers()
      .getLayer('')
      .getEffects();
    effects.insertNewEffect('MySepia', 0).setEffectType('FakeSepia');
    effects.insertNewEffect('MyNight', 1).setEffectType('FakeNight');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_layer_effects: [
            {
              layer_name: '',
              effect_name: 'MySepia',
              new_effect_name: 'MyNight',
            },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.warnings).toContain(
      'An effect named "MyNight" already exists on layer "": "MySepia" was NOT renamed.'
    );
    // Both effects still exist under their original names.
    expect(effects.hasEffectNamed('MySepia')).toBe(true);
    expect(effects.hasEffectNamed('MyNight')).toBe(true);
  });

  // Deleting/renaming an effect that does not exist used to be a silent
  // no-op, producing a bare "No changes." with no diagnosis.
  it('warns when deleting or renaming an effect that does not exist', async () => {
    const effects = testScene
      .getLayers()
      .getLayer('')
      .getEffects();
    effects.insertNewEffect('MySepia', 0).setEffectType('FakeSepia');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_layer_effects: [
            {
              layer_name: '',
              effect_name: 'Sepai', // Typo on purpose.
              delete_this_effect: true,
            },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.warnings).toContain(
      'Effect "Sepai" not found on layer "". Existing effects are: "MySepia". Nothing was changed for this effect.'
    );
    expect(effects.hasEffectNamed('MySepia')).toBe(true);
  });

  // Groups share the object namespace and nothing enforces uniqueness on
  // rename: renaming onto a taken name used to leave two groups with the
  // same name.
  it('refuses to rename a group to an existing group or object name', async () => {
    testScene.getObjects().insertNewObject(project, 'Sprite', 'Ghost', 0);
    const groups = testScene.getObjects().getObjectGroups();
    groups.insertNew('Enemies', 0);
    groups.insertNew('Allies', 1);

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_groups: [
            { group_name: 'Enemies', new_group_name: 'Allies' },
            { group_name: 'Allies', new_group_name: 'Ghost' },
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.warnings).toContain(
      'An object or group named "Allies" already exists in scene "TestScene": group "Enemies" was NOT renamed.'
    );
    expect(result.warnings).toContain(
      'An object or group named "Ghost" already exists in scene "TestScene": group "Allies" was NOT renamed.'
    );
    expect(groups.has('Enemies')).toBe(true);
    expect(groups.has('Allies')).toBe(true);
  });

  it('moves a layer effect to a new position', async () => {
    const effects = testScene
      .getLayers()
      .getLayer('')
      .getEffects();
    effects.insertNewEffect('MySepia', 0).setEffectType('FakeSepia');
    effects.insertNewEffect('MyNight', 1).setEffectType('FakeNight');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_layer_effects: [
            {
              layer_name: '',
              effect_name: 'MySepia',
              new_effect_position: 1,
            },
          ],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      'Moved the "MySepia" effect on layer "" to position 1.'
    );
    expect(effects.getEffectAt(0).getName()).toBe('MyNight');
    expect(effects.getEffectAt(1).getName()).toBe('MySepia');
  });

  it('warns and skips an unknown scene property', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_properties: [{ property_name: 'gravity', new_value: '9.8' }],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('No changes. See warnings.');
    expect(result.warnings).toBe('Unknown scene property: "gravity". Skipped.');
  });

  it('deletes an existing group', async () => {
    const groups = testScene.getObjects().getObjectGroups();
    const group = groups.insertNew('Enemies', 0);
    group.addObject('Enemy1');

    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: {
          scene_name: 'TestScene',
          changed_groups: [{ group_name: 'Enemies', delete_this_group: true }],
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      'Deleted group "Enemies" from scene "TestScene".'
    );
    expect(groups.has('Enemies')).toBe(false);
  });

  it('reports no changes when only the scene name is provided', async () => {
    const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        args: { scene_name: 'TestScene' },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('No changes.');
    expect(result.warnings).toBeUndefined();
  });
});
