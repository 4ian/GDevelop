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

describe('EnumerateExpressions', () => {
  it('can enumerate and filter free expressions', () => {
    const freeExpressions = enumerateFreeExpressions();

    // Should find ToString and LargeNumberToString:
    expect(filterExpressions(freeExpressions, 'ToString')).toHaveLength(2);

    // Should find atan, atan2, atanh math function
    expect(filterExpressions(freeExpressions, 'atan')).toHaveLength(3);

    // Should find abs math function
    expect(filterExpressions(freeExpressions, 'abs')).toHaveLength(1);

    expect(filterExpressions(freeExpressions, 'MouseX')).toHaveLength(1);
    expect(filterExpressions(freeExpressions, 'MouseY')).toHaveLength(1);
  });

  it('can enumerate object expressions', () => {
    const spriteObjectExpressions = enumerateObjectExpressions('Sprite');
    expect(filterExpressions(spriteObjectExpressions, 'PointX')).toHaveLength(
      1
    );
    expect(
      filterExpressions(spriteObjectExpressions, 'AnimationName')
    ).toHaveLength(1);

    const objectExpressions = enumerateObjectExpressions('');
    expect(filterExpressions(objectExpressions, 'PointX')).toHaveLength(0);
    expect(filterExpressions(objectExpressions, 'Layer')).toHaveLength(1);
    expect(filterExpressions(objectExpressions, 'X')).toContainEqual(
      expect.objectContaining({
        type: 'X',
      })
    );
  });

  it('can enumerate behavior expressions', () => {
    makeTestExtensions(gd);
    const fakeBehaviorExpressions = enumerateBehaviorExpressions(
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
    const objectsExpressions = enumerateObjectExpressions('');
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
        'X coordinate of the sum of forces': {
          displayedName: 'X coordinate of the sum of forces',
          fullGroupName: 'Movement using forces',
          name: 'ForceX',
          type: 'ForceX',
        },
      },
    });
  });

  it('can enumerate all expressions', () => {
    makeTestExtensions(gd);
    const allExpressions: Array<EnumeratedExpressionMetadata> = enumerateAllExpressions();
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
    const allExpressions: Array<EnumeratedExpressionMetadata> = enumerateAllExpressions();
    const allExpressionsTree = createTree(allExpressions);

    // Check that some free expressions are there
    expect(allExpressionsTree).toHaveProperty('General');
    const generalTreeNode: TreeNode<EnumeratedExpressionMetadata> =
      // $FlowFixMe
      allExpressionsTree['General'];
    expect(generalTreeNode).toMatchObject({
      'Timers and time': {
        'Current time': {
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
          iconFilename: 'res/actions/direction.png',
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
        'X position of a point': {
          displayedName: 'X position of a point',
          fullGroupName: 'General/Sprite/Position',
          iconFilename: 'res/actions/position.png',
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
    expect(generalTreeNode).toHaveProperty('Platform behavior');
    // $FlowFixMe
    expect(generalTreeNode['Platform behavior']).toMatchObject({
      Options: {
        'Maximum horizontal speed': {
          displayedName: 'Maximum horizontal speed',
          fullGroupName: 'General/Platform behavior/Options',
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
