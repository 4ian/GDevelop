// @flow
import {
  enumerateFreeExpressions,
  filterExpressions,
  enumerateObjectExpressions,
  enumerateBehaviorExpressions,
  enumerateAllExpressions,
} from './EnumerateExpressions';
import { createTree } from './CreateTree';
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { type EnumeratedExpressionMetadata } from './EnumeratedInstructionOrExpressionMetadata.js';
const gd: libGDevelop = global.gd;

describe('EnumerateExpressions', () => {
  it('can enumerate and filter free expressions', () => {
    const freeExpressions = enumerateFreeExpressions('number');

    // Should find atan, atan2, atanh math function
    expect(filterExpressions(freeExpressions, 'atan')).toHaveLength(3);

    // Should find abs math function
    expect(filterExpressions(freeExpressions, 'abs')).toHaveLength(1);

    expect(filterExpressions(freeExpressions, 'MouseX')).toHaveLength(1);
    expect(filterExpressions(freeExpressions, 'MouseY')).toHaveLength(1);
  });
  it('can enumerate and filter free expressions (type "number|string")', () => {
    const freeExpressions = enumerateFreeExpressions('number|string');

    // Should find ToString and LargeNumberToString:
    expect(filterExpressions(freeExpressions, 'ToString')).toHaveLength(2);

    // Should find atan, atan2, atanh math function
    expect(filterExpressions(freeExpressions, 'atan')).toHaveLength(3);

    // Should find abs math function
    expect(filterExpressions(freeExpressions, 'abs')).toHaveLength(1);

    expect(filterExpressions(freeExpressions, 'MouseX')).toHaveLength(1);
    expect(filterExpressions(freeExpressions, 'MouseY')).toHaveLength(1);
  });

  it('can enumerate and filter object expressions', () => {
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

  it('can enumerate and filter object expressions (type "number|string")', () => {
    const spriteObjectExpressions = enumerateObjectExpressions(
      'number|string',
      'Sprite'
    );
    expect(filterExpressions(spriteObjectExpressions, 'PointX')).toHaveLength(
      1
    );
    expect(
      filterExpressions(spriteObjectExpressions, 'AnimationName')
    ).toHaveLength(1);

    const objectExpressions = enumerateObjectExpressions('number|string', '');
    expect(filterExpressions(objectExpressions, 'PointX')).toHaveLength(0);
    expect(filterExpressions(objectExpressions, 'Layer')).toHaveLength(1);
    expect(filterExpressions(objectExpressions, 'X')).toContainEqual(
      expect.objectContaining({
        type: 'X',
      })
    );
  });

  it('can enumerate and filter behavior expressions', () => {
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
  it('can enumerate and filter behavior expressions (type "number|string")', () => {
    makeTestExtensions(gd);
    const fakeBehaviorExpressions = enumerateBehaviorExpressions(
      'number|string',
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
        'X coordinate of the sum of forces': {
          displayedName: 'X coordinate of the sum of forces',
          fullGroupName: 'Movement using forces',
          name: 'ForceX',
          type: 'ForceX',
        },
      },
    });
  });

  it('can enumerate all expressions (type "number")', () => {
    makeTestExtensions(gd);
    const allNumberExpressions: Array<EnumeratedExpressionMetadata> = enumerateAllExpressions(
      'number'
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

  it('can enumerate all expressions (type "string")', () => {
    makeTestExtensions(gd);
    const allStringExpressions: Array<EnumeratedExpressionMetadata> = enumerateAllExpressions(
      'string'
    );
    // Check a free expression:
    expect(allStringExpressions).toContainEqual(
      expect.objectContaining({
        type: 'ToString',
      })
    );
    // Check a behavior expression:
    expect(allStringExpressions).toContainEqual(
      expect.objectContaining({
        type: 'SomethingReturningStringWith1NumberParam',
      })
    );

    // Sanity check number expressions are not there:
    expect(filterExpressions(allStringExpressions, 'ToNumber')).toHaveLength(0);
    expect(
      filterExpressions(
        allStringExpressions,
        'SomethingReturningNumberWith1NumberParam'
      )
    ).toHaveLength(0);
  });

  it('can enumerate all expressions (type "number|string")', () => {
    makeTestExtensions(gd);
    const allExpressions: Array<EnumeratedExpressionMetadata> = enumerateAllExpressions(
      'number|string'
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
      'number'
    );
    const allExpressionsTree = createTree(allExpressions);

    // Check that some free expressions are there
    expect(allExpressionsTree).toMatchObject({
      Time: {
        'Current time': {
          displayedName: 'Current time',
          fullGroupName: 'Time',
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
    expect(allExpressionsTree).toHaveProperty(
      'Common expressions for all objects'
    );
    expect(
      // $FlowFixMe
      allExpressionsTree['Common expressions for all objects']
    ).toMatchObject({
      Angle: {
        Angle: {
          displayedName: 'Angle',
          fullGroupName: 'Common expressions for all objects/Angle',
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
    expect(allExpressionsTree).toHaveProperty('Sprite');
    // $FlowFixMe
    expect(allExpressionsTree['Sprite']).toMatchObject({
      Position: {
        'X position of a point': {
          displayedName: 'X position of a point',
          fullGroupName: 'Sprite/Position',
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
    expect(allExpressionsTree).toHaveProperty('Platform Behavior');
    // $FlowFixMe
    expect(allExpressionsTree['Platform Behavior']).toMatchObject({
      Options: {
        'Maximum horizontal speed': {
          displayedName: 'Maximum horizontal speed',
          fullGroupName: 'Platform Behavior/Options',
          iconFilename: 'CppPlatform/Extensions/platformerobjecticon16.png',
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
