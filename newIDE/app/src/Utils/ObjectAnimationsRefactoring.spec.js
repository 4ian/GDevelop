// @flow
import {
  renameObjectAnimationReferences,
  renameObjectPointReferences,
} from './ObjectAnimationsRefactoring';
import { unserializeFromJSObject } from './Serializer';

const gd: libGDevelop = global.gd;

describe('ObjectAnimationsRefactoring', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
  });

  afterEach(() => {
    project.delete();
  });

  const addSpriteAnimation = (object: gdObject, animationName: string) => {
    const animation = new gd.Animation();
    animation.setName(animationName);
    animation.setDirectionsCount(1);
    gd.asSpriteConfiguration(object.getConfiguration())
      .getAnimations()
      .addAnimation(animation);
    animation.delete();
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

  const makeScene = (sceneName: string): gdLayout => {
    const scene = project.insertNewLayout(sceneName, project.getLayoutsCount());
    setEventsReferringTo(scene.getEvents(), 'Player');
    return scene;
  };

  it('updates animation and point references in every scene using a global object, except where a local object shadows it', () => {
    const player = project
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Player', 0);
    addSpriteAnimation(player, 'Run');
    const level1 = makeScene('Level1');
    const level2 = makeScene('Level2');
    const shadowingScene = makeScene('ShadowingScene');
    shadowingScene.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
    const externalEvents = project.insertNewExternalEvents('Shared', 0);
    externalEvents.setAssociatedLayout('Level2');
    setEventsReferringTo(externalEvents.getEvents(), 'Player');

    renameObjectAnimationReferences(
      {
        project,
        object: player,
        layout: level1,
        eventsFunctionsExtension: null,
        eventsBasedObject: null,
      },
      'Run',
      'Sprint'
    );
    renameObjectPointReferences(
      {
        project,
        object: player,
        layout: level1,
        eventsFunctionsExtension: null,
        eventsBasedObject: null,
      },
      'Muzzle',
      'Gun'
    );

    expect(getActionParameter(level1.getEvents(), 0, 1)).toBe('"Sprint"');
    expect(getActionParameter(level2.getEvents(), 0, 1)).toBe('"Sprint"');
    expect(getActionParameter(externalEvents.getEvents(), 0, 1)).toBe(
      '"Sprint"'
    );
    expect(getActionParameter(shadowingScene.getEvents(), 0, 1)).toBe('"Run"');
    expect(getActionParameter(level2.getEvents(), 1, 2)).toBe(
      'Player.PointX("Gun")'
    );
    expect(getActionParameter(shadowingScene.getEvents(), 1, 2)).toBe(
      'Player.PointX("Muzzle")'
    );
  });

  it('only updates the scene of a scene object', () => {
    const level1 = makeScene('Level1');
    const level2 = makeScene('Level2');
    const player = level1
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Player', 0);
    level2.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);

    renameObjectAnimationReferences(
      {
        project,
        object: player,
        layout: level1,
        eventsFunctionsExtension: null,
        eventsBasedObject: null,
      },
      'Run',
      'Sprint'
    );

    expect(getActionParameter(level1.getEvents(), 0, 1)).toBe('"Sprint"');
    expect(getActionParameter(level2.getEvents(), 0, 1)).toBe('"Run"');
  });

  it('updates the events of the custom object a child object belongs to', () => {
    const extension = project.insertNewEventsFunctionsExtension('UI', 0);
    const dialog = extension.getEventsBasedObjects().insertNew('Dialog', 0);
    const background = dialog
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Background', 0);
    const onCreated = dialog
      .getEventsFunctions()
      .insertNewEventsFunction('onCreated', 0);
    setEventsReferringTo(onCreated.getEvents(), 'Background');
    const scene = makeScene('Level1');

    renameObjectAnimationReferences(
      {
        project,
        object: background,
        layout: null,
        eventsFunctionsExtension: extension,
        eventsBasedObject: dialog,
      },
      'Run',
      'Sprint'
    );

    expect(getActionParameter(onCreated.getEvents(), 0, 1)).toBe('"Sprint"');
    expect(getActionParameter(scene.getEvents(), 0, 1)).toBe('"Run"');
  });
});
