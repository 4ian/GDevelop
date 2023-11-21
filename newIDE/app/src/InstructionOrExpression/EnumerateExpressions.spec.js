// @flow
import {
  enumerateFreeExpressions,
  filterExpressions,
  enumerateObjectExpressions,
  enumerateBehaviorExpressions,
  enumerateAllExpressions,
} from './EnumerateExpressions';
import { createTree, type TreeNode } from './CreateTree';
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { type EnumeratedExpressionMetadata } from './EnumeratedInstructionOrExpressionMetadata';
const gd: libGDevelop = global.gd;

// $FlowExpectedError
const makeFakeI18n = (fakeI18n): I18nType => ({
  ...fakeI18n,
  _: message => message.id,
});

describe('EnumerateExpressions', () => {
  it('can enumerate and filter free expressions (number only)', () => {
    const freeExpressions = enumerateFreeExpressions('number', makeFakeI18n());

    // Should find atan, atan2, atanh math function
    expect(filterExpressions(freeExpressions, 'atan')).toHaveLength(3);

    // Should find abs math function
    expect(filterExpressions(freeExpressions, 'abs')).toHaveLength(1);

    expect(filterExpressions(freeExpressions, 'CursorX')).toHaveLength(1);
    expect(filterExpressions(freeExpressions, 'CursorY')).toHaveLength(1);
  });

  it('can enumerate and filter free expressions', () => {
    const freeExpressions = enumerateFreeExpressions('string', makeFakeI18n());

    // Should find ToString and LargeNumberToString:
    expect(filterExpressions(freeExpressions, 'ToString')).toHaveLength(2);

    // Should find atan, atan2, atanh math function
    expect(filterExpressions(freeExpressions, 'atan')).toHaveLength(3);

    // Should find abs math function
    expect(filterExpressions(freeExpressions, 'abs')).toHaveLength(1);

    expect(filterExpressions(freeExpressions, 'CursorX')).toHaveLength(1);
    expect(filterExpressions(freeExpressions, 'CursorY')).toHaveLength(1);
  });

  it('can enumerate and filter object expressions (number only)', () => {
    const spriteObjectExpressions = enumerateObjectExpressions(
      'number',
      'Sprite'
    );
    expect(filterExpressions(spriteObjectExpressions, 'PointX')).toHaveLength(
      1
    );

    const objectExpressions = enumerateObjectExpressions('number', '');
    expect(filterExpressions(objectExpressions, 'PointX')).toHaveLength(0);
    expect(filterExpressions(objectExpressions, 'X')).toContainEqual(
      expect.objectContaining({
        type: 'X',
      })
    );
  });

  it('can enumerate object expressions', () => {
    const spriteObjectExpressions = enumerateObjectExpressions(
      'string',
      'Sprite'
    );
    expect(filterExpressions(spriteObjectExpressions, 'PointX')).toHaveLength(
      1
    );
    expect(filterExpressions(spriteObjectExpressions, 'Layer')).toHaveLength(1);
    expect(
      filterExpressions(spriteObjectExpressions, 'AnimationFrameCount')
    ).toHaveLength(1);

    const objectExpressions = enumerateObjectExpressions('string', '');
    expect(filterExpressions(objectExpressions, 'PointX')).toHaveLength(0);
    expect(filterExpressions(objectExpressions, 'Layer')).toHaveLength(1);
    expect(filterExpressions(objectExpressions, 'X')).toContainEqual(
      expect.objectContaining({
        type: 'X',
      })
    );
  });

  it('can enumerate and filter behavior expressions (number only)', () => {
    const platformerObjectBehaviorExpressions = enumerateBehaviorExpressions(
      'number',
      'PlatformBehavior::PlatformerObjectBehavior'
    );

    const jumpSpeedExpressions = filterExpressions(
      platformerObjectBehaviorExpressions,
      'JumpSpeed'
    );

    expect(jumpSpeedExpressions).toHaveLength(2);
    expect(jumpSpeedExpressions).toContainEqual(
      expect.objectContaining({
        type: 'JumpSpeed',
      })
    );
    expect(jumpSpeedExpressions).toContainEqual(
      expect.objectContaining({
        type: 'CurrentJumpSpeed',
      })
    );
  });

  it('can enumerate behavior expressions', () => {
    makeTestExtensions(gd);
    const fakeBehaviorExpressions = enumerateBehaviorExpressions(
      'string',
      'FakeBehavior::FakeBehavior'
    );

    expect(fakeBehaviorExpressions).toHaveLength(2);
    expect(fakeBehaviorExpressions).toContainEqual(
      expect.objectContaining({
        type: 'SomethingReturningNumberWith1NumberParam',
      })
    );
    expect(fakeBehaviorExpressions).toContainEqual(
      expect.objectContaining({
        type: 'SomethingReturningStringWith1NumberParam',
      })
    );
  });

  it('can create the tree of some object expressions', () => {
    const objectsExpressions = enumerateObjectExpressions('number', '');
    expect(createTree(objectsExpressions)).toMatchObject({
      Angle: {
        Angle: {
          displayedName: 'Angle',
          fullGroupName: 'Angle',
          name: 'Angle',
          type: 'Angle',
        },
      },
      'Movement using forces': {
        ForceX: {
          displayedName: 'X coordinate of the sum of forces',
          fullGroupName: 'Movement using forces',
          name: 'ForceX',
          type: 'ForceX',
        },
      },
    });
  });

  it('can enumerate all expressions (number only)', () => {
    makeTestExtensions(gd);
    const allNumberExpressions: Array<EnumeratedExpressionMetadata> = enumerateAllExpressions(
      'number',
      makeFakeI18n()
    );
    // Check a free expression:
    expect(allNumberExpressions).toContainEqual(
      expect.objectContaining({
        type: 'ToNumber',
      })
    );
    // Check a behavior expression:
    expect(allNumberExpressions).toContainEqual(
      expect.objectContaining({
        type: 'SomethingReturningNumberWith1NumberParam',
      })
    );

    // Sanity check string expressions are not there:
    expect(filterExpressions(allNumberExpressions, 'ToString')).toHaveLength(0);
    expect(
      filterExpressions(
        allNumberExpressions,
        'SomethingReturningStringWith1NumberParam'
      )
    ).toHaveLength(0);
  });

  it('can enumerate all expressions', () => {
    makeTestExtensions(gd);
    const allExpressions: Array<EnumeratedExpressionMetadata> = enumerateAllExpressions(
      'string',
      makeFakeI18n()
    );
    // Check a free expression:
    expect(allExpressions).toContainEqual(
      expect.objectContaining({
        type: 'ToNumber',
      })
    );
    expect(allExpressions).toContainEqual(
      expect.objectContaining({
        type: 'ToString',
      })
    );
    // Check a behavior expression:
    expect(allExpressions).toContainEqual(
      expect.objectContaining({
        type: 'SomethingReturningStringWith1NumberParam',
      })
    );
    expect(allExpressions).toContainEqual(
      expect.objectContaining({
        type: 'SomethingReturningNumberWith1NumberParam',
      })
    );
  });

  it('can create the tree of all expressions', () => {
    const allExpressions: Array<EnumeratedExpressionMetadata> = enumerateAllExpressions(
      'number',
      makeFakeI18n()
    );
    const allExpressionsTree = createTree(allExpressions);

    // Check that some free expressions are there
    expect(allExpressionsTree).toHaveProperty('General');
    const generalTreeNode: TreeNode<EnumeratedExpressionMetadata> =
      // $FlowFixMe
      allExpressionsTree['General'];
    expect(generalTreeNode).toMatchObject({
      'Timers and time': {
        Time: {
          displayedName: 'Current time',
          fullGroupName: 'General/Timers and time',
          iconFilename: 'res/actions/time.png',
          isPrivate: false,
          name: 'Time',
          scope: {
            objectMetadata: undefined,
            behaviorMetadata: undefined,
          },
          type: 'Time',
        },
      },
    });

    // Check that some base object expressions are there
    expect(generalTreeNode).toHaveProperty('Objects');
    expect(
      // $FlowFixMe
      generalTreeNode['Objects']
    ).toMatchObject({
      Angle: {
        Angle: {
          displayedName: 'Angle',
          fullGroupName: 'General/Objects/Angle',
          iconFilename: 'res/actions/direction_black.png',
          isPrivate: false,
          name: 'Angle',
          scope: {
            objectMetadata: expect.anything(),
          },
          type: 'Angle',
        },
      },
    });

    // Check that some Sprite object expressions are there
    expect(generalTreeNode).toHaveProperty('Sprite');
    // $FlowFixMe
    expect(generalTreeNode['Sprite']).toMatchObject({
      Position: {
        PointX: {
          displayedName: 'X position of a point',
          fullGroupName: 'General/Sprite/Position',
          iconFilename: 'res/actions/position_black.png',
          isPrivate: false,
          name: 'PointX',
          scope: {
            objectMetadata: expect.anything(),
          },
          type: 'PointX',
        },
      },
    });

    // Check that some behavior expressions are there
    const movementTreeNode: TreeNode<EnumeratedExpressionMetadata> =
      // $FlowFixMe
      allExpressionsTree['Movement'];
    expect(movementTreeNode).toHaveProperty('Platform behavior');
    // $FlowFixMe
    expect(movementTreeNode['Platform behavior']).toMatchObject({
      'Platformer configuration': {
        MaxSpeed: {
          displayedName: 'Maximum horizontal speed',
          fullGroupName: 'Movement/Platform behavior/Platformer configuration',
          iconFilename: 'CppPlatform/Extensions/platformerobjecticon.png',
          isPrivate: false,
          name: 'MaxSpeed',
          scope: {
            behaviorMetadata: expect.anything(),
          },
          type: 'MaxSpeed',
        },
      },
    });
  });
});
