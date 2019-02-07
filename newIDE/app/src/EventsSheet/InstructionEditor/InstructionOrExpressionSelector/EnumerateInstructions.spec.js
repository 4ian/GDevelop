import { createTree } from './CreateTree';
import { enumerateInstructions } from './EnumerateInstructions';

describe('EnumerateInstructions', () => {
  it('can enumerate instructions being conditions', () => {
    const instructions = enumerateInstructions(true);

    // Test for the proper presence of a few conditions
    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Animation finished',
          fullGroupName: 'Sprite/Animations and images',
          type: 'AnimationEnded',
        }),
        expect.objectContaining({
          displayedName: 'Trigger once while true',
          fullGroupName: 'Advanced',
          type: 'BuiltinCommonInstructions::Once',
        }),
        expect.objectContaining({
          displayedName: 'The cursor/touch is on an object',
          fullGroupName: 'Mouse and touch',
          type: 'SourisSurObjet',
        }),
      ])
    );
  });

  it('can enumerate instructions being actions', () => {
    const instructions = enumerateInstructions(false);

    // Test for the proper presence of a few actions
    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Start (or reset) a scene timer',
          fullGroupName: 'Timers and time',
          type: 'ResetTimer',
        }),
        expect.objectContaining({
          displayedName: 'Rotate',
          fullGroupName: 'Common actions for all objects/Angle',
          type: 'Rotate',
        }),
      ])
    );
  });

  it('can create the tree of instructions', () => {
    const instructions = enumerateInstructions('number');
    expect(createTree(instructions)).toMatchObject({
      Advanced: {
        'Trigger once while true': {
          displayedName: 'Trigger once while true',
          fullGroupName: 'Advanced',
          type: 'BuiltinCommonInstructions::Once',
        },
      },
      Audio: {
        'Global volume': {
          displayedName: 'Global volume',
          fullGroupName: 'Audio',
          type: 'GlobalVolume',
        },
      },
    });
  });
});
