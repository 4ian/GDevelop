// @flow
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { markObjectAsOpenedInEditor } from '../ObjectEditor/ObjectsOpenedInEditor';
import { mapFor } from '../Utils/MapFor';
import { PixiResourcesLoaderMock } from '../fixtures/TestPixiResourcesLoader';

const gd: libGDevelop = global.gd;

describe('object raw JSON and renames', () => {
  let project: gdProject;
  let scene: gdLayout;

  beforeEach(() => {
    makeTestExtensions(gd);
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    scene = project.insertNewLayout('Level1', 0);
    ['Frame100x240', 'Frame50x120', 'Atlas64x32'].forEach(imageName => {
      const resource = new gd.ImageResource();
      resource.setName(imageName);
      project.getResourcesManager().addResource(resource);
      resource.delete();
    });
  });

  afterEach(() => {
    project.delete();
  });

  const addAnimation = (
    object: gdObject,
    animationName: string,
    pointNames: Array<string> = []
  ) => {
    const animation = new gd.Animation();
    animation.setName(animationName);
    animation.setDirectionsCount(1);
    const sprite = new gd.Sprite();
    sprite.setImageName('Frame100x240');
    pointNames.forEach(pointName => {
      const point = new gd.Point(pointName);
      sprite.addPoint(point);
      point.delete();
    });
    animation.getDirection(0).addSprite(sprite);
    gd.asSpriteConfiguration(object.getConfiguration())
      .getAnimations()
      .addAnimation(animation);
    sprite.delete();
    animation.delete();
  };

  const makePlayer = (
    animationNames: Array<string>,
    pointNames: Array<string> = []
  ): gdObject => {
    const player = scene
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Player', 0);
    animationNames.forEach(animationName =>
      addAnimation(player, animationName, pointNames)
    );
    return player;
  };

  const getAnimationNames = (object: gdObject) => {
    const configuration = object.getConfiguration();
    return mapFor(0, configuration.getAnimationsCount(), i =>
      configuration.getAnimationName(i)
    );
  };

  const setEventsReferringTo = (
    eventsList: gdEventsList,
    objectName: string
  ) => {
    unserializeFromJSObject(
      eventsList,
      [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'SetAnimationName' },
              parameters: [objectName, '"Run"'],
            },
            {
              type: { value: 'MettreX' },
              parameters: [objectName, '=', `${objectName}.PointX("Muzzle")`],
            },
          ],
        },
      ],
      'unserializeFrom',
      project
    );
  };

  const getActionParameter = (
    eventsList: gdEventsList,
    actionIndex: number,
    parameterIndex: number
  ): string =>
    gd
      .asStandardEvent(eventsList.getEventAt(0))
      .getActions()
      .get(actionIndex)
      .getParameter(parameterIndex)
      .getPlainString();

  const sceneScope = { type: 'scene', scene_name: 'Level1' };

  const inspect = (args: Object): Promise<EditorFunctionGenericOutput> =>
    editorFunctions.inspect_object_properties_effects.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: { scope: sceneScope, include_raw_json: true, ...args },
    });

  const change = (args: Object): Promise<EditorFunctionGenericOutput> =>
    editorFunctions.change_object_properties_effects.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args: { scope: sceneScope, ...args },
    });

  const readRawJson = async (
    objectName: string,
    scope: Object = sceneScope
  ) => {
    const result = await inspect({ object_name: objectName, scope });
    if (!result.rawJson) throw new Error('No rawJson returned.');
    return result.rawJson;
  };

  const addInstance = (
    initialInstances: gdInitialInstancesContainer,
    objectName: string,
    animationIndex: ?number
  ): gdInitialInstance => {
    const instance = initialInstances.insertNewInitialInstance();
    instance.setObjectName(objectName);
    if (animationIndex !== null && animationIndex !== undefined) {
      instance.setRawDoubleProperty('animation', animationIndex);
    }
    return instance;
  };

  describe('raw configuration', () => {
    it('returns the configuration, the frame image sizes and how to write it back', async () => {
      makePlayer(['Idle']);

      const result = await inspect({ object_name: 'Player' });

      expect(result.success).toBe(true);
      expect(result.rawJson && result.rawJson.animations[0].name).toBe('Idle');
      expect(result.frameImageSizes).toEqual({
        Frame100x240: { width: 100, height: 240 },
      });
      expect(result.message).toContain('`raw_json`');
    });

    it('does not return the configuration unless asked', async () => {
      makePlayer(['Idle']);

      const result = await inspect({
        object_name: 'Player',
        include_raw_json: undefined,
      });

      expect(result.rawJson).toBeUndefined();
      expect(result.message).toBeUndefined();
    });

    it('adds a point to every frame, keeping everything else', async () => {
      const player = makePlayer(['Idle', 'Run']);
      gd.asSpriteConfiguration(player.getConfiguration()).setPreScale(2);
      const rawJson = await readRawJson('Player');
      rawJson.animations.forEach(animation =>
        animation.directions[0].sprites.forEach(sprite =>
          sprite.points.push({ name: 'Muzzle', x: 90, y: 20 })
        )
      );

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(true);
      expect(serializeToJSObject(player.getConfiguration())).toEqual(rawJson);
      expect(
        gd.asSpriteConfiguration(player.getConfiguration()).getPreScale()
      ).toBe(2);
    });

    it('warns about keys the object type ignores', async () => {
      makePlayer(['Idle']);
      const rawJson = await readRawJson('Player');

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify({ ...rawJson, preScale: 1, colour: 'red' }),
      });

      expect(result.message).toContain('Ignored keys: preScale, colour');
    });

    it('warns about keys ignored inside the animations', async () => {
      makePlayer(['Idle']);
      const rawJson = await readRawJson('Player');
      rawJson.animations[0].directions[0].sprites[0].tint = '255;0;0';

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.message).toContain(
        'Ignored keys: animations[].directions[].sprites[].tint'
      );
    });

    it.each([
      [
        'a missing key',
        (rawJson: Object) => {
          delete rawJson.updateIfNotVisible;
        },
        'missing updateIfNotVisible',
      ],
      [
        'a non-convex collision polygon',
        (rawJson: Object) => {
          const frame = rawJson.animations[0].directions[0].sprites[0];
          frame.customCollisionMask = [
            [
              { x: 0, y: 0 },
              { x: 10, y: 0 },
              { x: 5, y: 2 },
              { x: 10, y: 10 },
              { x: 0, y: 10 },
            ],
          ];
        },
        'not convex',
      ],
      [
        'a self-intersecting collision polygon',
        (rawJson: Object) => {
          const frame = rawJson.animations[0].directions[0].sprites[0];
          frame.customCollisionMask = [
            [
              { x: 50, y: 0 },
              { x: 80, y: 100 },
              { x: 0, y: 35 },
              { x: 100, y: 35 },
              { x: 20, y: 100 },
            ],
          ];
        },
        'not convex',
      ],
      [
        'a frame image that is not a resource',
        (rawJson: Object) => {
          rawJson.animations[0].directions[0].sprites[0].image = 'Unknown.png';
        },
        '"Unknown.png", which is not an image resource',
      ],
      [
        'a frame image written with another case',
        (rawJson: Object) => {
          rawJson.animations[0].directions[0].sprites[0].image = 'frame50x120';
        },
        'Did you mean "Frame50x120"',
      ],
      [
        'a point with a reserved name',
        (rawJson: Object) => {
          rawJson.animations[0].directions[0].sprites[0].points.push({
            name: 'Origin',
            x: 0,
            y: 0,
          });
        },
        'has a point named "Origin"',
      ],
    ])(
      'refuses %s, changing nothing',
      async (_, editRawJson, expectedMessage) => {
        const player = makePlayer(['Idle']);
        const rawJson = await readRawJson('Player');
        const initialJson = serializeToJSObject(player.getConfiguration());
        editRawJson(rawJson);

        const result = await change({
          object_name: 'Player',
          raw_json: JSON.stringify(rawJson),
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain(expectedMessage);
        expect(serializeToJSObject(player.getConfiguration())).toEqual(
          initialJson
        );
      }
    );

    it('accepts frames written back unchanged even when their data is imperfect', async () => {
      const player = makePlayer(['Idle', 'Run']);
      const rawJson = await readRawJson('Player');
      rawJson.animations[0].directions[0].sprites[0].image = 'Missing.png';
      unserializeFromJSObject(
        player.getConfiguration(),
        rawJson,
        'unserializeFrom',
        project
      );
      rawJson.animations[1].directions[0].timeBetweenFrames = 0.2;

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(true);
    });

    it('refuses raw JSON combined with other changes', async () => {
      makePlayer(['Idle']);
      const rawJson = await readRawJson('Player');

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
        changed_properties: [{ property_name: 'name', new_value: 'Hero' }],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('separate calls');
      expect(scene.getObjects().hasObjectNamed('Player')).toBe(true);
    });

    it('ignores empty lists of renames given with other changes', async () => {
      makePlayer(['Idle']);

      const result = await change({
        object_name: 'Player',
        renamed_animations: [],
        renamed_points: [],
        changed_properties: [{ property_name: 'name', new_value: 'Hero' }],
      });

      expect(result.success).toBe(true);
      expect(scene.getObjects().hasObjectNamed('Hero')).toBe(true);
    });

    it('refuses to change an object open in the object editor', async () => {
      const player = makePlayer(['Idle']);
      const rawJson = await readRawJson('Player');
      const unmark = markObjectAsOpenedInEditor(player);

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });
      unmark();

      expect(result.success).toBe(false);
      expect(result.message).toContain('open in the object editor');
    });
  });

  describe('a Sprite created from scratch', () => {
    // The browser `File` is not in the test environment: a named Blob is what
    // is read of it.
    const { Blob: NodeBlob } = require('buffer');
    const attachmentsForResources = {
      getFiles: async (attachmentIds: Array<string>) => {
        const files: { [attachmentId: string]: ?File } = {};
        attachmentIds.forEach(attachmentId => {
          const file = new NodeBlob(['fake png'], { type: 'image/png' });
          file.name = `${attachmentId}.png`;
          files[attachmentId] = file;
        });
        return files;
      },
      // Stores the files like the cloud or local storage would.
      storeResourceFiles: async () => {
        const resourcesManager = project.getResourcesManager();
        resourcesManager
          .getAllResourceNames()
          .toJSArray()
          .forEach(name => {
            const resource = resourcesManager.getResource(name);
            if (resource.getFile().startsWith('blob:'))
              resource.setFile(`https://project-resources/${name}`);
          });
        return true;
      },
    };

    it('gets animations whose frames use images attached by the user', async () => {
      const launchOptions = {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        attachmentsForResources,
      };
      await editorFunctions.create_or_replace_object.launchFunction({
        ...launchOptions,
        args: { scope: sceneScope, object_type: 'Sprite', object_name: 'Hero' },
      });
      await editorFunctions.change_project_properties_resources.launchFunction({
        ...launchOptions,
        args: {
          added_resources: [
            { attachment_id: 'run1', resource_name: 'HeroRun1' },
            { attachment_id: 'run2', resource_name: 'HeroRun2' },
          ],
        },
      });
      const inspected = await inspect({ object_name: 'Hero' });
      const rawJson = inspected.rawJson;
      if (!rawJson) throw new Error('No rawJson returned.');
      rawJson.animations = [
        {
          name: 'Idle',
          directions: [{ sprites: [{ image: 'Frame100x240' }] }],
        },
        {
          name: 'Run',
          directions: [
            {
              looping: true,
              timeBetweenFrames: 0.1,
              sprites: [{ image: 'HeroRun1' }, { image: 'HeroRun2' }],
            },
          ],
        },
      ];

      const result = await change({
        object_name: 'Hero',
        raw_json: JSON.stringify(rawJson),
      });

      expect(inspected.message).toContain('An animation is');
      expect(result.success).toBe(true);
      const animations = gd
        .asSpriteConfiguration(
          scene
            .getObjects()
            .getObject('Hero')
            .getConfiguration()
        )
        .getAnimations();
      expect(animations.getAnimationsCount()).toBe(2);
      const runDirection = animations.getAnimation(1).getDirection(0);
      expect(runDirection.getSpritesCount()).toBe(2);
      expect(runDirection.getSprite(1).getImageName()).toBe('HeroRun2');
      expect(runDirection.getTimeBetweenFrames()).toBeCloseTo(0.1);
      expect(runDirection.isLooping()).toBe(true);
    });
  });

  it('gives the animations in the file of a 3D model', async () => {
    const robot = scene
      .getObjects()
      .insertNewObject(project, 'FakeScene3D::Model3DObject', 'Robot', 0);
    robot.getConfiguration().updateProperty('modelResourceName', 'Robot.glb');

    const result = await editorFunctions.inspect_object_properties_effects.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        PixiResourcesLoader: {
          ...PixiResourcesLoaderMock,
          get3DModel: async () => ({
            animations: [{ name: 'Armature|Idle' }, { name: 'Armature|Run' }],
          }),
        },
        args: {
          scope: sceneScope,
          object_name: 'Robot',
          include_raw_json: true,
        },
      }
    );

    expect(result.modelAnimationSources).toEqual([
      'Armature|Idle',
      'Armature|Run',
    ]);
  });

  describe('raw configuration read by the engine', () => {
    it('validates the frames the engine keeps, whatever the JSON has', async () => {
      const player = makePlayer(['Idle']);
      const rawJson = await readRawJson('Player');
      const initialJson = serializeToJSObject(player.getConfiguration());
      rawJson.animations[0].directions[0].sprites[0].image = 'Unknown.png';

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify({
          ...rawJson,
          animatable: { animations: [] },
        }),
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('"Unknown.png"');
      expect(serializeToJSObject(player.getConfiguration())).toEqual(
        initialJson
      );
    });

    it('warns about values kept with another type', async () => {
      makePlayer(['Idle']);
      const rawJson = await readRawJson('Player');
      rawJson.animations[0].directions[0].timeBetweenFrames = 'fast';

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain(
        'animations[0].directions[0].timeBetweenFrames (written as string, kept as number)'
      );
    });

    it.each([
      ['a number too large', '{"extraValue": 1e999}'],
      ['a reserved key', '{"hasOwnProperty": true}'],
    ])('refuses %s', async (_, extraJson) => {
      makePlayer(['Idle']);
      const rawJson = await readRawJson('Player');

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson).replace(
          /^\{/,
          extraJson.slice(0, -1) + ','
        ),
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("can't be stored");
    });

    it('refuses a raw JSON that is not a string', async () => {
      makePlayer(['Idle']);
      const rawJson = await readRawJson('Player');

      const result = await change({ object_name: 'Player', raw_json: rawJson });

      expect(result.success).toBe(false);
      expect(result.message).toContain('`JSON.stringify(rawJson)`');
    });

    it('tells when nothing changed', async () => {
      makePlayer(['Idle']);
      const rawJson = await readRawJson('Player');

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.message).toContain('Nothing changed');
    });
  });

  describe('animations identified by their names', () => {
    it('allows content edits with unnamed or duplicated animations', async () => {
      makePlayer(['', 'Run', 'Run']);
      const rawJson = await readRawJson('Player');
      rawJson.animations[2].directions[0].timeBetweenFrames = 0.5;

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(true);
    });

    it('keeps the starting animation of instances when animations are reordered', async () => {
      const player = makePlayer(['Idle', 'Run', 'Jump']);
      const externalLayout = project.insertNewExternalLayout('Room', 0);
      externalLayout.setAssociatedLayout('Level1');
      const idleInstance = addInstance(
        scene.getInitialInstances(),
        'Player',
        null
      );
      const jumpInstance = addInstance(
        externalLayout.getInitialInstances(),
        'Player',
        2
      );
      const rawJson = await readRawJson('Player');
      rawJson.animations = [
        rawJson.animations[2],
        rawJson.animations[0],
        rawJson.animations[1],
      ];

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(true);
      expect(getAnimationNames(player)).toEqual(['Jump', 'Idle', 'Run']);
      expect(idleInstance.getRawDoubleProperty('animation')).toBe(1);
      expect(jumpInstance.getRawDoubleProperty('animation')).toBe(0);
      expect(result.message).toContain(
        'Events using animation numbers instead of names were not changed.'
      );
    });

    it('starts instances with the first animation when theirs is removed', async () => {
      makePlayer(['Idle', 'Run']);
      setEventsReferringTo(scene.getEvents(), 'Player');
      const runInstance = addInstance(scene.getInitialInstances(), 'Player', 1);
      const rawJson = await readRawJson('Player');
      rawJson.animations = [rawJson.animations[0]];

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(true);
      expect(runInstance.getRawDoubleProperty('animation')).toBe(0);
      expect(result.message).toContain(
        'Removed animations "Run": events referring to them were not changed.'
      );
      expect(result.message).toContain(
        '1 instance(s) started with a removed animation'
      );
    });

    it('keeps the starting animation of the instances of a global object, except where a scene shadows it', async () => {
      const player = project
        .getObjects()
        .insertNewObject(project, 'Sprite', 'Player', 0);
      addAnimation(player, 'Idle');
      addAnimation(player, 'Run');
      const shadowingScene = project.insertNewLayout('ShadowingScene', 1);
      shadowingScene
        .getObjects()
        .insertNewObject(project, 'Sprite', 'Player', 0);
      const unassociatedLayout = project.insertNewExternalLayout('Room', 0);
      const sceneInstance = addInstance(
        scene.getInitialInstances(),
        'Player',
        1
      );
      const roomInstance = addInstance(
        unassociatedLayout.getInitialInstances(),
        'Player',
        1
      );
      const shadowedInstance = addInstance(
        shadowingScene.getInitialInstances(),
        'Player',
        1
      );
      const rawJson = await readRawJson('Player');
      rawJson.animations.reverse();

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(true);
      expect(sceneInstance.getRawDoubleProperty('animation')).toBe(0);
      expect(roomInstance.getRawDoubleProperty('animation')).toBe(0);
      expect(shadowedInstance.getRawDoubleProperty('animation')).toBe(1);
    });

    it('reads starting animations like the runtime and leaves those out of the list untouched', async () => {
      makePlayer(['Idle', 'Run']);
      const runInstance = addInstance(
        scene.getInitialInstances(),
        'Player',
        1.5
      );
      const outOfListInstance = addInstance(
        scene.getInitialInstances(),
        'Player',
        7
      );
      const rawJson = await readRawJson('Player');
      rawJson.animations.reverse();

      await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(runInstance.getRawDoubleProperty('animation')).toBe(0);
      expect(outOfListInstance.getRawDoubleProperty('animation')).toBe(7);
    });

    it('refuses a rename done in raw JSON when events use the old name, with the recipe', async () => {
      const player = makePlayer(['Idle', 'Run']);
      setEventsReferringTo(scene.getEvents(), 'Player');
      const rawJson = await readRawJson('Player');
      rawJson.animations[1].name = 'Sprint';

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        'renamed_animations: [{ old_name: "Run", new_name: "Sprint", index: 1 }]'
      );
      expect(getAnimationNames(player)).toEqual(['Idle', 'Run']);
    });

    it('pairs each renamed animation with its new name in the recipe', async () => {
      // Only "Run" is used in the events, and both animations are renamed.
      makePlayer(['Idle', 'Run']);
      setEventsReferringTo(scene.getEvents(), 'Player');
      const rawJson = await readRawJson('Player');
      rawJson.animations[0].name = 'idle';
      rawJson.animations[1].name = 'run';

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        '{ old_name: "Run", new_name: "run", index: 1 }'
      );
    });

    it('finds the names used in the external events of the scene', async () => {
      makePlayer(['Idle', 'Run']);
      const externalEvents = project.insertNewExternalEvents('LevelLogic', 0);
      externalEvents.setAssociatedLayout('Level1');
      setEventsReferringTo(externalEvents.getEvents(), 'Player');
      const rawJson = await readRawJson('Player');
      rawJson.animations[1].name = 'Sprint';

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('renamed_animations');
    });

    it('finds a used name containing quotes', async () => {
      makePlayer(['Idle', 'Say "hi"']);
      unserializeFromJSObject(
        scene.getEvents(),
        [
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'SetAnimationName' },
                parameters: ['Player', '"Say \\"hi\\""'],
              },
            ],
          },
        ],
        'unserializeFrom',
        project
      );
      const rawJson = await readRawJson('Player');
      rawJson.animations[1].name = 'Greet';

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('renamed_animations');
    });

    it('keeps the n-th unnamed animation of an instance when animations are added', async () => {
      makePlayer(['', '']);
      const instance = addInstance(scene.getInitialInstances(), 'Player', 1);
      const rawJson = await readRawJson('Player');
      rawJson.animations.unshift({ ...rawJson.animations[0], name: 'Jump' });

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(true);
      expect(instance.getRawDoubleProperty('animation')).toBe(2);
    });

    it('replaces animations that no event uses', async () => {
      const player = makePlayer(['Idle', 'Run']);
      const rawJson = await readRawJson('Player');
      rawJson.animations[1].name = 'Sprint';

      const result = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(true);
      expect(getAnimationNames(player)).toEqual(['Idle', 'Sprint']);
    });

    it('reorders and replaces unnamed animations', async () => {
      const player = makePlayer(['', 'Run']);
      setEventsReferringTo(scene.getEvents(), 'Player');
      const rawJson = await readRawJson('Player');
      rawJson.animations.reverse();

      const reordered = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });
      rawJson.animations = [{ ...rawJson.animations[0], name: 'Run' }];
      rawJson.animations.push({ ...rawJson.animations[0], name: 'Idle' });
      const replaced = await change({
        object_name: 'Player',
        raw_json: JSON.stringify(rawJson),
      });

      expect(reordered.success).toBe(true);
      expect(replaced.success).toBe(true);
      expect(getAnimationNames(player)).toEqual(['Run', 'Idle']);
    });
  });

  describe('renames', () => {
    it('renames an animation, keeping its index, and updates the events', async () => {
      const player = makePlayer(['Idle', 'Run']);
      setEventsReferringTo(scene.getEvents(), 'Player');

      const result = await change({
        object_name: 'Player',
        renamed_animations: [{ old_name: 'Run', new_name: 'Sprint' }],
      });

      expect(result.success).toBe(true);
      expect(getAnimationNames(player)).toEqual(['Idle', 'Sprint']);
      expect(getActionParameter(scene.getEvents(), 0, 1)).toBe('"Sprint"');
    });

    it('renames a point in every frame and updates the events', async () => {
      const player = makePlayer(['Idle', 'Run'], ['Muzzle']);
      setEventsReferringTo(scene.getEvents(), 'Player');

      const result = await change({
        object_name: 'Player',
        renamed_points: [{ old_name: 'Muzzle', new_name: 'Gun' }],
      });

      expect(result.success).toBe(true);
      const rawJson = serializeToJSObject(player.getConfiguration());
      expect(
        rawJson.animations.map(
          animation => animation.directions[0].sprites[0].points[0].name
        )
      ).toEqual(['Gun', 'Gun']);
      expect(getActionParameter(scene.getEvents(), 1, 2)).toBe(
        'Player.PointX("Gun")'
      );
    });

    it('names an unnamed animation by its index', async () => {
      const player = makePlayer(['Idle', '']);

      const result = await change({
        object_name: 'Player',
        renamed_animations: [{ old_name: '', new_name: 'Run', index: 1 }],
      });

      expect(result.success).toBe(true);
      expect(getAnimationNames(player)).toEqual(['Idle', 'Run']);
    });

    it('renames one of two same-named animations without changing the events', async () => {
      const player = makePlayer(['Run', 'Run']);
      setEventsReferringTo(scene.getEvents(), 'Player');

      const result = await change({
        object_name: 'Player',
        renamed_animations: [{ old_name: 'Run', new_name: 'Sprint', index: 1 }],
      });

      expect(result.success).toBe(true);
      expect(getAnimationNames(player)).toEqual(['Run', 'Sprint']);
      expect(getActionParameter(scene.getEvents(), 0, 1)).toBe('"Run"');
      expect(result.message).toContain('were not changed');
    });

    it('allows renames among other same-named animations', async () => {
      const player = makePlayer(['Walk', 'Walk', 'Idle']);

      const result = await change({
        object_name: 'Player',
        renamed_animations: [{ old_name: 'Idle', new_name: 'Run' }],
      });

      expect(result.success).toBe(true);
      expect(getAnimationNames(player)).toEqual(['Walk', 'Walk', 'Run']);
    });

    it('refuses a point renamed twice, or renamed to itself', async () => {
      makePlayer(['Idle'], ['Muzzle']);

      const twiceResult = await change({
        object_name: 'Player',
        renamed_points: [
          { old_name: 'Muzzle', new_name: 'Gun' },
          { old_name: 'Muzzle', new_name: 'Cannon' },
        ],
      });
      const itselfResult = await change({
        object_name: 'Player',
        renamed_points: [{ old_name: 'Muzzle', new_name: 'Muzzle' }],
      });

      expect(twiceResult.message).toContain('is renamed twice');
      expect(itselfResult.message).toContain('is renamed to itself');
    });

    it.each([
      [
        'a chain of renames',
        [
          { old_name: 'Idle', new_name: 'Run' },
          { old_name: 'Run', new_name: 'Jump' },
        ],
        'rename in separate calls',
      ],
      [
        'an index not matching the expected name',
        [{ old_name: 'Idle', new_name: 'Wait', index: 1 }],
        'is not named "Idle"',
      ],
      [
        'two animations with the same final name',
        [{ old_name: 'Idle', new_name: 'Jump' }],
        'Two animations would be named "Jump"',
      ],
      [
        'several animations matching the name',
        [{ old_name: 'Run', new_name: 'Sprint' }],
        'pass the `index`',
      ],
    ])('refuses %s, changing nothing', async (_, renames, expectedMessage) => {
      const player = makePlayer(['Idle', 'Run', 'Jump', 'Run']);

      const result = await change({
        object_name: 'Player',
        renamed_animations: renames,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain(expectedMessage);
      expect(getAnimationNames(player)).toEqual(['Idle', 'Run', 'Jump', 'Run']);
    });

    it('refuses a reserved or already used point name', async () => {
      makePlayer(['Idle'], ['Muzzle', 'Gun']);

      const reservedResult = await change({
        object_name: 'Player',
        renamed_points: [{ old_name: 'Muzzle', new_name: 'Center' }],
      });
      const usedResult = await change({
        object_name: 'Player',
        renamed_points: [{ old_name: 'Muzzle', new_name: 'Gun' }],
      });

      expect(reservedResult.success).toBe(false);
      expect(reservedResult.message).toContain('can\'t be named "Center"');
      expect(usedResult.success).toBe(false);
      expect(usedResult.message).toContain('Two points would be named "Gun"');
    });
  });

  describe('custom objects', () => {
    let extension: gdEventsFunctionsExtension;
    let dialog: gdEventsBasedObject;

    const variantScope = (variantName: string) => ({
      type: 'custom_object_variant',
      extension_name: 'UI',
      custom_object_name: 'Dialog',
      variant_name: variantName,
    });

    beforeEach(() => {
      extension = project.insertNewEventsFunctionsExtension('UI', 0);
      dialog = extension.getEventsBasedObjects().insertNew('Dialog', 0);
      const background = dialog
        .getObjects()
        .insertNewObject(project, 'Sprite', 'Background', 0);
      addAnimation(background, 'Idle');
      addAnimation(background, 'Run');
      dialog.getVariants().insertNewVariant('Red', 0);
      gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
        project,
        dialog
      );
    });

    const getVariantBackground = (variantName: string) =>
      variantName
        ? dialog
            .getVariants()
            .getVariant(variantName)
            .getObjects()
            .getObject('Background')
        : dialog.getObjects().getObject('Background');

    it('renames the animation of a child in every variant and updates the custom object events', async () => {
      const onCreated = dialog
        .getEventsFunctions()
        .insertNewEventsFunction('onCreated', 0);
      setEventsReferringTo(onCreated.getEvents(), 'Background');

      const result = await change({
        scope: variantScope(''),
        object_name: 'Background',
        renamed_animations: [{ old_name: 'Run', new_name: 'Sprint' }],
      });

      expect(result.success).toBe(true);
      expect(getAnimationNames(getVariantBackground(''))).toEqual([
        'Idle',
        'Sprint',
      ]);
      expect(getAnimationNames(getVariantBackground('Red'))).toEqual([
        'Idle',
        'Sprint',
      ]);
      expect(getActionParameter(onCreated.getEvents(), 0, 1)).toBe('"Sprint"');
    });

    it('renames the animation in the overrides of the child in custom objects', async () => {
      const dialogObject = scene
        .getObjects()
        .insertNewObject(project, 'UI::Dialog', 'MyDialog', 0);
      const rawJson = await readRawJson('MyDialog');
      await change({
        object_name: 'MyDialog',
        raw_json: JSON.stringify({
          ...rawJson,
          childrenContent: {
            Background: serializeToJSObject(
              getVariantBackground('').getConfiguration()
            ),
          },
        }),
      });

      const result = await change({
        scope: variantScope(''),
        object_name: 'Background',
        renamed_animations: [{ old_name: 'Run', new_name: 'Sprint' }],
      });

      expect(result.success).toBe(true);
      expect(
        serializeToJSObject(
          dialogObject.getConfiguration()
        ).childrenContent.Background.animations.map(animation => animation.name)
      ).toEqual(['Idle', 'Sprint']);
    });

    it('refuses to rename in a variant child open in the object editor', async () => {
      const unmark = markObjectAsOpenedInEditor(getVariantBackground('Red'));

      const result = await change({
        scope: variantScope(''),
        object_name: 'Background',
        renamed_animations: [{ old_name: 'Run', new_name: 'Sprint' }],
      });
      unmark();

      expect(result.success).toBe(false);
      expect(result.message).toContain('open in the object editor');
      expect(getAnimationNames(getVariantBackground(''))).toEqual([
        'Idle',
        'Run',
      ]);
    });

    it('refuses a rename conflicting in a variant, changing nothing', async () => {
      addAnimation(getVariantBackground('Red'), 'Sprint');

      const result = await change({
        scope: variantScope(''),
        object_name: 'Background',
        renamed_animations: [{ old_name: 'Run', new_name: 'Sprint' }],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('variant "Red"');
      expect(getAnimationNames(getVariantBackground(''))).toEqual([
        'Idle',
        'Run',
      ]);
    });

    it('refuses renames and structural edits in a named variant', async () => {
      const renameResult = await change({
        scope: variantScope('Red'),
        object_name: 'Background',
        renamed_animations: [{ old_name: 'Run', new_name: 'Sprint' }],
      });
      const rawJson = await readRawJson('Background', variantScope('Red'));
      rawJson.animations.reverse();
      const reorderResult = await change({
        scope: variantScope('Red'),
        object_name: 'Background',
        raw_json: JSON.stringify(rawJson),
      });

      expect(renameResult.success).toBe(false);
      expect(renameResult.message).toContain(
        'rename them on the default variant'
      );
      expect(reorderResult.success).toBe(false);
      expect(reorderResult.message).toContain('in a named variant');
    });

    it('reorders the animations of a child of one variant, remapping only its instances', async () => {
      const defaultInstance = addInstance(
        dialog.getInitialInstances(),
        'Background',
        1
      );
      const redInstance = addInstance(
        dialog
          .getVariants()
          .getVariant('Red')
          .getInitialInstances(),
        'Background',
        1
      );
      const rawJson = await readRawJson('Background', variantScope(''));
      rawJson.animations.reverse();

      const result = await change({
        scope: variantScope(''),
        object_name: 'Background',
        raw_json: JSON.stringify(rawJson),
      });

      expect(result.success).toBe(true);
      expect(defaultInstance.getRawDoubleProperty('animation')).toBe(0);
      expect(redInstance.getRawDoubleProperty('animation')).toBe(1);
    });

    describe('in a scene', () => {
      let dialogObject: gdObject;

      beforeEach(() => {
        dialogObject = scene
          .getObjects()
          .insertNewObject(project, 'UI::Dialog', 'MyDialog', 0);
      });

      it('overrides the configuration of a child', async () => {
        const rawJson = await readRawJson('MyDialog');
        const backgroundJson = serializeToJSObject(
          getVariantBackground('').getConfiguration()
        );
        backgroundJson.animations[0].directions[0].timeBetweenFrames = 0.3;

        const result = await change({
          object_name: 'MyDialog',
          raw_json: JSON.stringify({
            ...rawJson,
            childrenContent: { Background: backgroundJson },
          }),
        });

        expect(result.success).toBe(true);
        const customConfiguration = gd.asCustomObjectConfiguration(
          dialogObject.getConfiguration()
        );
        expect(
          customConfiguration.isMarkedAsOverridingEventsBasedObjectChildrenConfiguration()
        ).toBe(true);
      });

      it('starts instances with the first animation when every animation is removed', async () => {
        dialog.markAsAnimatable(true);
        const animations = gd
          .asCustomObjectConfiguration(dialogObject.getConfiguration())
          .getAnimations();
        ['Opening', 'Closing'].forEach(animationName => {
          const animation = new gd.Animation();
          animation.setName(animationName);
          animations.addAnimation(animation);
          animation.delete();
        });
        const closingInstance = addInstance(
          scene.getInitialInstances(),
          'MyDialog',
          1
        );
        const rawJson = await readRawJson('MyDialog');
        rawJson.animatable.animations = [];

        const result = await change({
          object_name: 'MyDialog',
          raw_json: JSON.stringify(rawJson),
        });

        expect(result.success).toBe(true);
        expect(closingInstance.getRawDoubleProperty('animation')).toBe(0);
      });

      it('starts overriding a child whose unchanged frames have imperfect data', async () => {
        const backgroundJson = serializeToJSObject(
          getVariantBackground('').getConfiguration()
        );
        backgroundJson.animations[0].directions[0].sprites[0].image =
          'Missing.png';
        unserializeFromJSObject(
          getVariantBackground('').getConfiguration(),
          backgroundJson,
          'unserializeFrom',
          project
        );
        const rawJson = await readRawJson('MyDialog');
        backgroundJson.animations[1].directions[0].timeBetweenFrames = 0.3;

        const result = await change({
          object_name: 'MyDialog',
          raw_json: JSON.stringify({
            ...rawJson,
            childrenContent: { Background: backgroundJson },
          }),
        });

        expect(result.success).toBe(true);
      });

      it('refuses to change the overrides of a child custom object', async () => {
        const outer = extension.getEventsBasedObjects().insertNew('Outer', 1);
        outer.getObjects().insertNewObject(project, 'UI::Dialog', 'Inner', 0);
        const outerObject = scene
          .getObjects()
          .insertNewObject(project, 'UI::Outer', 'MyOuter', 0);
        const rawJson = await readRawJson('MyOuter');
        const initialJson = serializeToJSObject(outerObject.getConfiguration());
        const backgroundJson = serializeToJSObject(
          getVariantBackground('').getConfiguration()
        );
        backgroundJson.animations.reverse();

        const result = await change({
          object_name: 'MyOuter',
          raw_json: JSON.stringify({
            ...rawJson,
            childrenContent: {
              Inner: {
                ...serializeToJSObject(dialogObject.getConfiguration()),
                childrenContent: { Background: backgroundJson },
              },
            },
          }),
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain(
          "`childrenContent.Inner.childrenContent` can't change here"
        );
        expect(serializeToJSObject(outerObject.getConfiguration())).toEqual(
          initialJson
        );
      });

      it('refuses structural edits of a child, unknown children and variants', async () => {
        const rawJson = await readRawJson('MyDialog');
        const backgroundJson = serializeToJSObject(
          getVariantBackground('').getConfiguration()
        );
        backgroundJson.animations.reverse();

        const reorderResult = await change({
          object_name: 'MyDialog',
          raw_json: JSON.stringify({
            ...rawJson,
            childrenContent: { Background: backgroundJson },
          }),
        });
        const unknownChildResult = await change({
          object_name: 'MyDialog',
          raw_json: JSON.stringify({
            ...rawJson,
            childrenContent: { Title: {} },
          }),
        });
        const unknownVariantResult = await change({
          object_name: 'MyDialog',
          raw_json: JSON.stringify({ ...rawJson, variant: 'Blue' }),
        });

        expect(reorderResult.success).toBe(false);
        expect(reorderResult.message).toContain('childrenContent.Background');
        expect(serializeToJSObject(dialogObject.getConfiguration())).toEqual(
          rawJson
        );
        expect(unknownChildResult.success).toBe(false);
        expect(unknownChildResult.message).toContain('"Title"');
        expect(unknownVariantResult.success).toBe(false);
        expect(unknownVariantResult.message).toContain('`variant`');
      });
    });
  });

  describe('simple tile maps', () => {
    it('recomputes the grid from the atlas before checking the hit boxes', async () => {
      const tileMap = scene
        .getObjects()
        .insertNewObject(project, 'TileMap::SimpleTileMap', 'Ground', 0);
      const rawJson = await readRawJson('Ground');
      rawJson.content.atlasImage = 'Atlas64x32';
      rawJson.content.tileSize = 16;

      const validResult = await change({
        object_name: 'Ground',
        raw_json: JSON.stringify({
          ...rawJson,
          content: { ...rawJson.content, tilesWithHitBox: '0,7' },
        }),
      });
      const outOfRangeResult = await change({
        object_name: 'Ground',
        raw_json: JSON.stringify({
          ...rawJson,
          content: { ...rawJson.content, tilesWithHitBox: '8' },
        }),
      });

      expect(validResult.success).toBe(true);
      expect(serializeToJSObject(tileMap.getConfiguration()).content).toEqual(
        expect.objectContaining({
          columnCount: 4,
          rowCount: 2,
          tilesWithHitBox: '0,7',
        })
      );
      expect(outOfRangeResult.success).toBe(false);
      expect(outOfRangeResult.message).toContain('0 to 7');
    });
  });
});
