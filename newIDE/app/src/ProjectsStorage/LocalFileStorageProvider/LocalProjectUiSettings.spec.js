// @flow
import {
  applyLocalProjectUiSettings,
  extractLocalProjectUiSettings,
  getLocalProjectUiSettingsFilePath,
  hasLocalProjectUiSettings,
} from './LocalProjectUiSettings';
import path from 'path-browserify';

const clone = (object: Object) => JSON.parse(JSON.stringify(object));

describe('LocalProjectUiSettings', () => {
  it('builds a sidecar path scoped to the project file name', () => {
    expect(
      getLocalProjectUiSettingsFilePath(
        path.join('games', 'folder', 'game.json'),
        path
      )
    ).toBe(
      path.join('games', 'folder', '.gdevelop', 'game.editor-settings.json')
    );
    expect(
      getLocalProjectUiSettingsFilePath(
        path.join('games', 'folder', 'prototype.json'),
        path
      )
    ).toBe(
      path.join(
        'games',
        'folder',
        '.gdevelop',
        'prototype.editor-settings.json'
      )
    );
    expect(
      getLocalProjectUiSettingsFilePath(
        path.join('games', 'folder', 'game.json.autosave'),
        path
      )
    ).toBe(
      path.join('games', 'folder', '.gdevelop', 'game.editor-settings.json')
    );
  });

  it('extracts layout editor settings from project content', () => {
    const projectObject = {
      layouts: [
        {
          name: 'Scene',
          uiSettings: {
            grid: true,
            gridWidth: 16,
            zoomFactor: 0.5,
          },
        },
      ],
      externalLayouts: [
        {
          name: 'External layout',
          editionSettings: {
            grid: false,
            zoomFactor: 2,
          },
        },
      ],
      eventsFunctionsExtensions: [
        {
          name: 'Extension',
          eventsBasedObjects: [
            {
              name: 'CustomObject',
              editionSettings: {
                zoomFactor: 1.5,
              },
              variants: [
                {
                  name: 'Variant',
                  editionSettings: {
                    grid: true,
                    snap: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const localProjectUiSettings = extractLocalProjectUiSettings(projectObject);

    expect(projectObject.layouts[0].uiSettings).toBeUndefined();
    expect(projectObject.externalLayouts[0].editionSettings).toBeUndefined();
    expect(
      projectObject.eventsFunctionsExtensions[0].eventsBasedObjects[0]
        .editionSettings
    ).toBeUndefined();
    expect(
      projectObject.eventsFunctionsExtensions[0].eventsBasedObjects[0]
        .variants[0].editionSettings
    ).toBeUndefined();
    expect(hasLocalProjectUiSettings(localProjectUiSettings)).toBe(true);
    expect(localProjectUiSettings).toMatchInlineSnapshot(`
      Object {
        "eventsFunctionsExtensions": Object {
          "Extension": Object {
            "eventsBasedObjects": Object {
              "CustomObject": Object {
                "editionSettings": Object {
                  "zoomFactor": 1.5,
                },
                "variants": Object {
                  "Variant": Object {
                    "editionSettings": Object {
                      "grid": true,
                      "snap": true,
                    },
                  },
                },
              },
            },
          },
        },
        "externalLayouts": Object {
          "External layout": Object {
            "editionSettings": Object {
              "grid": false,
              "zoomFactor": 2,
            },
          },
        },
        "layouts": Object {
          "Scene": Object {
            "uiSettings": Object {
              "grid": true,
              "gridWidth": 16,
              "zoomFactor": 0.5,
            },
          },
        },
        "version": 1,
      }
    `);
  });

  it('reports when there are no local UI settings to persist', () => {
    const projectObject = {
      layouts: [
        {
          name: 'Scene',
          instances: [],
        },
      ],
    };

    const localProjectUiSettings = extractLocalProjectUiSettings(projectObject);

    expect(hasLocalProjectUiSettings(localProjectUiSettings)).toBe(false);
  });

  it('applies extracted settings back to matching project items', () => {
    const projectObject = {
      layouts: [
        {
          name: 'Scene',
          uiSettings: {
            grid: true,
          },
        },
      ],
      externalLayouts: [
        {
          name: 'External layout',
          editionSettings: {
            grid: false,
          },
        },
      ],
      eventsFunctionsExtensions: [
        {
          name: 'Extension',
          eventsBasedObjects: [
            {
              name: 'CustomObject',
              editionSettings: {
                zoomFactor: 1.5,
              },
              variants: [
                {
                  name: 'Variant',
                  editionSettings: {
                    snap: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    const originalProjectObject = clone(projectObject);
    const localProjectUiSettings = extractLocalProjectUiSettings(projectObject);

    applyLocalProjectUiSettings(projectObject, localProjectUiSettings);

    expect(projectObject).toEqual(originalProjectObject);
  });

  it('keeps legacy embedded ui settings when no sidecar value exists', () => {
    const projectObject = {
      layouts: [
        {
          name: 'Scene',
          uiSettings: {
            grid: true,
          },
        },
      ],
    };

    applyLocalProjectUiSettings(projectObject, {
      version: 1,
      layouts: {
        OtherScene: {
          uiSettings: {
            grid: false,
          },
        },
      },
    });

    expect(projectObject.layouts[0].uiSettings).toEqual({ grid: true });
  });
});
