// @flow

import {
  makeCustomObjectEditorTabName,
  parseCustomObjectEditorTabName,
  getObjectTypeFromCustomObjectEditorTabName,
} from './CustomObjectEditorTabName';

describe('CustomObjectEditorTabName', () => {
  describe('makeCustomObjectEditorTabName', () => {
    test('builds a name without a variant', () => {
      expect(
        makeCustomObjectEditorTabName({
          extensionName: 'MyExtension',
          objectName: 'MyObject',
        })
      ).toBe('MyExtension::MyObject');
    });

    test('omits an empty variant', () => {
      expect(
        makeCustomObjectEditorTabName({
          extensionName: 'MyExtension',
          objectName: 'MyObject',
          variantName: '',
        })
      ).toBe('MyExtension::MyObject');
    });

    test('appends a non-empty variant', () => {
      expect(
        makeCustomObjectEditorTabName({
          extensionName: 'MyExtension',
          objectName: 'MyObject',
          variantName: 'MyVariant',
        })
      ).toBe('MyExtension::MyObject::MyVariant');
    });
  });

  describe('parseCustomObjectEditorTabName', () => {
    test('parses extension and object', () => {
      expect(parseCustomObjectEditorTabName('MyExtension::MyObject')).toEqual({
        extensionName: 'MyExtension',
        objectName: 'MyObject',
        variantName: '',
      });
    });

    test('parses extension, object and variant', () => {
      expect(
        parseCustomObjectEditorTabName('MyExtension::MyObject::MyVariant')
      ).toEqual({
        extensionName: 'MyExtension',
        objectName: 'MyObject',
        variantName: 'MyVariant',
      });
    });

    test('defaults missing segments to empty strings', () => {
      expect(parseCustomObjectEditorTabName('')).toEqual({
        extensionName: '',
        objectName: '',
        variantName: '',
      });
      expect(parseCustomObjectEditorTabName('MyExtension')).toEqual({
        extensionName: 'MyExtension',
        objectName: '',
        variantName: '',
      });
    });
  });

  describe('getObjectTypeFromCustomObjectEditorTabName', () => {
    test('returns the object type, dropping any variant', () => {
      expect(
        getObjectTypeFromCustomObjectEditorTabName('MyExtension::MyObject')
      ).toBe('MyExtension::MyObject');
      expect(
        getObjectTypeFromCustomObjectEditorTabName(
          'MyExtension::MyObject::MyVariant'
        )
      ).toBe('MyExtension::MyObject');
    });
  });

  test('make and parse round-trip', () => {
    expect(
      parseCustomObjectEditorTabName(
        makeCustomObjectEditorTabName({
          extensionName: 'Ext',
          objectName: 'Obj',
          variantName: 'Var',
        })
      )
    ).toEqual({ extensionName: 'Ext', objectName: 'Obj', variantName: 'Var' });

    expect(
      parseCustomObjectEditorTabName(
        makeCustomObjectEditorTabName({
          extensionName: 'Ext',
          objectName: 'Obj',
        })
      )
    ).toEqual({ extensionName: 'Ext', objectName: 'Obj', variantName: '' });
  });
});
