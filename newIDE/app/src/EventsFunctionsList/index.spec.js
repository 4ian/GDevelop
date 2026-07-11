// @flow

import { insertNewEventsBasedObject } from './CreateEventsBasedObject';
import { insertNewEventsBasedBehavior } from './CreateEventsBasedBehavior';
import { initializeEventsFunctionDisplayName } from './InitializeEventsFunction';
import { enumerateObjectTypes } from '../ObjectsList/EnumerateObjects';
import { enumerateBehaviorsMetadata } from '../BehaviorsEditor/EnumerateBehaviorsMetadata';
import { reloadProjectEventsFunctionsExtensionMetadata } from '../EventsFunctionsExtensionsLoader';

const gd: libGDevelop = global.gd;

describe('EventsFunctionsList extension entity creation', () => {
  it('creates searchable metadata for a new prefab, behavior and function', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const extensionName = 'PrefabCatalogTest';
    const extension = project.insertNewEventsFunctionsExtension(
      extensionName,
      0
    );
    const prefab = insertNewEventsBasedObject({
      eventsFunctionsExtension: extension,
      isRenderedIn3D: false,
    });

    expect(prefab.getName()).toBe('MyObject');
    expect(prefab.getFullName()).toBe('MyObject');
    prefab.setName('Person');
    prefab.setFullName('Person');
    const behavior = insertNewEventsBasedBehavior(extension);
    expect(behavior.getName()).toBe('MyBehavior');
    expect(behavior.getFullName()).toBe('MyBehavior');
    behavior.setName('Movement');
    behavior.setFullName('Movement');

    const functions = extension.getEventsFunctions();
    const eventsFunction = functions.insertNewEventsFunctionInFolder(
      'Calculate',
      functions.getRootFolder(),
      0
    );
    eventsFunction.setFunctionType(gd.EventsFunction.Action);
    initializeEventsFunctionDisplayName(eventsFunction, 'Calculate');
    expect(eventsFunction.getFullName()).toBe('Calculate');

    reloadProjectEventsFunctionsExtensionMetadata(
      project,
      extension,
      ({
        getIncludeFileFor: () => 'generated-prefab.js',
        writeFunctionCode: async () => {},
        writeBehaviorCode: async () => {},
        writeObjectCode: async () => {},
      }: any),
      ({ _: value => (typeof value === 'string' ? value : value.id) }: any)
    );

    const fullType = gd.PlatformExtension.getObjectFullType(
      extensionName,
      prefab.getName()
    );
    expect(
      enumerateObjectTypes(project, null).find(({ type }) => type === fullType)
    ).toMatchObject({
      name: fullType,
      fullName: 'Person',
      type: fullType,
    });
    const behaviorType = gd.PlatformExtension.getBehaviorFullType(
      extensionName,
      behavior.getName()
    );
    expect(
      enumerateBehaviorsMetadata(gd.JsPlatform.get(), project, null).find(
        ({ type }) => type === behaviorType
      )
    ).toMatchObject({
      fullName: 'Movement',
      type: behaviorType,
    });
    const platformExtensions = gd.JsPlatform.get().getAllPlatformExtensions();
    let platformExtension;
    for (let index = 0; index < platformExtensions.size(); index++) {
      const candidate = platformExtensions.at(index);
      if (candidate.getName() === extensionName) {
        platformExtension = candidate;
        break;
      }
    }
    expect(platformExtension).toBeDefined();
    const generatedActions = platformExtension
      ? platformExtension.getAllActions()
      : null;
    const functionInstructionType = generatedActions
      ? generatedActions
          .keys()
          .toJSArray()
          .find(type => type.includes('Calculate'))
      : null;
    expect(functionInstructionType).toBeDefined();
    expect(
      generatedActions && functionInstructionType
        ? generatedActions.get(functionInstructionType).getFullName()
        : null
    ).toBe('Calculate');

    gd.JsPlatform.get().removeExtension(extensionName);
    project.delete();
  });
});
