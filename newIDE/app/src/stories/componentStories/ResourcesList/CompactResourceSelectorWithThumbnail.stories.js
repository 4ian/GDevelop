// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { action } from '@storybook/addon-actions';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import { CompactResourceSelectorWithThumbnail } from '../../../ResourcesList/CompactResourceSelectorWithThumbnail';
import { ColumnStackLayout } from '../../../UI/Layout';
import ElementHighlighterProvider from '../../ElementHighlighterProvider';
import Text from '../../../UI/Text';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';

export default {
  title: 'UI Building Blocks/CompactResourceSelectorWithThumbnail',
  component: CompactResourceSelectorWithThumbnail,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  return (
    <ElementHighlighterProvider
      elements={[{ label: 'Default', id: 'default' }]}
    >
      <ColumnStackLayout expand>
        <Text size="sub-title">No image selected</Text>
        <CompactResourceSelectorWithThumbnail
          resourceKind="image"
          project={testProject.project}
          resourceManagementProps={fakeResourceManagementProps}
          resourceName=""
          onChange={action('on change')}
        />
        <Text size="sub-title">Image selected</Text>
        <CompactResourceSelectorWithThumbnail
          id="default"
          resourceKind="image"
          project={testProject.project}
          resourceManagementProps={fakeResourceManagementProps}
          resourceName="icon128.png"
          onChange={action('on change')}
        />
        <Text size="sub-title">With multiple external editors</Text>
        <CompactResourceSelectorWithThumbnail
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
                  console.log(
                    'Open the image editor with these options:',
                    options
                  );
                  return null;
                },
              },
            ],
            getStorageProviderResourceOperations: () => null,
            canInstallPrivateAsset: () => false,
          }}
          resourceName="icon128.png"
          onChange={action('on change')}
        />
        <Text size="sub-title">Not existing</Text>
        <CompactResourceSelectorWithThumbnail
          resourceKind="image"
          project={testProject.project}
          resourceManagementProps={fakeResourceManagementProps}
          resourceName="resource-that-does-not-exists-in-the-project"
          onChange={action('on change')}
        />
        <Text size="sub-title">Audio</Text>
        <CompactResourceSelectorWithThumbnail
          resourceKind="audio"
          project={testProject.project}
          resourceManagementProps={fakeResourceManagementProps}
          resourceName="fake-audio1.mp3"
          onChange={action('on change')}
        />
        <Text size="sub-title">Font</Text>
        <CompactResourceSelectorWithThumbnail
          resourceKind="font"
          project={testProject.project}
          resourceManagementProps={fakeResourceManagementProps}
          resourceName="font.otf"
          onChange={action('on change')}
        />
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
