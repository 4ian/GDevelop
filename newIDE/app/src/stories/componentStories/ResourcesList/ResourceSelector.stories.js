// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import ResourceSelector from '../../../ResourcesList/ResourceSelector';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import ResourcesLoader from '../../../ResourcesLoader';
import ResourceSelectorWithThumbnail from '../../../ResourcesList/ResourceSelectorWithThumbnail';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ResourcesList/ResourceSelector',
  component: ResourceSelector,
  decorators: [paperDecorator],
};

export const ImageNotSelected = () => (
  <ResourceSelector
    resourceKind="image"
    project={testProject.project}
    resourceManagementProps={fakeResourceManagementProps}
    initialResourceName=""
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const ImageSelected = () => (
  <ResourceSelector
    resourceKind="image"
    project={testProject.project}
    resourceManagementProps={fakeResourceManagementProps}
    initialResourceName="icon128.png"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const ImageWithMultipleExternalEditors = () => (
  <ResourceSelector
    resourceKind="image"
    project={testProject.project}
    resourceManagementProps={{
      getStorageProvider: () => emptyStorageProvider,
      onFetchNewlyAddedResources: async () => {},
      resourceSources: [],
      onChooseResource: () => Promise.reject('Unimplemented'),
      resourceExternalEditors: [
        ...fakeResourceExternalEditors,
        {
          name: 'fake-image-editor-2',
          createDisplayName: 'Create with Super Image Editor 2',
          editDisplayName: 'Edit with Super Image Editor 2',
          kind: 'image',
          edit: async options => {
            console.log('Open the image editor with these options:', options);
            return null;
          },
        },
      ],
      getStorageProviderResourceOperations: () => null,
    }}
    initialResourceName=""
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const NotExisting = () => (
  <ResourceSelector
    resourceKind="image"
    project={testProject.project}
    resourceManagementProps={fakeResourceManagementProps}
    initialResourceName="resource-that-does-not-exists-in-the-project"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const ImageNoMargin = () => (
  <ResourceSelector
    margin="none"
    resourceKind="image"
    project={testProject.project}
    resourceManagementProps={fakeResourceManagementProps}
    initialResourceName="icon128.png"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const ImageWithThumbnail = () => (
  <ResourceSelectorWithThumbnail
    resourceKind="image"
    project={testProject.project}
    resourceManagementProps={fakeResourceManagementProps}
    resourceName="icon128.png"
    onChange={action('on change')}
  />
);

export const Audio = () => (
  <ResourceSelector
    resourceKind="audio"
    project={testProject.project}
    resourceManagementProps={fakeResourceManagementProps}
    initialResourceName="fake-audio1.mp3"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const FontWithResetButton = () => (
  <ResourceSelector
    canBeReset
    resourceKind="font"
    project={testProject.project}
    resourceManagementProps={fakeResourceManagementProps}
    initialResourceName="font.otf"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);

export const FontNoMarginWithResetButton = () => (
  <ResourceSelector
    canBeReset
    margin="none"
    resourceKind="font"
    project={testProject.project}
    resourceManagementProps={fakeResourceManagementProps}
    initialResourceName="font.otf"
    onChange={action('on change')}
    resourcesLoader={ResourcesLoader}
  />
);
