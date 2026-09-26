// @flow
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

const gd: libGDevelop = global.gd;

describe('instances raw JSON', () => {
  let project: gdProject;
  let scene: gdLayout;

  beforeEach(() => {
    makeTestExtensions(gd);
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    scene = project.insertNewLayout('Level1', 0);
  });

  afterEach(() => {
    project.delete();
  });

  const sceneScope = { type: 'scene', scene_name: 'Level1' };

  const describeInstances = (
    args: Object = {}
  ): Promise<EditorFunctionGenericOutput> =>
    editorFunctions.describe_instances.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: { scope: sceneScope, include_raw_json: true, ...args },
    });

  const changeInstances = (
    changes: Array<Object>
  ): Promise<EditorFunctionGenericOutput> =>
    editorFunctions.change_instances_raw_json.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: { scope: sceneScope, changes },
    });

  const addObject = (type: string, name: string): gdObject =>
    scene.getObjects().insertNewObject(project, type, name, 0);

  const addInstance = (objectName: string): gdInitialInstance => {
    const instance = scene.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName(objectName);
    return instance;
  };

  const addSpriteAnimations = (
    object: gdObject,
    animationNames: Array<string>
  ) => {
    animationNames.forEach(animationName => {
      const animation = new gd.Animation();
      animation.setName(animationName);
      gd.asSpriteConfiguration(object.getConfiguration())
        .getAnimations()
        .addAnimation(animation);
      animation.delete();
    });
  };

  const readRawJson = async (instance: gdInitialInstance): Promise<Object> => {
    const { instances } = await describeInstances();
    const describedInstance = (instances || []).find(
      ({ id }) => id === instance.getPersistentUuid().slice(0, 10)
    );
    if (!describedInstance) throw new Error('Instance not described.');
    return describedInstance.rawJson;
  };

  const change = (instance: gdInitialInstance, rawJson: Object) => ({
    instance_id: instance.getPersistentUuid().slice(0, 10),
    raw_json: JSON.stringify(rawJson),
  });

  it('describes the raw data of instances only when asked', async () => {
    addObject('Sprite', 'Player');
    addInstance('Player');

    const withRawJson = await describeInstances();
    const withoutRawJson = await describeInstances({
      include_raw_json: undefined,
    });

    expect((withRawJson.instances || [])[0].rawJson).toEqual({
      numberProperties: [],
      stringProperties: [],
      flippedX: false,
      flippedY: false,
      flippedZ: false,
    });
    expect((withoutRawJson.instances || [])[0].rawJson).toBeUndefined();
  });

  it('sets the starting animation and the flips of a sprite', async () => {
    addSpriteAnimations(addObject('Sprite', 'Player'), ['Idle', 'Run']);
    const instance = addInstance('Player');
    const rawJson = await readRawJson(instance);

    const result = await changeInstances([
      change(instance, {
        ...rawJson,
        numberProperties: [{ name: 'animation', value: 1 }],
        flippedX: true,
      }),
    ]);

    expect(result.success).toBe(true);
    expect(instance.getRawDoubleProperty('animation')).toBe(1);
    expect(instance.isFlippedX()).toBe(true);
  });

  it('sets the values of a text input', async () => {
    addObject('FakeTextInput::TextInput', 'NameInput');
    const instance = addInstance('NameInput');
    const rawJson = await readRawJson(instance);

    const result = await changeInstances([
      change(instance, {
        ...rawJson,
        stringProperties: [{ name: 'placeholder', value: 'Your name' }],
      }),
    ]);

    expect(result.success).toBe(true);
    expect(instance.getRawStringProperty('placeholder')).toBe('Your name');
  });

  it('keeps unknown properties written back unchanged, and tells when nothing changed', async () => {
    addObject('Sprite', 'Player');
    const instance = addInstance('Player');
    instance.setRawStringProperty('legacyValue', 'kept');
    const rawJson = await readRawJson(instance);

    const unchangedResult = await changeInstances([change(instance, rawJson)]);
    const flipResult = await changeInstances([
      change(instance, { ...rawJson, flippedY: true }),
    ]);

    expect(unchangedResult.message).toContain('Nothing changed');
    expect(flipResult.success).toBe(true);
    expect(instance.getRawStringProperty('legacyValue')).toBe('kept');
  });

  it.each([
    [
      'an animation out of range',
      (rawJson: Object) => ({
        ...rawJson,
        numberProperties: [{ name: 'animation', value: 2 }],
      }),
      'from 0 to 1',
    ],
    [
      'a property the object does not have',
      (rawJson: Object) => ({
        ...rawJson,
        stringProperties: [{ name: 'placeholder', value: 'x' }],
      }),
      'not a string property of this object',
    ],
    [
      'a property given twice',
      (rawJson: Object) => ({
        ...rawJson,
        numberProperties: [
          { name: 'animation', value: 1 },
          { name: 'animation', value: 0 },
        ],
      }),
      'has "animation" twice',
    ],
    [
      'a removed property',
      (rawJson: Object) => ({ ...rawJson, numberProperties: [] }),
      "can't be removed",
    ],
    [
      'a missing key',
      (rawJson: Object) => {
        const { flippedZ, ...otherKeys } = rawJson;
        return otherKeys;
      },
      'missing flippedZ',
    ],
    [
      'an unknown key',
      (rawJson: Object) => ({ ...rawJson, x: 10 }),
      'unknown x). The position, size, angle, rotation, layer and Z order of instances are set with `put_2d_instances`/`put_3d_instances`',
    ],
  ])(
    'refuses %s, changing nothing',
    async (_, editRawJson: Object => Object, expectedMessage) => {
      addSpriteAnimations(addObject('Sprite', 'Player'), ['Idle', 'Run']);
      const instance = addInstance('Player');
      instance.setRawDoubleProperty('animation', 1);
      const rawJson = await readRawJson(instance);

      const result = await changeInstances([
        change(instance, editRawJson(rawJson)),
      ]);

      expect(result.success).toBe(false);
      expect(result.message).toContain(expectedMessage);
      expect(instance.getRawDoubleProperty('animation')).toBe(1);
    }
  );

  it('refuses to flip an object that has no flip', async () => {
    addObject('FakeTextInput::TextInput', 'NameInput');
    const instance = addInstance('NameInput');
    const rawJson = await readRawJson(instance);

    const result = await changeInstances([
      change(instance, { ...rawJson, flippedX: true }),
    ]);

    expect(result.success).toBe(false);
    expect(result.message).toContain('this object has no flip');
    expect(instance.isFlippedX()).toBe(false);
  });

  it('changes no instance when one change of the batch is invalid', async () => {
    addSpriteAnimations(addObject('Sprite', 'Player'), ['Idle', 'Run']);
    const firstInstance = addInstance('Player');
    const secondInstance = addInstance('Player');
    const rawJson = await readRawJson(firstInstance);

    const result = await changeInstances([
      change(firstInstance, {
        ...rawJson,
        numberProperties: [{ name: 'animation', value: 1 }],
      }),
      change(secondInstance, {
        ...rawJson,
        numberProperties: [{ name: 'animation', value: 5 }],
      }),
    ]);

    expect(result.success).toBe(false);
    expect(firstInstance.getRawDoubleProperty('animation')).toBe(0);
  });

  it('refuses an instance changed twice, even through ids of different lengths', async () => {
    addSpriteAnimations(addObject('Sprite', 'Player'), ['Idle', 'Run']);
    const instance = addInstance('Player');
    const rawJson = await readRawJson(instance);

    const result = await changeInstances([
      change(instance, { ...rawJson, flippedX: true }),
      {
        instance_id: instance.getPersistentUuid().slice(0, 12),
        raw_json: JSON.stringify(rawJson),
      },
    ]);

    expect(result.success).toBe(false);
    expect(result.message).toContain('changed twice');
    expect(instance.isFlippedX()).toBe(false);
  });

  it('refuses an id shorter than the ids of describe_instances', async () => {
    addObject('Sprite', 'Player');
    const instance = addInstance('Player');
    const rawJson = await readRawJson(instance);

    const result = await changeInstances([
      {
        instance_id: instance.getPersistentUuid().slice(0, 4),
        raw_json: JSON.stringify(rawJson),
      },
    ]);

    expect(result.success).toBe(false);
    expect(result.message).toContain('No instance has the id');
  });

  describe('tile maps', () => {
    let tileMapInstance: gdInitialInstance;

    const makeTileMap = (dimX: number, dimY: number, tile: number = -1) =>
      JSON.stringify({
        tileWidth: 16,
        tileHeight: 16,
        dimX,
        dimY,
        layers: [
          {
            id: 0,
            alpha: 1,
            tiles: Array.from({ length: dimY }, () =>
              Array.from({ length: dimX }, () => tile)
            ),
          },
        ],
      });

    const withTileMap = (rawJson: Object, tileMap: string) => ({
      ...rawJson,
      stringProperties: [{ name: 'tilemap', value: tileMap }],
    });

    beforeEach(() => {
      const tileMap = addObject('TileMap::SimpleTileMap', 'Ground');
      const configurationJson = serializeToJSObject(tileMap.getConfiguration());
      unserializeFromJSObject(
        tileMap.getConfiguration(),
        {
          ...configurationJson,
          content: {
            ...configurationJson.content,
            tileSize: 16,
            columnCount: 4,
            rowCount: 2,
          },
        },
        'unserializeFrom',
        project
      );
      tileMapInstance = addInstance('Ground');
    });

    it('paints tiles, keeping the scale of a resized map', async () => {
      tileMapInstance.setRawStringProperty('tilemap', makeTileMap(4, 2));
      tileMapInstance.setHasCustomSize(true);
      tileMapInstance.setCustomWidth(128);
      tileMapInstance.setCustomHeight(64);
      const rawJson = await readRawJson(tileMapInstance);
      // Flipped tiles, as stored by the editor (signed) or not.
      const tiles = JSON.parse(makeTileMap(8, 2, 7));
      tiles.layers[0].tiles[0][0] = -2147483645;
      tiles.layers[0].tiles[0][1] = 2147483651;
      tiles.layers[0].tiles[1][0] = -1;

      const result = await changeInstances([
        change(tileMapInstance, withTileMap(rawJson, JSON.stringify(tiles))),
      ]);

      expect(result.success).toBe(true);
      expect(tileMapInstance.getRawStringProperty('tilemap')).toBe(
        JSON.stringify(tiles)
      );
      expect(tileMapInstance.getCustomWidth()).toBe(256);
      expect(tileMapInstance.getCustomHeight()).toBe(64);
    });

    it('lets a map painted for the first time take the size of its grid', async () => {
      tileMapInstance.setHasCustomSize(true);
      const rawJson = await readRawJson(tileMapInstance);

      const result = await changeInstances([
        change(tileMapInstance, withTileMap(rawJson, makeTileMap(3, 3, 0))),
      ]);

      expect(result.success).toBe(true);
      expect(tileMapInstance.hasCustomSize()).toBe(false);
    });

    it.each([
      ['a tile out of the atlas', makeTileMap(2, 2, 8), 'the tile 8'],
      ['a tile that is not an integer', makeTileMap(2, 2, 1.5), 'the tile 1.5'],
      [
        'rows of the wrong length',
        JSON.stringify({
          ...JSON.parse(makeTileMap(2, 2)),
          dimX: 3,
        }),
        '2 rows of 3 tiles',
      ],
      [
        'an opacity that is not a number',
        JSON.stringify({
          ...JSON.parse(makeTileMap(2, 2)),
          layers: [{ ...JSON.parse(makeTileMap(2, 2)).layers[0], alpha: null }],
        }),
        'must be one layer {id: 0',
      ],
      [
        'a second layer',
        JSON.stringify({
          ...JSON.parse(makeTileMap(2, 2)),
          layers: [
            ...JSON.parse(makeTileMap(2, 2)).layers,
            { ...JSON.parse(makeTileMap(2, 2)).layers[0], id: 1 },
          ],
        }),
        'must be one layer {id: 0',
      ],
    ])('refuses %s', async (_, tileMap, expectedMessage) => {
      const rawJson = await readRawJson(tileMapInstance);

      const result = await changeInstances([
        change(tileMapInstance, withTileMap(rawJson, tileMap)),
      ]);

      expect(result.success).toBe(false);
      expect(result.message).toContain(expectedMessage);
      expect(tileMapInstance.getRawStringProperty('tilemap')).toBe('');
    });
  });
});
