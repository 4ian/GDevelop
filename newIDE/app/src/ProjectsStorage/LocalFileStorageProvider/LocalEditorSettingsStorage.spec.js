// @flow
import {
  applyProjectEditorSettings,
  extractProjectEditorSettings,
  getProjectEditorSettingsFilePath,
} from './LocalEditorSettingsStorage';
// $FlowFixMe[cannot-resolve-module]
import path from 'path';

describe('LocalEditorSettingsStorage', () => {
  it('stores settings separately for projects in the same folder', () => {
    expect(
      getProjectEditorSettingsFilePath('C:/Projects/game.json')
    ).toBe(
      path.join('C:/Projects', '.gdevelop', 'game.editor-settings.json')
    );
    expect(
      getProjectEditorSettingsFilePath('C:/Projects/prototype.json')
    ).toBe(
      path.join('C:/Projects', '.gdevelop', 'prototype.editor-settings.json')
    );
  });

  it('extracts editor settings from project content and applies them back', () => {
    const serializedProjectObject: any = {
      layouts: [
        {
          name: 'Level 1',
          uiSettings: {
            grid: true,
            zoomFactor: 0.5,
          },
        },
        {
          name: 'Level 2',
        },
      ],
      externalLayouts: [
        {
          name: 'HUD',
          editionSettings: {
            windowMask: true,
          },
        },
      ],
      eventsFunctionsExtensions: [
        {
          name: 'Inventory',
          eventsBasedObjects: [
            {
              name: 'Slot',
              editionSettings: {
                selectedLayer: 'Base',
              },
              variants: [
                {
                  name: 'Large',
                  editionSettings: {
                    gridWidth: 64,
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const editorSettings = extractProjectEditorSettings(
      serializedProjectObject
    );

    expect(editorSettings).toEqual({
      layoutSettings: {
        'Level 1': {
          grid: true,
          zoomFactor: 0.5,
        },
      },
      externalLayoutSettings: {
        HUD: {
          windowMask: true,
        },
      },
      eventsBasedObjectVariantSettings: {
        'Inventory::Slot::': {
          selectedLayer: 'Base',
        },
        'Inventory::Slot::Large': {
          gridWidth: 64,
        },
      },
    });
    expect(serializedProjectObject.layouts[0].uiSettings).toBeUndefined();
    expect(
      serializedProjectObject.externalLayouts[0].editionSettings
    ).toBeUndefined();
    expect(
      serializedProjectObject.eventsFunctionsExtensions[0].eventsBasedObjects[0]
        .editionSettings
    ).toBeUndefined();
    expect(
      serializedProjectObject.eventsFunctionsExtensions[0].eventsBasedObjects[0]
        .variants[0].editionSettings
    ).toBeUndefined();

    applyProjectEditorSettings(serializedProjectObject, editorSettings);

    expect(serializedProjectObject.layouts[0].uiSettings).toEqual({
      grid: true,
      zoomFactor: 0.5,
    });
    expect(serializedProjectObject.externalLayouts[0].editionSettings).toEqual({
      windowMask: true,
    });
    expect(
      serializedProjectObject.eventsFunctionsExtensions[0].eventsBasedObjects[0]
        .editionSettings
    ).toEqual({
      selectedLayer: 'Base',
    });
    expect(
      serializedProjectObject.eventsFunctionsExtensions[0].eventsBasedObjects[0]
        .variants[0].editionSettings
    ).toEqual({
      gridWidth: 64,
    });
  });

  it('returns null when there are no editor settings to extract', () => {
    expect(
      extractProjectEditorSettings({
        layouts: [{ name: 'Level 1' }],
        externalLayouts: [],
        eventsFunctionsExtensions: [],
      })
    ).toBe(null);
  });
});
