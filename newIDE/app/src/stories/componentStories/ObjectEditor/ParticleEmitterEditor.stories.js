// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import ParticleEmitterEditor from '../../../ObjectEditor/Editors/ParticleEmitterEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';

export default {
  title: 'ObjectEditor/ParticleEmitterEditor',
  component: ParticleEmitterEditor,
  decorators: [muiDecorator, paperDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay object={testProject.particleEmitterConfiguration}>
    <ParticleEmitterEditor
      objectConfiguration={testProject.particleEmitterConfiguration}
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
