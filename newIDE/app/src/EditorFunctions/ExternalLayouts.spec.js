// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { makeSimplifiedProjectBuilder } from './SimplifiedProject/SimplifiedProject';

const gd: libGDevelop = global.gd;

const GAME_SCOPE = { type: 'scene', scene_name: 'Game' };
const LEVEL1_SCOPE = {
  type: 'external_layout',
  external_layout_name: 'Level1',
};

/**
 * A game scene with two layers, a scene object and a global object, an
 * external layout "Level1" of this scene, and a second scene "Menu" without
 * the "Sky" layer nor the "Platform" object.
 */
const createFakeProject = (project: gdProject) => {
  const game = project.insertNewLayout('Game', 0);
  game.getLayers().insertNewLayer('Sky', 1);
  game.getObjects().insertNewObject(project, 'Sprite', 'Platform', 0);
  game.getObjects().insertNewObject(project, 'Sprite', 'Coin', 1);
  project.getObjects().insertNewObject(project, 'Sprite', 'Hud', 0);
  project.insertNewExternalLayout('Level1', 0).setAssociatedLayout('Game');
  project.insertNewLayout('Menu', 1);
  return game;
};

const addInstance = (
  container: gdInitialInstancesContainer,
  objectName: string,
  {
    x,
    y,
    layer,
    zOrder,
  }: {| x: number, y: number, layer?: string, zOrder?: number |}
): gdInitialInstance => {
  const instance = container.insertNewInitialInstance();
  instance.setObjectName(objectName);
  instance.setX(x);
  instance.setY(y);
  if (layer !== undefined) instance.setLayer(layer);
  if (zOrder !== undefined) instance.setZOrder(zOrder);
  return instance;
};

const getInstanceObjectNames = (
  container: gdInitialInstancesContainer
): Array<string> => {
  const names = [];
  const functor = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe[cannot-write]
  functor.invoke = instancePtr => {
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type]
      instancePtr,
      gd.InitialInstance
    );
    names.push(instance.getObjectName());
  };
  // $FlowFixMe[incompatible-type]
  container.iterateOverInstances(functor);
  functor.delete();
  return names.sort();
};

describe('external layouts as a scope of the container tools', () => {
  let project: gdProject;
  let game: gdLayout;

  beforeEach(() => {
    makeTestExtensions(gd);
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    game = createFakeProject(project);
  });

  afterEach(() => {
    project.delete();
  });

  describe('create_scene with as_external_layout_of_scene', () => {
    it('creates an external layout of an existing scene and reports it as created', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.create_scene.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scene_name: 'Level2',
            as_external_layout_of_scene: 'Game',
            // Ignored, with a note.
            include_ui_layer: true,
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Created external layout "Level2" for scene "Game".'
      );
      expect(result.message).toContain('include_ui_layer ignored');
      expect(result.message).toContain(
        'CreateObjectsFromExternalLayout("Level2", 0, 0)'
      );
      expect(result.meta).toEqual({ newExternalLayoutNames: ['Level2'] });
      expect(project.hasExternalLayoutNamed('Level2')).toBe(true);
      expect(project.getExternalLayout('Level2').getAssociatedLayout()).toBe(
        'Game'
      );
      // No scene was created.
      expect(project.hasLayoutNamed('Level2')).toBe(false);
    });

    it('is idempotent for an existing external layout of the same scene', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.create_scene.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: { scene_name: 'Level1', as_external_layout_of_scene: 'Game' },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'External layout "Level1" already exists (for scene "Game").'
      );
      expect(project.getExternalLayoutsCount()).toBe(1);
    });

    it('refuses an unknown scene, an existing scene name and another associated scene', async () => {
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
      const unknownScene: EditorFunctionGenericOutput = await editorFunctions.create_scene.launchFunction(
        {
          ...fakeOptions,
          args: { scene_name: 'Level2', as_external_layout_of_scene: 'Nope' },
        }
      );
      expect(unknownScene.success).toBe(false);
      expect(unknownScene.message).toContain(
        'Scene not found: "Nope". Scenes in this project: "Game", "Menu".'
      );

      const sceneName: EditorFunctionGenericOutput = await editorFunctions.create_scene.launchFunction(
        {
          ...fakeOptions,
          args: { scene_name: 'Menu', as_external_layout_of_scene: 'Game' },
        }
      );
      expect(sceneName.success).toBe(false);
      expect(sceneName.message).toBe(
        'A scene is already named "Menu": choose another name for the external layout.'
      );

      const otherScene: EditorFunctionGenericOutput = await editorFunctions.create_scene.launchFunction(
        {
          ...fakeOptions,
          args: { scene_name: 'Level1', as_external_layout_of_scene: 'Menu' },
        }
      );
      expect(otherScene.success).toBe(false);
      expect(otherScene.message).toContain(
        'External layout "Level1" already exists and is associated with scene "Game".'
      );
      expect(project.getExternalLayoutsCount()).toBe(1);
      expect(project.getExternalLayout('Level1').getAssociatedLayout()).toBe(
        'Game'
      );
    });
  });

  describe('change_scene_properties_layers_effects_groups', () => {
    it('renames an external layout, updating the events and the open tabs', async () => {
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
      // An event creating the objects of the external layout.
      const event = game
        .getEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
      const action = new gd.Instruction();
      action.setType('BuiltinExternalLayouts::CreateObjectsFromExternalLayout');
      action.setParametersCount(5);
      action.setParameter(1, '"Level1"');
      gd.asStandardEvent(event)
        .getActions()
        .insert(action, 0);
      action.delete();

      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: LEVEL1_SCOPE,
            changed_properties: [
              { property_name: 'name', new_value: 'Level 1 - Forest' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Renamed external layout "Level1" to "Level 1 - Forest" (the events creating its objects were updated).'
      );
      expect(project.hasExternalLayoutNamed('Level 1 - Forest')).toBe(true);
      expect(project.hasExternalLayoutNamed('Level1')).toBe(false);
      expect(
        gd
          .asStandardEvent(game.getEvents().getEventAt(0))
          .getActions()
          .get(0)
          .getParameter(1)
          .getPlainString()
      ).toBe('"Level 1 - Forest"');
      expect(
        fakeOptions.onProjectItemRenamedOutsideEditor
      ).toHaveBeenCalledWith({
        kind: 'external-layout',
        oldName: 'Level1',
        newName: 'Level 1 - Forest',
      });
    });

    it('keeps names unique when renaming, and refuses an empty name', async () => {
      project.insertNewExternalLayout('Level2', 1).setAssociatedLayout('Game');
      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: LEVEL1_SCOPE,
            changed_properties: [
              { property_name: 'name', new_value: 'Level2' },
            ],
          },
        }
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Renamed external layout "Level1" to "Level3"'
      );

      const emptyName: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: { type: 'external_layout', external_layout_name: 'Level3' },
            changed_properties: [{ property_name: 'name', new_value: '  ' }],
          },
        }
      );
      expect(emptyName.warnings).toContain(
        'An external layout name cannot be empty. Skipped.'
      );
      expect(project.hasExternalLayoutNamed('Level3')).toBe(true);
    });

    it('re-associates an external layout with another scene when its instances fit there', async () => {
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
      const externalLayout = project.getExternalLayout('Level1');
      // A global object on the base layer: fine in any scene.
      addInstance(externalLayout.getInitialInstances(), 'Hud', { x: 0, y: 0 });

      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: LEVEL1_SCOPE,
            changed_properties: [
              { property_name: 'associatedScene', new_value: 'Menu' },
            ],
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'External layout "Level1" is now associated with scene "Menu".'
      );
      expect(externalLayout.getAssociatedLayout()).toBe('Menu');
      expect(fakeOptions.onInstancesModifiedOutsideEditor).toHaveBeenCalledWith(
        { scene: project.getLayout('Menu'), externalLayout }
      );
    });

    it('refuses to re-associate an external layout whose instances use objects or layers the scene lacks', async () => {
      const externalLayout = project.getExternalLayout('Level1');
      addInstance(externalLayout.getInitialInstances(), 'Platform', {
        x: 0,
        y: 0,
        layer: 'Sky',
      });

      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: LEVEL1_SCOPE,
            changed_properties: [
              { property_name: 'associatedScene', new_value: 'Menu' },
              { property_name: 'associatedScene', new_value: 'Nope' },
              { property_name: 'backgroundColor', new_value: '#000000' },
            ],
          },
        }
      );

      expect(result.warnings).toContain(
        'External layout "Level1" was NOT associated with scene "Menu": its instances use objects this scene does not have (nor globally): "Platform" and layers this scene does not have: "Sky". Move or erase these instances first (or add the objects/layers to the scene).'
      );
      expect(result.warnings).toContain(
        'Scene not found: "Nope". Scenes in this project: "Game", "Menu". External layout "Level1" was NOT re-associated.'
      );
      expect(result.warnings).toContain(
        'Unknown external layout property: "backgroundColor". Skipped. An external layout only has `name` and `associatedScene`'
      );
      expect(externalLayout.getAssociatedLayout()).toBe('Game');
    });

    it('refuses layers, effects and groups changes through an external layout scope, changing nothing', async () => {
      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: LEVEL1_SCOPE,
            changed_properties: [{ property_name: 'name', new_value: 'Other' }],
            changed_layers: [{ layer_name: 'Clouds' }],
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Layers, layer effects and object groups belong to the associated scene "Game" of external layout "Level1": use scope { type: "scene", scene_name: "Game" } to change them. Nothing was changed.'
      );
      expect(project.hasExternalLayoutNamed('Level1')).toBe(true);
      expect(game.hasLayerNamed('Clouds')).toBe(false);
    });

    it('deletes an external layout after letting the editor close its tabs', async () => {
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
      const externalLayout = project.getExternalLayout('Level1');
      addInstance(externalLayout.getInitialInstances(), 'Coin', { x: 0, y: 0 });
      addInstance(externalLayout.getInitialInstances(), 'Coin', { x: 1, y: 0 });

      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: { scope: LEVEL1_SCOPE, delete_this_scene: true },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Deleted external layout "Level1" (2 instance(s) removed with it).'
      );
      expect(result.message).toContain(
        'CreateObjectsFromExternalLayout("Level1", ...)'
      );
      expect(project.hasExternalLayoutNamed('Level1')).toBe(false);
      expect(fakeOptions.onWillDeleteScene).toHaveBeenCalledWith({
        externalLayout,
      });
      // The scene itself is untouched.
      expect(project.hasLayoutNamed('Game')).toBe(true);
    });
  });

  describe('move_instances', () => {
    it('moves every instance of a scene to its external layout, keeping their properties and ids', async () => {
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
      const platform = addInstance(game.getInitialInstances(), 'Platform', {
        x: 100,
        y: 200,
        layer: 'Sky',
        zOrder: 7,
      });
      platform.setCustomWidth(64);
      platform.setCustomHeight(32);
      platform.setHasCustomSize(true);
      platform.setAngle(45);
      platform.setLocked(true);
      platform
        .getVariables()
        .insertNew('Speed', 0)
        .setValue(3);
      const platformUuid = platform.getPersistentUuid();
      addInstance(game.getInitialInstances(), 'Coin', { x: 1, y: 2 });
      addInstance(game.getInitialInstances(), 'Hud', { x: 3, y: 4 });

      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: GAME_SCOPE,
            move_instances: { to_scope: LEVEL1_SCOPE },
          },
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'Moved 3 instance(s) from scene "Game" to external layout "Level1" (positions, layers and ids unchanged): 1 Coin, 1 Hud, 1 Platform.'
      );
      expect(result.movedInstancesCount).toBe(3);
      expect(result.movedInstancesCountByObjectName).toEqual({
        Platform: 1,
        Coin: 1,
        Hud: 1,
      });
      expect(game.getInitialInstances().getInstancesCount()).toBe(0);
      const externalLayout = project.getExternalLayout('Level1');
      const movedInstances = externalLayout.getInitialInstances();
      expect(getInstanceObjectNames(movedInstances)).toEqual([
        'Coin',
        'Hud',
        'Platform',
      ]);

      // Everything is preserved on the moved platform, including its id.
      let movedPlatform: gdInitialInstance | null = null;
      const functor = new gd.InitialInstanceJSFunctor();
      // $FlowFixMe[cannot-write]
      functor.invoke = instancePtr => {
        const instance: gdInitialInstance = gd.wrapPointer(
          // $FlowFixMe[incompatible-type]
          instancePtr,
          gd.InitialInstance
        );
        if (instance.getObjectName() === 'Platform') movedPlatform = instance;
      };
      // $FlowFixMe[incompatible-type]
      movedInstances.iterateOverInstances(functor);
      functor.delete();
      const platformAfterMove = movedPlatform;
      if (!platformAfterMove) throw new Error('Platform instance not moved');
      expect(platformAfterMove.getPersistentUuid()).toBe(platformUuid);
      expect(platformAfterMove.getX()).toBe(100);
      expect(platformAfterMove.getY()).toBe(200);
      expect(platformAfterMove.getLayer()).toBe('Sky');
      expect(platformAfterMove.getZOrder()).toBe(7);
      expect(platformAfterMove.hasCustomSize()).toBe(true);
      expect(platformAfterMove.getCustomWidth()).toBe(64);
      expect(platformAfterMove.getAngle()).toBe(45);
      expect(platformAfterMove.isLocked()).toBe(true);
      expect(
        platformAfterMove
          .getVariables()
          .get('Speed')
          .getValue()
      ).toBe(3);

      // Both editors are refreshed.
      expect(fakeOptions.onInstancesModifiedOutsideEditor).toHaveBeenCalledWith(
        {
          scene: game,
        }
      );
      expect(fakeOptions.onInstancesModifiedOutsideEditor).toHaveBeenCalledWith(
        {
          scene: game,
          externalLayout,
        }
      );
    });

    it('moves only the instances matching the object names, layer names and ids filters', async () => {
      const externalLayout = project.getExternalLayout('Level1');
      // The id is read before the move: the source instance is then gone
      // (the moved one, in the target, keeps the same id).
      const skyCoinId = addInstance(game.getInitialInstances(), 'Coin', {
        x: 0,
        y: 0,
        layer: 'Sky',
      })
        .getPersistentUuid()
        .slice(0, 10);
      addInstance(game.getInitialInstances(), 'Coin', { x: 1, y: 0 });
      addInstance(game.getInitialInstances(), 'Platform', {
        x: 2,
        y: 0,
        layer: 'Sky',
      });

      const byObjectAndLayer: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: GAME_SCOPE,
            move_instances: {
              to_scope: LEVEL1_SCOPE,
              filter_by_object_names: ['Coin'],
              filter_by_layer_names: ['Sky'],
            },
          },
        }
      );
      expect(byObjectAndLayer.success).toBe(true);
      expect(byObjectAndLayer.message).toContain(
        'Moved 1 instance(s) of object(s) "Coin", on layer(s) "Sky" from scene "Game" to external layout "Level1"'
      );
      expect(game.getInitialInstances().getInstancesCount()).toBe(2);
      expect(externalLayout.getInitialInstances().getInstancesCount()).toBe(1);

      // Back to the scene, by id (the id is unchanged by the move).
      const byId: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: LEVEL1_SCOPE,
            move_instances: {
              to_scope: GAME_SCOPE,
              instance_ids: [skyCoinId],
            },
          },
        }
      );
      expect(byId.success).toBe(true);
      expect(byId.movedInstancesCount).toBe(1);
      expect(game.getInitialInstances().getInstancesCount()).toBe(3);
      expect(externalLayout.getInitialInstances().getInstancesCount()).toBe(0);

      // The base layer is selected with "".
      const baseLayer: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: GAME_SCOPE,
            move_instances: {
              to_scope: LEVEL1_SCOPE,
              filter_by_layer_names: [''],
            },
          },
        }
      );
      expect(baseLayer.success).toBe(true);
      expect(baseLayer.movedInstancesCountByObjectName).toEqual({ Coin: 1 });
    });

    it('is a no-op when nothing matches, and refuses unknown ids', async () => {
      addInstance(game.getInitialInstances(), 'Coin', { x: 1, y: 0 });

      const nothing: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          toolsVersion: 'v19',
          args: {
            scope: GAME_SCOPE,
            move_instances: {
              to_scope: LEVEL1_SCOPE,
              filter_by_object_names: ['Platform'],
            },
          },
        }
      );
      expect(nothing.success).toBe(true);
      expect(nothing.nothingChanged).toBe(true);
      expect(nothing.warnings).toContain(
        'No instance of object(s) "Platform" to move in scene "Game": nothing was moved.'
      );

      const unknownId: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: GAME_SCOPE,
            move_instances: {
              to_scope: LEVEL1_SCOPE,
              instance_ids: ['not-an-id'],
            },
          },
        }
      );
      expect(unknownId.success).toBe(false);
      expect(unknownId.message).toContain(
        '`move_instances.instance_ids` not found in scene "Game": "not-an-id". Nothing was moved.'
      );
      expect(game.getInitialInstances().getInstancesCount()).toBe(1);
    });

    it('refuses a move to the same container, to an unknown or invalid target, or from a variant', async () => {
      const fakeOptions = makeFakeLaunchFunctionOptionsWithProject(project);
      addInstance(game.getInitialInstances(), 'Coin', { x: 1, y: 0 });

      const sameContainer: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: { scope: GAME_SCOPE, move_instances: { to_scope: GAME_SCOPE } },
        }
      );
      expect(sameContainer.success).toBe(false);
      expect(sameContainer.message).toContain(
        '`move_instances.to_scope` is the same container as `scope` (scene "Game"): nothing to move.'
      );

      const unknownTarget: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: GAME_SCOPE,
            move_instances: {
              to_scope: {
                type: 'external_layout',
                external_layout_name: 'Nope',
              },
            },
          },
        }
      );
      expect(unknownTarget.success).toBe(false);
      expect(unknownTarget.message).toBe(
        '`move_instances.to_scope`: External layout not found: "Nope". External layouts in this project: "Level1".'
      );

      const missingTarget: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: { scope: GAME_SCOPE, move_instances: {} },
        }
      );
      expect(missingTarget.success).toBe(false);
      expect(missingTarget.message).toContain(
        '`move_instances.to_scope` is required'
      );

      const variantTarget: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...fakeOptions,
          args: {
            scope: GAME_SCOPE,
            move_instances: {
              to_scope: {
                type: 'custom_object_variant',
                extension_name: 'UI',
                custom_object_name: 'Dialog',
                variant_name: '',
              },
            },
          },
        }
      );
      expect(variantTarget.success).toBe(false);
      expect(variantTarget.message).toContain(
        '`scope.type` "custom_object_variant" is not accepted here: use one of "scene", "external_layout".'
      );
      expect(game.getInitialInstances().getInstancesCount()).toBe(1);
    });

    it('refuses, without moving anything, when the target lacks an object or a layer of the moved instances', async () => {
      addInstance(game.getInitialInstances(), 'Hud', { x: 0, y: 0 });
      addInstance(game.getInitialInstances(), 'Platform', {
        x: 1,
        y: 0,
        layer: 'Sky',
      });
      addInstance(game.getInitialInstances(), 'Coin', { x: 2, y: 0 });

      const result: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: GAME_SCOPE,
            move_instances: {
              to_scope: { type: 'scene', scene_name: 'Menu' },
            },
          },
        }
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Cannot move these instances to scene "Menu": it has no object named "Coin", "Platform" (nor globally) and it has no layer named "Sky". Nothing was moved. Create the missing objects/layers in the target first (or exclude these instances with the filters). An external layout uses the objects and layers of its associated scene.'
      );
      expect(game.getInitialInstances().getInstancesCount()).toBe(3);
      expect(
        project
          .getLayout('Menu')
          .getInitialInstances()
          .getInstancesCount()
      ).toBe(0);

      // The global object alone can go.
      const globalOnly: EditorFunctionGenericOutput = await editorFunctions.change_scene_properties_layers_effects_groups.launchFunction(
        {
          ...makeFakeLaunchFunctionOptionsWithProject(project),
          args: {
            scope: GAME_SCOPE,
            move_instances: {
              to_scope: { type: 'scene', scene_name: 'Menu' },
              filter_by_object_names: ['Hud'],
            },
          },
        }
      );
      expect(globalOnly.success).toBe(true);
      expect(globalOnly.movedInstancesCount).toBe(1);
    });
  });

  describe('listing the external layouts', () => {
    it('lists them in the simplified project (read with read_game_project_json)', async () => {
      addInstance(
        project.getExternalLayout('Level1').getInitialInstances(),
        'Coin',
        { x: 0, y: 0 }
      );
      const simplifiedProject = makeSimplifiedProjectBuilder(
        gd
      ).getSimplifiedProject(project, {});
      expect(simplifiedProject.externalLayouts).toEqual([
        {
          externalLayoutName: 'Level1',
          associatedSceneName: 'Game',
          instancesCount: 1,
        },
      ]);
      // Scoped to a scene: only its external layouts.
      expect(
        makeSimplifiedProjectBuilder(gd).getSimplifiedProject(project, {
          scopeToScene: 'Menu',
        }).externalLayouts
      ).toEqual([]);
    });
  });
});
