// @flow
import axios from 'axios';
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';
import { listAllExamples, getExample } from '../Utils/GDevelopServices/Example';
import { serializeToJSObject } from '../Utils/Serializer';
import { mapFor } from '../Utils/MapFor';

jest.mock('../Utils/GDevelopServices/Example', () => ({
  listAllExamples: jest.fn(),
  getExample: jest.fn(),
}));

const gd: libGDevelop = global.gd;

const PROJECT_FILE_URL = 'https://example.com/examples/collect/collect.json';

const addImageResource = (project: gdProject, name: string, file: string) => {
  const resource = new gd.ImageResource();
  resource.setName(name);
  resource.setFile(file);
  project.getResourcesManager().addResource(resource);
  resource.delete();
};

const addSprite = (
  project: gdProject,
  objects: gdObjectsContainer,
  name: string,
  imageName: string
): gdObject => {
  const object = objects.insertNewObject(
    project,
    'Sprite',
    name,
    objects.getObjectsCount()
  );
  const animation = new gd.Animation();
  animation.setDirectionsCount(1);
  const sprite = new gd.Sprite();
  sprite.setImageName(imageName);
  animation.getDirection(0).addSprite(sprite);
  gd.asSpriteConfiguration(object.getConfiguration())
    .getAnimations()
    .addAnimation(animation);
  sprite.delete();
  animation.delete();
  return object;
};

const addInstance = (
  instances: gdInitialInstancesContainer,
  objectName: string
) => {
  instances.insertNewInitialInstance().setObjectName(objectName);
};

const setEvents = (
  project: gdProject,
  events: gdEventsList,
  serializedEvents: Array<Object>
) => {
  const element = gd.Serializer.fromJSObject(serializedEvents);
  events.unserializeFrom(project, element);
  element.delete();
};

const makeAction = (type: string, parameters: Array<string>) => ({
  type: 'BuiltinCommonInstructions::Standard',
  conditions: [],
  actions: [{ type: { value: type }, parameters }],
});

const insertExtension = (
  project: gdProject,
  name: string,
  version: string
): gdEventsFunctionsExtension => {
  const extension = project.insertNewEventsFunctionsExtension(
    name,
    project.getEventsFunctionsExtensionsCount()
  );
  extension.setVersion(version);
  return extension;
};

/**
 * An example with a "Level" scene using a behavior of an extension (which
 * uses another one), a global object, global variables, external events and
 * an external layout; and what the "Level" scene does not use.
 */
const createFakeExampleProjectJson = (): Object => {
  const example = gd.ProjectHelper.createNewGDJSProject();
  insertExtension(example, 'Helpers', '1.0.0');
  insertExtension(example, 'Unused', '1.0.0');
  const collect = insertExtension(example, 'Collect', '1.0.0');
  collect.getEventsBasedBehaviors().insertNew('Collectible', 0);
  setEvents(
    example,
    collect
      .getEventsFunctions()
      .insertNewEventsFunction('Spin', 0)
      .getEvents(),
    [makeAction('Helpers::Wave', [])]
  );

  addImageResource(example, 'player.png', 'assets/player.png');
  addImageResource(example, 'coin.png', 'assets/coin.png');
  addImageResource(example, 'hud.png', 'assets/hud.png');
  addImageResource(example, 'unused.png', 'assets/unused.png');
  addSprite(example, example.getObjects(), 'Hud', 'hud.png');
  addSprite(example, example.getObjects(), 'UnusedGlobal', 'unused.png');
  addSprite(example, example.getObjects(), 'Bat', 'hud.png');
  example
    .getObjects()
    .getObjectGroups()
    .insertNew('Enemies', 0)
    .addObject('Bat');
  example
    .getVariables()
    .insertNew('Lives', 0)
    .setValue(3);
  example
    .getVariables()
    .insertNew('Coins', 1)
    .setValue(0);
  example.getVariables().insertNew('UnusedVariable', 2);

  const level = example.insertNewLayout('Level', 0);
  level.insertNewLayer('UI', 1);
  addSprite(example, level.getObjects(), 'Player', 'player.png').addNewBehavior(
    example,
    'Collect::Collectible',
    'Collectible'
  );
  addSprite(example, level.getObjects(), 'Coin', 'coin.png');
  addInstance(level.getInitialInstances(), 'Player');
  addInstance(level.getInitialInstances(), 'Hud');
  setEvents(example, level.getEvents(), [
    {
      ...makeAction('SetNumberVariable', ['Coins', '+', '1']),
      conditions: [
        {
          type: { value: 'NumberVariable' },
          parameters: ['Lives', '>', '0'],
        },
      ],
    },
    makeAction('Delete', ['Hud', '']),
    makeAction('Delete', ['Enemies', '']),
    {
      type: 'BuiltinCommonInstructions::Link',
      include: { includeConfig: 0 },
      target: 'Logic',
    },
  ]);
  setEvents(example, example.insertNewExternalEvents('Logic', 0).getEvents(), [
    makeAction('Create', ['', 'Coin', '0', '0', '""']),
  ]);
  const bonus = example.insertNewExternalLayout('Bonus', 0);
  bonus.setAssociatedLayout('Level');
  addInstance(bonus.getInitialInstances(), 'Coin');
  example.insertNewExternalLayout('Unrelated', 1);
  example.insertNewLayout('Menu', 1);

  const projectJson = serializeToJSObject(example);
  example.delete();
  return projectJson;
};

describe('copy_from_example', () => {
  let project: gdProject;

  beforeEach(() => {
    project = gd.ProjectHelper.createNewGDJSProject();
    // $FlowFixMe[prop-missing]
    listAllExamples.mockResolvedValue({
      exampleShortHeaders: [{ id: 'collect-id', slug: 'collect' }],
      filters: {},
    });
    // $FlowFixMe[prop-missing]
    getExample.mockResolvedValue({ projectFileUrl: PROJECT_FILE_URL });
    jest
      .spyOn(axios, 'get')
      .mockResolvedValue({ data: createFakeExampleProjectJson() });
  });

  afterEach(() => {
    project.delete();
  });

  const copyFromExample = (
    args: Object
  ): Promise<EditorFunctionGenericOutput> =>
    editorFunctions.copy_from_example.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      args,
    });

  it('copies a scene with everything it uses, keeping what the project has', async () => {
    project.insertNewLayout('Level', 0);
    project.insertNewExternalEvents('Logic', 0);
    addImageResource(project, 'player.png', 'assets/hero.png');
    insertExtension(project, 'Helpers', '2.0.0');
    project
      .getVariables()
      .insertNew('Lives', 0)
      .setValue(9);

    const result = await copyFromExample({
      example: 'collect',
      scene: 'Level',
    });

    expect(result).toEqual({
      success: true,
      message: [
        'Copied the scene "Level" of the example "collect" as the new scene "Level2": 2 instances, 2 layers, 4 events, 3 resources.',
        'Objects (4): Player, Coin, Hud, Bat.',
        'Global objects of the example, now objects of the scene: Hud, Bat.',
        'External layouts: Bonus.',
        'External events: Logic2.',
        'Global variables: Coins.',
        'Extensions installed: Collect 1.0.0.',
        'Conflicts: the project\'s extension "Helpers" (2.0.0) was kept, the example has 1.0.0; the project\'s global variable "Lives" was kept, it differs from the example\'s one.',
      ].join('\n'),
      meta: { newSceneNames: ['Level2'] },
    });

    const scene = project.getLayout('Level2');
    const player = scene.getObjects().getObject('Player');
    expect(player.hasBehaviorNamed('Collectible')).toBe(true);
    expect(
      gd
        .asSpriteConfiguration(player.getConfiguration())
        .getAnimations()
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0)
        .getImageName()
    ).toBe('player2.png');
    const resources = project.getResourcesManager();
    expect(resources.getResource('player.png').getFile()).toBe(
      'assets/hero.png'
    );
    expect(resources.getResource('player2.png').getFile()).toBe(
      'https://example.com/examples/collect/assets/player.png'
    );
    expect(resources.hasResource('unused.png')).toBe(false);
    expect(project.hasEventsFunctionsExtensionNamed('Unused')).toBe(false);
    expect(project.getObjects().hasObjectNamed('Hud')).toBe(false);
    expect(
      scene
        .getObjects()
        .getObjectGroups()
        .has('Enemies')
    ).toBe(true);
    expect(
      project
        .getVariables()
        .get('Lives')
        .getValue()
    ).toBe(9);
    expect(project.getVariables().has('UnusedVariable')).toBe(false);
    expect(gd.asLinkEvent(scene.getEvents().getEventAt(3)).getTarget()).toBe(
      'Logic2'
    );
    expect(project.getExternalLayout('Bonus').getAssociatedLayout()).toBe(
      'Level2'
    );
    expect(project.hasExternalLayoutNamed('Unrelated')).toBe(false);
    expect(
      mapFor(0, project.getLayoutsCount(), i =>
        project.getLayoutAt(i).getName()
      )
    ).toEqual(['Level', 'Level2']);
  });

  it('copies a scene under the name asked', async () => {
    const result = await copyFromExample({
      example: 'collect',
      scene: 'Menu',
      new_scene_name: 'Title',
    });

    expect(result.success).toBe(true);
    expect(project.hasLayoutNamed('Title')).toBe(true);
    expect(project.getEventsFunctionsExtensionsCount()).toBe(0);
  });

  it('fails for an unknown example or scene', async () => {
    const unknownExampleResult = await copyFromExample({
      example: 'collector',
      scene: 'Level',
    });
    const unknownSceneResult = await copyFromExample({
      example: 'collect',
      scene: 'Game',
    });

    expect(unknownExampleResult).toEqual({
      success: false,
      message:
        'There is no example "collector" in the examples library: give the slug of an example exactly as given by `search`. Nothing was copied.',
    });
    expect(unknownSceneResult).toEqual({
      success: false,
      message:
        'The example "collect" has no scene "Game". Its scenes: "Level", "Menu". Nothing was copied.',
    });
    expect(project.getLayoutsCount()).toBe(0);
  });
});
