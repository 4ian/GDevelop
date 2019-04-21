// @flow
import {
  splitPaths,
  getNameFromProperty,
  getSlugifiedUniqueNameFromProperty,
  split,
  unsplit,
} from './ObjectSplitter';

describe('split', () => {
  it('can split an object', () => {
    const object1 = {
      a: { name: 'NameOfA', aa: '1', ab: '2' },
      b: { name: 'NameOfB', ba: '3', bb: '4' },
    };
    const partialObjects1 = split(object1, {
      pathSeparator: '/',
      getArrayItemReferenceName: getNameFromProperty('name'),
      shouldSplit: splitPaths(new Set(['/a'])),
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
    });
    expect(object1).toEqual({
      a: { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/a' },
      b: { name: 'NameOfB', ba: '3', bb: '4' },
    });
    expect(partialObjects1).toEqual([
      {
        reference: '/a',
        object: { name: 'NameOfA', aa: '1', ab: '2' },
      },
    ]);

    const object2 = {
      a: { name: 'NameOfA', aa: '1', ab: '2' },
      b: { name: 'NameOfB', ba: '3', bb: '4' },
    };
    const partialObjects2 = split(object2, {
      pathSeparator: '/',
      getArrayItemReferenceName: getNameFromProperty('name'),
      shouldSplit: splitPaths(new Set(['/a', '/b'])),
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
    });
    expect(object2).toEqual({
      a: { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/a' },
      b: { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/b' },
    });
    expect(partialObjects2).toEqual([
      {
        reference: '/a',
        object: { name: 'NameOfA', aa: '1', ab: '2' },
      },
      {
        reference: '/b',
        object: { name: 'NameOfB', ba: '3', bb: '4' },
      },
    ]);
  });

  it('can split arrays', () => {
    const object1 = {
      myArray: [
        { name: 'A', aa: '1', ab: '2' },
        { name: 'B', ba: '3', bb: '4' },
      ],
    };
    const partialObjects1 = split(object1, {
      pathSeparator: '/',
      getArrayItemReferenceName: getNameFromProperty('name'),
      shouldSplit: splitPaths(new Set(['/myArray/*'])),
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
    });
    expect(object1).toEqual({
      myArray: [
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/A' },
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/B' },
      ],
    });
    expect(partialObjects1).toEqual([
      {
        reference: '/myArray/A',
        object: { name: 'A', aa: '1', ab: '2' },
      },
      {
        reference: '/myArray/B',
        object: { name: 'B', ba: '3', bb: '4' },
      },
    ]);
  });

  it('can split objects inside arrays', () => {
    const object1 = {
      myArray: [
        { name: 'A', aa: '1', ab: '2', innerObject: { hello: 'world' } },
        { name: 'B', ba: '3', bb: '4', innerObject: { hello: 'world2' } },
      ],
    };
    const partialObjects1 = split(object1, {
      pathSeparator: '/',
      getArrayItemReferenceName: getNameFromProperty('name'),
      shouldSplit: splitPaths(
        new Set(['/myArray/*', '/myArray/*/innerObject'])
      ),
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
    });
    expect(object1).toEqual({
      myArray: [
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/A' },
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/B' },
      ],
    });
    expect(partialObjects1).toEqual([
      {
        reference: '/myArray/A',
        object: {
          name: 'A',
          aa: '1',
          ab: '2',
          innerObject: {
            __REFERENCE_TO_SPLIT_OBJECT: true,
            referenceTo: '/myArray/A/innerObject',
          },
        },
      },
      {
        reference: '/myArray/A/innerObject',
        object: { hello: 'world' },
      },
      {
        reference: '/myArray/B',
        object: {
          name: 'B',
          ba: '3',
          bb: '4',
          innerObject: {
            __REFERENCE_TO_SPLIT_OBJECT: true,
            referenceTo: '/myArray/B/innerObject',
          },
        },
      },
      {
        reference: '/myArray/B/innerObject',
        object: { hello: 'world2' },
      },
    ]);
  });

  it('can split objects inside arrays and create unique reference names', () => {
    const object1 = {
      myArray: [
        {
          name: ' Hello/\\à ',
          aa: '1',
          ab: '2',
          innerObject: { hello: 'world' },
        },
        { name: 'B', ba: '3', bb: '4', innerObject: { hello: 'world2' } },
        {
          name: ' Hello/\\à ',
          aa: '5',
          ab: '6',
          innerObject: { hello: 'world3' },
        },
      ],
    };
    const partialObjects1 = split(object1, {
      pathSeparator: '/',
      getArrayItemReferenceName: getSlugifiedUniqueNameFromProperty('name'),
      shouldSplit: splitPaths(
        new Set(['/myArray/*', '/myArray/*/innerObject'])
      ),
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
    });
    expect(object1).toEqual({
      myArray: [
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/hello' },
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/b' },
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/hello2' },
      ],
    });
    expect(partialObjects1).toEqual([
      {
        reference: '/myArray/hello',
        object: {
          name: ' Hello/\\à ',
          aa: '1',
          ab: '2',
          innerObject: {
            __REFERENCE_TO_SPLIT_OBJECT: true,
            referenceTo: '/myArray/hello/innerObject',
          },
        },
      },
      {
        reference: '/myArray/hello/innerObject',
        object: { hello: 'world' },
      },
      {
        reference: '/myArray/b',
        object: {
          name: 'B',
          ba: '3',
          bb: '4',
          innerObject: {
            __REFERENCE_TO_SPLIT_OBJECT: true,
            referenceTo: '/myArray/b/innerObject',
          },
        },
      },
      {
        reference: '/myArray/b/innerObject',
        object: { hello: 'world2' },
      },
      {
        reference: '/myArray/hello2',
        object: {
          name: ' Hello/\\à ',
          aa: '5',
          ab: '6',
          innerObject: {
            __REFERENCE_TO_SPLIT_OBJECT: true,
            referenceTo: '/myArray/hello2/innerObject',
          },
        },
      },
      {
        reference: '/myArray/hello2/innerObject',
        object: { hello: 'world3' },
      },
    ]);
  });
});

describe('unsplit', () => {
  it('can unsplit objects inside arrays', () => {
    const originalObject = {
      myArray: [
        { name: 'A', aa: '1', ab: '2', innerObject: { hello: 'world' } },
        { name: 'B', ba: '3', bb: '4', innerObject: { hello: 'world2' } },
      ],
    };
    const splitObject = {
      myArray: [
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/A' },
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/B' },
      ],
    };
    const partialObjects = [
      {
        reference: '/myArray/A',
        object: {
          name: 'A',
          aa: '1',
          ab: '2',
          innerObject: {
            __REFERENCE_TO_SPLIT_OBJECT: true,
            referenceTo: '/myArray/A/innerObject',
          },
        },
      },
      {
        reference: '/myArray/A/innerObject',
        object: { hello: 'world' },
      },
      {
        reference: '/myArray/B',
        object: {
          name: 'B',
          ba: '3',
          bb: '4',
          innerObject: {
            __REFERENCE_TO_SPLIT_OBJECT: true,
            referenceTo: '/myArray/B/innerObject',
          },
        },
      },
      {
        reference: '/myArray/B/innerObject',
        object: { hello: 'world2' },
      },
    ];

    expect.assertions(1);
    return unsplit(splitObject, {
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
      getReferencePartialObject: getReferencePartialObjectInArray(
        partialObjects
      ),
    }).then(() => {
      expect(splitObject).toEqual(originalObject);
    });
  });

  it('can unsplit with a maximum depth', () => {
    const originalObject = {
      myArray: [
        { name: 'A', aa: '1', ab: '2', innerObject: { hello: 'world' } },
        { name: 'B', ba: '3', bb: '4', innerObject: { hello: 'world2' } },
      ],
    };
    const splitObject = {
      myArray: [
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/A' },
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/B' },
      ],
    };
    const partialObjects = [
      {
        reference: '/myArray/A',
        object: {
          name: 'A',
          aa: '1',
          ab: '2',
          innerObject: {
            __REFERENCE_TO_SPLIT_OBJECT: true,
            referenceTo: '/myArray/A/innerObject',
          },
        },
      },
      {
        reference: '/myArray/A/innerObject',
        object: { hello: 'world' },
      },
      {
        reference: '/myArray/B',
        object: {
          name: 'B',
          ba: '3',
          bb: '4',
          innerObject: {
            __REFERENCE_TO_SPLIT_OBJECT: true,
            referenceTo: '/myArray/B/innerObject',
          },
        },
      },
      {
        reference: '/myArray/B/innerObject',
        object: { hello: 'world2' },
      },
    ];

    expect.assertions(1);
    return unsplit(splitObject, {
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
      getReferencePartialObject: getReferencePartialObjectInArray(
        partialObjects
      ),
      maxUnsplitDepth: 2,
    }).then(() => {
      expect(splitObject).toEqual({
        myArray: [
          {
            name: 'A',
            aa: '1',
            ab: '2',
            innerObject: {
              // Maximum depth has stopped processing on this object
              __REFERENCE_TO_SPLIT_OBJECT: true,
              referenceTo: '/myArray/A/innerObject',
            },
          },
          {
            name: 'B',
            ba: '3',
            bb: '4',
            innerObject: {
              // Maximum depth has stopped processing on this object
              __REFERENCE_TO_SPLIT_OBJECT: true,
              referenceTo: '/myArray/B/innerObject',
            },
          },
        ],
      });
    });
  });

  it('can report error while unsplitting', () => {
    const splitObject = {
      myArray: [
        { __REFERENCE_TO_SPLIT_OBJECT: true, referenceTo: '/myArray/A' },
        {
          __REFERENCE_TO_SPLIT_OBJECT: true,
          referenceTo: '/myArray/Idonotexist',
        },
      ],
    };
    const partialObjects = [
      {
        reference: '/myArray/A',
        object: {
          name: 'A',
          aa: '1',
          ab: '2',
          innerObject: {
            __REFERENCE_TO_SPLIT_OBJECT: true,
            referenceTo: '/myArray/A/innerObject',
          },
        },
      },
      {
        reference: '/myArray/A/innerObject',
        object: { hello: 'world' },
      },
    ];

    expect.assertions(1);
    return unsplit(splitObject, {
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
      getReferencePartialObject: getReferencePartialObjectInArray(
        partialObjects
      ),
    }).catch(error => {
      expect(error).toEqual(new Error("Can't find /myArray/Idonotexist"));
    });
  });

  // Helper that "load" references from a list of partial objects returned by split.
  const getReferencePartialObjectInArray = partialObjects => {
    return referencePath => {
      const partialObject = partialObjects.find(
        partialObject => partialObject.reference === referencePath
      );
      if (partialObject === undefined) {
        return Promise.reject(new Error("Can't find " + referencePath));
      }

      return Promise.resolve(partialObject.object);
    };
  };

  // Helper to create an "integration" test, testing both splitting and unsplitting.
  const testSplitThenUnsplit = (object, shouldSplit) => {
    const originalObjectJSON = JSON.stringify(object);
    const partialObjects = split(object, {
      pathSeparator: '/',
      getArrayItemReferenceName: getSlugifiedUniqueNameFromProperty('name'),
      shouldSplit,
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
    });

    expect.assertions(1);
    return unsplit(object, {
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
      getReferencePartialObject: getReferencePartialObjectInArray(
        partialObjects
      ),
    }).then(() => {
      const finalObjectJSON = JSON.stringify(object);
      expect(finalObjectJSON).toEqual(originalObjectJSON);
    });
  };

  it('can split then unsplit an object (1)', () => {
    return testSplitThenUnsplit(
      { a: 123, b: 456 },
      splitPaths(new Set(['/a', '/b']))
    );
  });

  it('can split then unsplit an object (2)', () => {
    return testSplitThenUnsplit(
      { a: { c: 123 }, b: 456 },
      splitPaths(new Set(['/a', '/a/c', '/b']))
    );
  });
  it('can split then unsplit an object (no split actually)', () => {
    return testSplitThenUnsplit(
      { a: { c: 123 }, b: 456 },
      splitPaths(new Set([]))
    );
  });
  it('can split then unsplit an object (no split actually) (2)', () => {
    return testSplitThenUnsplit(
      { a: { c: 123 }, b: 456 },
      splitPaths(new Set(['', '123', '/', 'ewfkwoe']))
    );
  });
  it('can split then unsplit an object (array with objects with same name)', () => {
    return testSplitThenUnsplit(
      {
        a: [
          { name: 'Object', c: 1 },
          { name: 'Object', c: 2 },
          { name: 'Object', c: 3 },
        ],
        b: 456,
      },
      splitPaths(new Set([]))
    );
  });
});
