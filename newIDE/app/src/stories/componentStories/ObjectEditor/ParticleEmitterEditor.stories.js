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
      resourceSources={[]}
      onChooseResource={source => action('Choose resource from source', source)}
      resourceExternalEditors={fakeResourceExternalEditors}
      onSizeUpdated={() => {}}
      objectName="FakeObjectName"
    />
  </SerializedObjectDisplay>
);
