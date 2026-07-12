// @flow

import { createEventsFunctionExtensionItem } from './CreateEventsFunctionExtensionItem';
import { reloadProjectEventsFunctionsExtensionMetadata } from '../EventsFunctionsExtensionsLoader';
import { enumerateObjectTypes } from '../ObjectsList/EnumerateObjects';
import { enumerateBehaviorsMetadata } from '../BehaviorsEditor/EnumerateBehaviorsMetadata';

const gd: libGDevelop = global.gd;

const eventsFunctionCodeWriter = ({
  getIncludeFileFor: () => 'generated-recent-editor-item.js',
  writeFunctionCode: async () => {},
  writeBehaviorCode: async () => {},
  writeObjectCode: async () => {},
}: any);
const i18n = ({
  _: value => (typeof value === 'string' ? value : value.id),
}: any);

describe('ProjectManager extension item creation', () => {
  it('immediately registers items created from Recent Editors for searches', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const extensionName = 'RecentEditorsExtension';
    let metadataReloadCount = 0;
    const reloadExtensionMetadata = (
      project: gdProject,
      extension: gdEventsFunctionsExtension
    ) => {
      metadataReloadCount++;
      reloadProjectEventsFunctionsExtensionMetadata(
        project,
        extension,
        eventsFunctionCodeWriter,
        i18n
      );
    };

    const createdPrefab = createEventsFunctionExtensionItem({
      project,
      payload: {
        itemKind: 'prefab',
        itemName: 'Person',
        extensionName: '',
        newExtensionName: extensionName,
        prefabObjectDimension: '2d',
        functionType: gd.EventsFunction.Action,
      },
      reloadExtensionMetadata,
    });
    const createdBehavior = createEventsFunctionExtensionItem({
      project,
      payload: {
        itemKind: 'behavior',
        itemName: 'Movement',
        extensionName,
        newExtensionName: '',
        prefabObjectDimension: '2d',
        functionType: gd.EventsFunction.Action,
      },
      reloadExtensionMetadata,
    });
    const createdFunction = createEventsFunctionExtensionItem({
      project,
      payload: {
        itemKind: 'function',
        itemName: 'Calculate',
        extensionName,
        newExtensionName: '',
        prefabObjectDimension: '2d',
        functionType: gd.EventsFunction.Action,
      },
      reloadExtensionMetadata,
    });

    expect(metadataReloadCount).toBe(3);
    expect(createdPrefab.itemKind).toBe('prefab');
    expect(createdBehavior.itemKind).toBe('behavior');
    expect(createdFunction.itemKind).toBe('function');

    const prefabType = gd.PlatformExtension.getObjectFullType(
      extensionName,
      'Person'
    );
    expect(
      enumerateObjectTypes(project, null).find(
        ({ type }) => type === prefabType
      )
    ).toMatchObject({ fullName: 'Person', type: prefabType });

    const behaviorType = gd.PlatformExtension.getBehaviorFullType(
      extensionName,
      'Movement'
    );
    expect(
      enumerateBehaviorsMetadata(gd.JsPlatform.get(), project, null).find(
        ({ type }) => type === behaviorType
      )
    ).toMatchObject({ fullName: 'Movement', type: behaviorType });

    const platformExtensions = gd.JsPlatform.get().getAllPlatformExtensions();
    let platformExtension;
    for (let index = 0; index < platformExtensions.size(); index++) {
      const candidate = platformExtensions.at(index);
      if (candidate.getName() === extensionName) {
        platformExtension = candidate;
        break;
      }
    }
    const actions = platformExtension
      ? platformExtension.getAllActions()
      : null;
    const functionType = actions
      ? actions
          .keys()
          .toJSArray()
          .find(type => type.includes('Calculate'))
      : null;
    expect(functionType).toBeDefined();
    expect(
      actions && functionType ? actions.get(functionType).getFullName() : null
    ).toBe('Calculate');

    gd.JsPlatform.get().removeExtension(extensionName);
    project.delete();
  });
});
