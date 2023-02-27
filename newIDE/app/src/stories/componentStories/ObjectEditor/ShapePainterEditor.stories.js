// @flow

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import ShapePainterEditor from '../../../ObjectEditor/Editors/ShapePainterEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';

export default {
  title: 'ObjectEditor/ShapePainterEditor',
  component: ShapePainterEditor,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay object={testProject.shapePainterObjectConfiguration}>
    <ShapePainterEditor
      objectConfiguration={testProject.shapePainterObjectConfiguration}
      project={testProject.project}
      layout={testProject.testLayout}
      resourceManagementProps={{
        getStorageProvider: () => emptyStorageProvider,
        onFetchNewlyAddedResources: async () => {},
        resourceSources: [],
        onChooseResource: () => Promise.reject('Unimplemented'),
        resourceExternalEditors: fakeResourceExternalEditors,
      }}
      onSizeUpdated={() => {}}
      // It would be used for refactoring but this kind of object has none.
      object={testProject.spriteObject}
      objectName="FakeObjectName"
    />
  </SerializedObjectDisplay>
);
