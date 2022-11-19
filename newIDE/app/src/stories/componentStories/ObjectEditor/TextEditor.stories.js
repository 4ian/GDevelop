// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import TextEditor from '../../../ObjectEditor/Editors/TextEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';

export default {
  title: 'ObjectEditor/TextEditor',
  component: TextEditor,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay object={testProject.textObjectConfiguration}>
    <TextEditor
      objectConfiguration={testProject.textObjectConfiguration}
      project={testProject.project}
      resourceManagementProps={{
        getStorageProvider: () => emptyStorageProvider,
        onFetchNewlyAddedResources: async () => {},
        resourceSources: [],
        onChooseResource: () => Promise.reject('Unimplemented'),
        resourceExternalEditors: fakeResourceExternalEditors,
      }}
      onSizeUpdated={() => {}}
      objectName="FakeObjectName"
    />
  </SerializedObjectDisplay>
);
