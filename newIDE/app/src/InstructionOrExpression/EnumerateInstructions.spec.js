// @flow
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { createTree } from './CreateTree';
import {
  enumerateAllInstructions,
  enumerateObjectAndBehaviorsInstructions,
  getObjectParameterIndex,
} from './EnumerateInstructions';
const gd: libGDevelop = global.gd;

describe('EnumerateInstructions', () => {
  it('can enumerate instructions being conditions', () => {
    const instructions = enumerateAllInstructions(true);

    // Test for the proper presence of a few conditions
    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Animation finished',
          fullGroupName: 'General/Sprite/Animations and images',
          type: 'AnimationEnded2',
        }),
        expect.objectContaining({
          displayedName: 'Trigger once while true',
          fullGroupName: 'Advanced/Events and control flow',
          type: 'BuiltinCommonInstructions::Once',
        }),
        expect.objectContaining({
          displayedName: 'The cursor/touch is on an object',
          fullGroupName: 'General/Objects/Mouse and touch',
          type: 'SourisSurObjet',
        }),
      ])
    );
  });

  it('can enumerate instructions being actions', () => {
    const instructions = enumerateAllInstructions(false);

    // Test for the proper presence of a few actions
    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Start (or reset) a scene timer',
          fullGroupName: 'General/Timers and time',
          type: 'ResetTimer',
        }),
        expect.objectContaining({
          displayedName: 'Rotate',
          fullGroupName: 'General/Objects/Angle',
          type: 'Rotate',
        }),
      ])
    );
  });

  it('can create the tree of instructions', () => {
    const instructions = enumerateAllInstructions(true);
    const tree = createTree(instructions);
    expect(tree).toHaveProperty('Advanced');
    expect(tree).toHaveProperty('Audio');
    expect(tree).toMatchObject({
      Advanced: {
        'Events and control flow': {
          'Trigger once while true': {
            displayedName: 'Trigger once while true',
            fullGroupName: 'Advanced/Events and control flow',
            type: 'BuiltinCommonInstructions::Once',
          },
        },
      },
      Audio: {
        'Sounds and music': {
          'Global volume': {
            displayedName: 'Global volume',
            fullGroupName: 'Audio/Sounds and music',
            type: 'GlobalVolume',
          },
        },
      },
    });
  });

  it('can find the object parameter, if any', () => {
    const actions = enumerateAllInstructions(false);
    const conditions = enumerateAllInstructions(true);

    const createInstruction = actions.filter(
      ({ type }) => type === 'Create'
    )[0];
    expect(createInstruction).not.toBeUndefined();
    expect(getObjectParameterIndex(createInstruction.metadata)).toBe(1);

    const pickRandom = actions.filter(({ type }) => type === 'AjoutHasard')[0];
    expect(pickRandom).not.toBeUndefined();
    expect(getObjectParameterIndex(pickRandom.metadata)).toBe(1);

    const pickAll = actions.filter(({ type }) => type === 'AjoutObjConcern')[0];
    expect(pickAll).not.toBeUndefined();
    expect(getObjectParameterIndex(pickAll.metadata)).toBe(1);

    const triggerOnce = conditions.filter(
      ({ type }) => type === 'BuiltinCommonInstructions::Once'
    )[0];
    expect(triggerOnce).not.toBeUndefined();
    expect(getObjectParameterIndex(triggerOnce.metadata)).toBe(-1);

    const spriteAnimationEnded = conditions.filter(
      ({ type }) => type === 'AnimationEnded2'
    )[0];
    expect(spriteAnimationEnded).not.toBeUndefined();
    expect(getObjectParameterIndex(spriteAnimationEnded.metadata)).toBe(0);
  });

  it('can enumerate instructions for an object (Sprite)', () => {
    makeTestExtensions(gd);
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    layout.insertNewObject(project, 'Sprite', 'MySpriteObject', 0);

    // Test for the proper presence of a few conditions.
    const spriteInstructions = enumerateObjectAndBehaviorsInstructions(
      true,
      project,
      layout,
      'MySpriteObject'
    );
    expect(spriteInstructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Animation finished',
          type: 'AnimationEnded2',
        }),
        expect.objectContaining({
          displayedName: 'The cursor/touch is on an object',
          type: 'SourisSurObjet',
        }),
      ])
    );
  });

  it('can enumerate instructions for an object (with an unsupported capability)', () => {
    makeTestExtensions(gd);
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    layout.insertNewObject(project, 'Sprite', 'MySpriteObject', 0);
    layout.insertNewObject(
      project,
      'FakeObjectWithUnsupportedCapability::FakeObjectWithUnsupportedCapability',
      'MyFakeObjectWithUnsupportedCapability',
      0
    );

    // Test the sprite can have effects related condition.
    const spriteInstructions = enumerateObjectAndBehaviorsInstructions(
      true,
      project,
      layout,
      'MySpriteObject'
    );
    expect(spriteInstructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Effect is enabled',
          fullGroupName: 'Effects',
          type: 'IsEffectEnabled',
        }),
      ])
    );

    // Test an object not supporting effects don't have this condition.
    const withUnsupportedCapabilityInstructions = enumerateObjectAndBehaviorsInstructions(
      true,
      project,
      layout,
      'MyFakeObjectWithUnsupportedCapability'
    );
    expect(withUnsupportedCapabilityInstructions).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Effect is enabled',
          fullGroupName: 'Effects',
          type: 'IsEffectEnabled',
        }),
      ])
    );
  });
});
