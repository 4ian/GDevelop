// @flow

import {
  ProjectSourceCatalogError,
  serializeProjectLayoutCatalog,
  serializeProjectSettingsCatalog,
  validateProjectLayoutCatalog,
  validateProjectSettingsCatalog,
} from './ProjectSourceCatalog';

const base = format => ({
  format,
  formatVersion: 1,
  project: { name: 'Test', uuid: 'test' },
  authoring: { rules: [] },
  counts: {},
});

describe('project source catalogs', () => {
  test('validates and compactly serializes a settings catalog', () => {
    const catalog = {
      ...base('gdevelop-settings-catalog'),
      fileKinds: [{ kind: 'project', path: 'project.settings' }],
      settingsOwners: [{ kind: 'project', name: 'Test' }],
      objectTypes: [{ type: 'Sprite' }],
      behaviorTypes: [{ type: 'Tween::TweenBehavior' }],
      effectTypes: [{ type: 'Effects::Outline' }],
    };

    const source = serializeProjectSettingsCatalog(catalog);
    expect(JSON.parse(source)).toEqual(catalog);
    expect(source).toContain('\n{"type":"Sprite"}\n');
    expect(validateProjectSettingsCatalog(JSON.parse(source))).toEqual(catalog);
  });

  test('validates and compactly serializes a layout catalog', () => {
    const catalog = {
      ...base('gdevelop-layout-catalog'),
      elements: [
        { element: 'layout' },
        { element: 'layer', variant: 'external reference' },
      ],
      contexts: [
        {
          kind: 'scene',
          owner: { scene: 'Main' },
          layers: [''],
          objects: [],
        },
      ],
      effectTypes: [],
    };

    const source = serializeProjectLayoutCatalog(catalog);
    expect(JSON.parse(source)).toEqual(catalog);
    expect(source).toContain('\n{"kind":"scene"');
    expect(validateProjectLayoutCatalog(JSON.parse(source))).toEqual(catalog);
  });

  test('rejects duplicate type and malformed context entries', () => {
    expect(() =>
      validateProjectSettingsCatalog({
        ...base('gdevelop-settings-catalog'),
        fileKinds: [{ kind: 'project' }],
        settingsOwners: [],
        objectTypes: [{ type: 'Sprite' }, { type: 'Sprite' }],
        behaviorTypes: [],
        effectTypes: [],
      })
    ).toThrow(ProjectSourceCatalogError);
    expect(() =>
      validateProjectLayoutCatalog({
        ...base('gdevelop-layout-catalog'),
        elements: [{ element: 'layout' }],
        contexts: [{ kind: 'scene' }],
        effectTypes: [],
      })
    ).toThrow(ProjectSourceCatalogError);
  });
});
