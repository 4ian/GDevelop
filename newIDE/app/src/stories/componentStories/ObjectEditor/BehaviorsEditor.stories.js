// @flow

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import BehaviorsEditor from '../../../BehaviorsEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';

export default {
  title: 'ObjectEditor/BehaviorsEditor',
  component: BehaviorsEditor,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      object={testProject.spriteObjectWithBehaviors}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('Unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
      onUpdateBehaviorsSharedData={() => {}}
    />
  </SerializedObjectDisplay>
);

export const WithoutAnyBehaviors = () => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithoutBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      object={testProject.spriteObjectWithoutBehaviors}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('Unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
      onUpdateBehaviorsSharedData={() => {}}
    />
  </SerializedObjectDisplay>
);
