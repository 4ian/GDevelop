// @flow
import {
  getRenamedLayoutTabProjectItemName,
  getRenamedExternalLayoutTabProjectItemName,
  getRenamedExternalEventsTabProjectItemName,
  getRenamedExtensionTabProjectItemName,
  getRenamedEventsBasedObjectTabProjectItemName,
} from './EditorTabsRenaming';

describe('EditorTabsRenaming', () => {
  describe('getRenamedLayoutTabProjectItemName', () => {
    test('renames the scene and its events tab', () => {
      expect(
        getRenamedLayoutTabProjectItemName(
          { kind: 'layout', projectItemName: 'Scene' },
          'Scene',
          'NewScene'
        )
      ).toBe('NewScene');
      expect(
        getRenamedLayoutTabProjectItemName(
          { kind: 'layout events', projectItemName: 'Scene' },
          'Scene',
          'NewScene'
        )
      ).toBe('NewScene');
    });

    test('leaves other scenes and other kinds untouched', () => {
      expect(
        getRenamedLayoutTabProjectItemName(
          { kind: 'layout', projectItemName: 'OtherScene' },
          'Scene',
          'NewScene'
        )
      ).toBe(null);
      expect(
        getRenamedLayoutTabProjectItemName(
          { kind: 'external layout', projectItemName: 'Scene' },
          'Scene',
          'NewScene'
        )
      ).toBe(null);
    });
  });

  describe('getRenamedExternalLayoutTabProjectItemName', () => {
    test('renames the matching external layout only', () => {
      expect(
        getRenamedExternalLayoutTabProjectItemName(
          { kind: 'external layout', projectItemName: 'Ext' },
          'Ext',
          'NewExt'
        )
      ).toBe('NewExt');
      expect(
        getRenamedExternalLayoutTabProjectItemName(
          { kind: 'external layout', projectItemName: 'Other' },
          'Ext',
          'NewExt'
        )
      ).toBe(null);
      expect(
        getRenamedExternalLayoutTabProjectItemName(
          { kind: 'layout', projectItemName: 'Ext' },
          'Ext',
          'NewExt'
        )
      ).toBe(null);
    });
  });

  describe('getRenamedExternalEventsTabProjectItemName', () => {
    test('renames the matching external events only', () => {
      expect(
        getRenamedExternalEventsTabProjectItemName(
          { kind: 'external events', projectItemName: 'Evt' },
          'Evt',
          'NewEvt'
        )
      ).toBe('NewEvt');
      expect(
        getRenamedExternalEventsTabProjectItemName(
          { kind: 'external events', projectItemName: 'Other' },
          'Evt',
          'NewEvt'
        )
      ).toBe(null);
      expect(
        getRenamedExternalEventsTabProjectItemName(
          { kind: 'layout', projectItemName: 'Evt' },
          'Evt',
          'NewEvt'
        )
      ).toBe(null);
    });
  });

  describe('getRenamedExtensionTabProjectItemName', () => {
    test('renames the extension tab', () => {
      expect(
        getRenamedExtensionTabProjectItemName(
          { kind: 'events functions extension', projectItemName: 'MyExt' },
          'MyExt',
          'NewExt'
        )
      ).toBe('NewExt');
    });

    test('swaps the extension segment of custom-object tabs, keeping object and variant', () => {
      expect(
        getRenamedExtensionTabProjectItemName(
          { kind: 'custom object', projectItemName: 'MyExt::MyObject' },
          'MyExt',
          'NewExt'
        )
      ).toBe('NewExt::MyObject');
      expect(
        getRenamedExtensionTabProjectItemName(
          {
            kind: 'custom object',
            projectItemName: 'MyExt::MyObject::MyVariant',
          },
          'MyExt',
          'NewExt'
        )
      ).toBe('NewExt::MyObject::MyVariant');
    });

    test('leaves other extensions, other kinds and empty names untouched', () => {
      expect(
        getRenamedExtensionTabProjectItemName(
          { kind: 'events functions extension', projectItemName: 'OtherExt' },
          'MyExt',
          'NewExt'
        )
      ).toBe(null);
      expect(
        getRenamedExtensionTabProjectItemName(
          { kind: 'custom object', projectItemName: 'OtherExt::MyObject' },
          'MyExt',
          'NewExt'
        )
      ).toBe(null);
      expect(
        getRenamedExtensionTabProjectItemName(
          { kind: 'layout', projectItemName: 'MyExt' },
          'MyExt',
          'NewExt'
        )
      ).toBe(null);
      expect(
        getRenamedExtensionTabProjectItemName(
          { kind: 'custom object', projectItemName: null },
          'MyExt',
          'NewExt'
        )
      ).toBe(null);
    });
  });

  describe('getRenamedEventsBasedObjectTabProjectItemName', () => {
    test('swaps the object segment, keeping any variant', () => {
      expect(
        getRenamedEventsBasedObjectTabProjectItemName(
          { kind: 'custom object', projectItemName: 'MyExt::MyObject' },
          'MyExt',
          'MyObject',
          'NewObject'
        )
      ).toBe('MyExt::NewObject');
      expect(
        getRenamedEventsBasedObjectTabProjectItemName(
          {
            kind: 'custom object',
            projectItemName: 'MyExt::MyObject::MyVariant',
          },
          'MyExt',
          'MyObject',
          'NewObject'
        )
      ).toBe('MyExt::NewObject::MyVariant');
    });

    test('only matches the right extension + object and custom-object kind', () => {
      expect(
        getRenamedEventsBasedObjectTabProjectItemName(
          { kind: 'custom object', projectItemName: 'MyExt::OtherObject' },
          'MyExt',
          'MyObject',
          'NewObject'
        )
      ).toBe(null);
      expect(
        getRenamedEventsBasedObjectTabProjectItemName(
          { kind: 'custom object', projectItemName: 'OtherExt::MyObject' },
          'MyExt',
          'MyObject',
          'NewObject'
        )
      ).toBe(null);
      expect(
        getRenamedEventsBasedObjectTabProjectItemName(
          { kind: 'layout', projectItemName: 'MyExt::MyObject' },
          'MyExt',
          'MyObject',
          'NewObject'
        )
      ).toBe(null);
    });
  });
});
