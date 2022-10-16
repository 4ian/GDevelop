// @flow

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import TiledSpriteEditor from '../../../ObjectEditor/Editors/TiledSpriteEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';

export default {
  title: 'ObjectEditor/TiledSpriteEditor',
  component: TiledSpriteEditor,
  decorators: [muiDecorator, paperDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay object={testProject.tiledSpriteObjectConfiguration}>
    <TiledSpriteEditor
      objectConfiguration={testProject.tiledSpriteObjectConfiguration}
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
