// @flow
import { filterSearchItems } from './UseSearchItem';

describe('UseSearchItem', () => {
  test('sanitizeObjectName', () => {
    const performanceApiMock = { now: jest.fn(() => Date.now()) };
    global.performance = performanceApiMock;

    expect(filterSearchItems(null, null, new Set())).toEqual(null);
    expect(
      filterSearchItems(
        [{ id: 1, tags: ['hello'] }, { id: 2, tags: ['world'] }],
        null,
        new Set()
      )
    ).toEqual([{ id: 1, tags: ['hello'] }, { id: 2, tags: ['world'] }]);
    expect(
      filterSearchItems(
        [{ id: 1, tags: ['hello'] }, { id: 2, tags: ['world'] }],
        null,
        new Set(['world'])
      )
    ).toEqual([{ id: 2, tags: ['world'] }]);
  });
});
