// @flow
import {
  enumerateFreeExpressions,
  filterExpressions,
  enumerateObjectExpressions,
  enumerateBehaviorExpressions,
  enumerateAllExpressions,
} from './EnumerateExpressions';
import { createTree } from './CreateTree';
import { type EnumeratedExpressionMetadata } from './EnumeratedInstructionOrExpressionMetadata.js';

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

  it('can enumerate and filter behavior expressions', () => {
    const platformerObjectBehaviorExpressions = enumerateBehaviorExpressions(
      'number',
      'PlatformBehavior::PlatformerObjectBehavior'
    );

    expect(
      filterExpressions(platformerObjectBehaviorExpressions, 'JumpSpeed')
    ).toHaveLength(1);
    expect(
      filterExpressions(platformerObjectBehaviorExpressions, 'JumpSpeed')
    ).toContainEqual(
      expect.objectContaining({
        type: 'JumpSpeed',
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
      Movement: {
        'Average X coordinates of forces': {
          displayedName: 'Average X coordinates of forces',
          fullGroupName: 'Movement',
          name: 'ForceX',
          type: 'ForceX',
        },
      },
    });
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
        'Maximum speed': {
          displayedName: 'Maximum speed',
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
