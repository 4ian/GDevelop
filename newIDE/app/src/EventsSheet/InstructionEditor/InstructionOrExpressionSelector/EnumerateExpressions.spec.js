import {
  enumerateExpressions,
  filterExpressions,
} from './EnumerateExpressions';
import { createTree } from './CreateTree';
import isObject from 'lodash/isObject';

describe('EnumerateObjects', () => {
  it('can enumerate and filter expressions', () => {
    const { freeExpressions, objectsExpressions } = enumerateExpressions(
      'number'
    );

    // Should find atan, atan2, atanh math function
    expect(filterExpressions(freeExpressions, 'atan')).toHaveLength(3);

    // Should find abs math function
    expect(filterExpressions(freeExpressions, 'abs')).toHaveLength(1);

    expect(filterExpressions(freeExpressions, 'MouseX')).toHaveLength(1);
    expect(filterExpressions(freeExpressions, 'MouseY')).toHaveLength(1);

    expect(filterExpressions(objectsExpressions, 'PointX')).toHaveLength(1);
  });

  it('can create the tree of some instructions', () => {
    const stripMetadata = obj => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (
            key === 'objectMetadata' ||
            key === 'behaviorMetadata' ||
            key === 'metadata' ||
            key === 'parameters'
          ) {
            delete obj[key];
          } else if (isObject(obj[key])) {
            stripMetadata(obj[key]);
          }
        }
      }
      return obj;
    };

    const { objectsExpressions } = enumerateExpressions('number');
    expect(stripMetadata(createTree(objectsExpressions))).toMatchSnapshot();
  });
});
