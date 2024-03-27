// @flow

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import ParticleEmitterEditor from '../../../ObjectEditor/Editors/ParticleEmitterEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ObjectEditor/ParticleEmitterEditor',
  component: ParticleEmitterEditor,
  decorators: [paperDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay object={testProject.particleEmitterConfiguration}>
    <ParticleEmitterEditor
      objectConfiguration={testProject.particleEmitterConfiguration}
      project={testProject.project}
      layout={testProject.testLayout}
      resourceManagementProps={fakeResourceManagementProps}
      onSizeUpdated={() => {}}
      // It would be used for refactoring but this kind of object has none.
      object={testProject.spriteObject}
      objectName="FakeObjectName"
    />
  </SerializedObjectDisplay>
);
