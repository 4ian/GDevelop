// @flow
import { createTree } from './CreateTree';
import {
  enumerateAllInstructions,
  getObjectParameterIndex,
} from './EnumerateInstructions';

describe('EnumerateInstructions', () => {
  it('can enumerate instructions being conditions', () => {
    const instructions = enumerateAllInstructions(true);

    // Test for the proper presence of a few conditions
    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Animation finished',
          fullGroupName: 'General/Sprite/Animations and images',
          type: 'AnimationEnded',
        }),
        expect.objectContaining({
          displayedName: 'Trigger once while true',
          fullGroupName: 'advanced/Events and control flow',
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
    expect(tree).toHaveProperty('advanced');
    expect(tree).toHaveProperty('audio');
    expect(tree).toMatchObject({
      advanced: {
        'Events and control flow': {
          'Trigger once while true': {
            displayedName: 'Trigger once while true',
            fullGroupName: 'advanced/Events and control flow',
            type: 'BuiltinCommonInstructions::Once',
          },
        },
      },
      audio: {
        'Sounds and musics': {
          'Global volume': {
            displayedName: 'Global volume',
            fullGroupName: 'audio/Sounds and musics',
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

    const spriteAnimatedEnded = conditions.filter(
      ({ type }) => type === 'AnimationEnded'
    )[0];
    expect(spriteAnimatedEnded).not.toBeUndefined();
    expect(getObjectParameterIndex(spriteAnimatedEnded.metadata)).toBe(0);
  });
});
