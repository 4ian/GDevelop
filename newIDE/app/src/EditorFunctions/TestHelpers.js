// @flow
import { type I18n as I18nType } from '@lingui/core';
import { fakeAssetShortHeader1 } from '../fixtures/GDevelopServicesTestData';
import { PixiResourcesLoaderMock } from '../fixtures/TestPixiResourcesLoader';
import {
  type LaunchFunctionOptionsWithProject,
  type LaunchFunctionOptionsWithoutProject,
} from './index';

const gd: libGDevelop = global.gd;

// $FlowFixMe[incompatible-type]
export const makeFakeI18n = (fakeI18n?: any): I18nType => ({
  ...fakeI18n,
  _: (message: any) => message.id,
});

export const makeFakeLaunchFunctionOptionsWithoutProject = (): LaunchFunctionOptionsWithoutProject => ({
  args: {},
  i18n: makeFakeI18n(),
  editorCallbacks: {
    onOpenLayout: jest.fn(),
    onCreateProject: jest.fn(),
  },
  relatedAiRequestId: 'fake-ai-request-id',
  getRelatedAiRequestLastMessages: () => ({
    lastUserMessage: null,
    lastAssistantMessages: [],
  }),
  generateEvents: jest.fn(),
  onInstancesModifiedOutsideEditor: jest.fn(),
  onObjectGroupsModifiedOutsideEditor: jest.fn(),
  onSceneEventsModifiedOutsideEditor: jest.fn(),
  onProjectItemRenamedOutsideEditor: jest.fn(),
  toolOptions: {
    includeEventsJson: true,
  },
  ensureExtensionInstalled: jest.fn(),
  searchAndInstallAsset: jest.fn(),
  searchAndInstallResources: async () => {
    return Promise.resolve({
      results: [
        {
          resourceName: 'fake-resource-name',
          resourceKind: 'fake-resource-kind',
          status: 'resource-installed',
        },
      ],
    });
  },
  onObjectsModifiedOutsideEditor: jest.fn(),
  onWillDeleteScene: jest.fn(),
  onWillDeleteObject: jest.fn(),
  onWillInstallExtension: jest.fn(),
  onExtensionInstalled: jest.fn(),
  getAssetStoreTagForNewObject: () => null,
  PixiResourcesLoader: PixiResourcesLoaderMock,
});

export const makeFakeLaunchFunctionOptionsWithProject = (
  project: gdProject
): LaunchFunctionOptionsWithProject => ({
  ...makeFakeLaunchFunctionOptionsWithoutProject(),
  project,
  searchAndInstallAsset: async ({
    objectsContainer,
    objectName,
    objectType,
  }) => {
    const fakeFoundObjectType = objectType || 'Sprite';
    const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
      project,
      fakeFoundObjectType
    );
    const object = objectsContainer.insertNewObject(
      project,
      fakeFoundObjectType,
      objectName,
      objectsContainer.getObjectsCount()
    );

    return Promise.resolve({
      status: 'asset-installed',
      message: 'Object installed',
      createdObjects: [object],
      assetShortHeader: fakeAssetShortHeader1,
      isTheFirstOfItsTypeInProject,
    });
  },
});
