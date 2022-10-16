// @flow

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import PanelSpriteEditor from '../../../ObjectEditor/Editors/PanelSpriteEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';

export default {
  title: 'ObjectEditor/PanelSpriteEditor',
  component: PanelSpriteEditor,
  decorators: [muiDecorator, paperDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay
    object={testProject.panelSpriteObject.getConfiguration()}
  >
    <PanelSpriteEditor
      objectConfiguration={testProject.panelSpriteObject.getConfiguration()}
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
