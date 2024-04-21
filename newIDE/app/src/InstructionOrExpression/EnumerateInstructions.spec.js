// @flow
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { createTree } from './CreateTree';
import {
  enumerateAllInstructions,
  enumerateObjectAndBehaviorsInstructions,
  getObjectParameterIndex,
} from './EnumerateInstructions';
const gd: libGDevelop = global.gd;

// $FlowExpectedError
const makeFakeI18n = (fakeI18n): I18nType => ({
  ...fakeI18n,
  _: message => message.id,
});

describe('EnumerateInstructions', () => {
  it('can enumerate instructions being conditions', () => {
    const instructions = enumerateAllInstructions(
      true,
      // $FlowFixMe The fake I18n translates groups to empty strings.
      null
    );

    // Test for the proper presence of a few conditions
    expect(
      instructions.find(
        instruction =>
          instruction.type ===
          'AnimatableCapability::AnimatableBehavior::HasAnimationEnded'
      )
    ).toEqual(
      expect.objectContaining({
        displayedName: 'Animation finished',
        fullGroupName: 'General/Animatable capability/Animations and images',
        type: 'AnimatableCapability::AnimatableBehavior::HasAnimationEnded',
      })
    );
    expect(
      instructions.find(instruction => instruction.type === 'Sprite')
    ).toEqual(
      expect.objectContaining({
        displayedName: 'Current frame',
        fullGroupName: 'General/Sprite/Animations and images',
        type: 'Sprite',
      })
    );
    expect(
      instructions.find(
        instruction => instruction.type === 'BuiltinCommonInstructions::Once'
      )
    ).toEqual(
      expect.objectContaining({
        displayedName: 'Trigger once while true',
        fullGroupName: 'Advanced/Events and control flow',
        type: 'BuiltinCommonInstructions::Once',
      })
    );
    expect(
      instructions.find(instruction => instruction.type === 'SourisSurObjet')
    ).toEqual(
      expect.objectContaining({
        displayedName: 'The cursor/touch is on an object',
        fullGroupName: 'General/Objects/Mouse and touch',
        type: 'SourisSurObjet',
      })
    );
  });

  it('can enumerate instructions being actions', () => {
    const instructions = enumerateAllInstructions(
      false,
      // $FlowFixMe The fake I18n translates groups to empty strings.
      null
    );

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
    const instructions = enumerateAllInstructions(true, makeFakeI18n());
    const tree = createTree(instructions);
    expect(tree).toHaveProperty('Advanced');
    expect(tree).toHaveProperty('Audio');
    expect(tree).toMatchObject({
      Advanced: {
        'Events and control flow': {
          'BuiltinCommonInstructions::Once': {
            displayedName: 'Trigger once while true',
            fullGroupName: 'Advanced/Events and control flow',
            type: 'BuiltinCommonInstructions::Once',
          },
        },
      },
      Audio: {
        'Sounds and music': {
          GlobalVolume: {
            displayedName: 'Global volume',
            fullGroupName: 'Audio/Sounds and music',
            type: 'GlobalVolume',
          },
        },
      },
    });
  });

  it('can find the object parameter, if any', () => {
    const actions = enumerateAllInstructions(false, makeFakeI18n());
    const conditions = enumerateAllInstructions(true, makeFakeI18n());

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
      ({ type }) =>
        type === 'AnimatableCapability::AnimatableBehavior::HasAnimationEnded'
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
      'MySpriteObject',
      makeFakeI18n()
    );
    expect(spriteInstructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Animation finished',
          type: 'AnimatableCapability::AnimatableBehavior::HasAnimationEnded',
        }),
        expect.objectContaining({
          displayedName: 'The cursor/touch is on an object',
          type: 'SourisSurObjet',
        }),
      ])
    );
  });
});
