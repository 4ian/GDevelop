// @flow
import {
  applyProjectEditorSettings,
  extractProjectEditorSettings,
  getEditorSettingsSidecarPath,
} from './LocalEditorSettingsSidecar';
// $FlowFixMe[cannot-resolve-module]
import path from 'path';

const makeSerializedProjectWithEditorSettings = (): Object => ({
  name: 'My project',
  layouts: [
    {
      name: 'Scene 1',
      uiSettings: { grid: false, gridWidth: 32, zoomFactor: 0.75 },
    },
    {
      name: 'Scene 2',
      uiSettings: { grid: true, windowMask: true },
    },
    { name: 'Scene without settings' },
  ],
  externalLayouts: [
    {
      name: 'HUD',
      editionSettings: { zoomFactor: 1, windowMask: false },
    },
  ],
  eventsFunctionsExtensions: [
    {
      name: 'MyExtension',
      eventsBasedObjects: [
        {
          name: 'MyCustomObject',
          editionSettings: { zoomFactor: 0.5 },
          variants: [
            {
              name: 'Variant 1',
              editionSettings: { grid: true, gridWidth: 64 },
            },
            { name: 'Variant without settings' },
          ],
        },
      ],
    },
  ],
});

describe('LocalEditorSettingsSidecar', () => {
  describe('getEditorSettingsSidecarPath', () => {
    it('stores the settings in a folder that can be gitignored', () => {
      expect(getEditorSettingsSidecarPath('C:/Projects/MyGame/game.json')).toBe(
        path.join(
          'C:/Projects/MyGame',
          '.gdevelop',
          'game.editor-settings.json'
        )
      );
    });

    it('stores settings of projects in the same folder separately', () => {
      expect(
        getEditorSettingsSidecarPath('C:/Projects/MyGame/game.json')
      ).not.toBe(
        getEditorSettingsSidecarPath('C:/Projects/MyGame/prototype.json')
      );
    });
  });

  describe('extractProjectEditorSettings', () => {
    it('extracts the editor settings and removes them from the project', () => {
      const serializedProject = makeSerializedProjectWithEditorSettings();

      const editorSettings = extractProjectEditorSettings(serializedProject);

      expect(editorSettings).toEqual({
        layouts: {
          'Scene 1': { grid: false, gridWidth: 32, zoomFactor: 0.75 },
          'Scene 2': { grid: true, windowMask: true },
        },
        externalLayouts: {
          HUD: { zoomFactor: 1, windowMask: false },
        },
        customObjects: {
          MyExtension: {
            MyCustomObject: {
              defaultVariant: { zoomFactor: 0.5 },
              variants: {
                'Variant 1': { grid: true, gridWidth: 64 },
              },
            },
          },
        },
      });
      expect(serializedProject.layouts[0].uiSettings).toBeUndefined();
      expect(serializedProject.layouts[2].uiSettings).toBeUndefined();
      expect(
        serializedProject.externalLayouts[0].editionSettings
      ).toBeUndefined();
      expect(
        serializedProject.eventsFunctionsExtensions[0].eventsBasedObjects[0]
          .editionSettings
      ).toBeUndefined();
      expect(
        serializedProject.eventsFunctionsExtensions[0].eventsBasedObjects[0]
          .variants[0].editionSettings
      ).toBeUndefined();
    });

    it('returns null when the project has no editor settings', () => {
      expect(
        extractProjectEditorSettings({
          layouts: [{ name: 'Scene 1' }],
          externalLayouts: [],
          eventsFunctionsExtensions: [],
        })
      ).toBe(null);
    });

    it('does not throw on a malformed serialized project', () => {
      expect(() =>
        extractProjectEditorSettings({
          layouts: [null, {}, { name: null }, 'not an object'],
          externalLayouts: null,
          eventsFunctionsExtensions: [{ name: 'X', eventsBasedObjects: null }],
        })
      ).not.toThrow();
    });
  });

  describe('applyProjectEditorSettings', () => {
    it('fills a project without editor settings back with them', () => {
      const serializedProject = makeSerializedProjectWithEditorSettings();
      const editorSettings = extractProjectEditorSettings(serializedProject);

      applyProjectEditorSettings(serializedProject, editorSettings);

      expect(serializedProject.layouts[0].uiSettings).toEqual({
        grid: false,
        gridWidth: 32,
        zoomFactor: 0.75,
      });
      expect(serializedProject.layouts[1].uiSettings).toEqual({
        grid: true,
        windowMask: true,
      });
      expect(serializedProject.layouts[2].uiSettings).toBeUndefined();
      expect(serializedProject.externalLayouts[0].editionSettings).toEqual({
        zoomFactor: 1,
        windowMask: false,
      });
      expect(
        serializedProject.eventsFunctionsExtensions[0].eventsBasedObjects[0]
          .editionSettings
      ).toEqual({ zoomFactor: 0.5 });
      expect(
        serializedProject.eventsFunctionsExtensions[0].eventsBasedObjects[0]
          .variants[0].editionSettings
      ).toEqual({ grid: true, gridWidth: 64 });
      expect(
        serializedProject.eventsFunctionsExtensions[0].eventsBasedObjects[0]
          .variants[1].editionSettings
      ).toBeUndefined();
    });

    it('does not override settings already stored in the project', () => {
      // A project can still have editor settings inside it: for example, an
      // autosave, or a project last saved by an older version. These settings
      // are fresher than the ones of the sidecar file, so they must be kept.
      const serializedProject = {
        layouts: [{ name: 'Scene 1', uiSettings: { zoomFactor: 2 } }],
      };

      applyProjectEditorSettings(serializedProject, {
        layouts: { 'Scene 1': { zoomFactor: 0.5 } },
        externalLayouts: {},
        customObjects: {},
      });

      expect(serializedProject.layouts[0].uiSettings).toEqual({
        zoomFactor: 2,
      });
    });

    it('does not throw with a null or malformed sidecar content', () => {
      const serializedProject = makeSerializedProjectWithEditorSettings();
      const notAnObject: any = 'not an object';
      const malformedSettings: any = { layouts: 'not an object' };

      expect(() =>
        applyProjectEditorSettings(serializedProject, null)
      ).not.toThrow();
      expect(() =>
        applyProjectEditorSettings(serializedProject, notAnObject)
      ).not.toThrow();
      expect(() =>
        applyProjectEditorSettings(
          { layouts: [{ name: 'Scene 1' }] },
          malformedSettings
        )
      ).not.toThrow();
    });
  });
});
