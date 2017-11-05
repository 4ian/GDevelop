import { enumerateExpressions, filterExpressions, createExpressionsTree } from './EnumerateExpressions';

describe('EnumerateObjects', () => {
  it('can enumerate and filter expressions', () => {
    const {
      freeExpressions,
      objectsExpressions,
    } = enumerateExpressions('number');

    // Should find atan, atan2, atanh math function
    expect(filterExpressions(freeExpressions, 'atan')).toHaveLength(3);

    // Should find abs math function
    expect(filterExpressions(freeExpressions, 'abs')).toHaveLength(1);

    expect(filterExpressions(freeExpressions, 'MouseX')).toHaveLength(1);
    expect(filterExpressions(freeExpressions, 'MouseY')).toHaveLength(1);

    expect(filterExpressions(objectsExpressions, 'PointX')).toHaveLength(1);
  });

  it('can create the tree of some instructions', () => {
    const {
      objectsExpressions,
    } = enumerateExpressions('number');
    expect(createExpressionsTree(objectsExpressions)).toMatchSnapshot();
  })
});
