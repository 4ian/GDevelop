// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import CustomObjectPropertiesEditor from '../../../ObjectEditor/Editors/CustomObjectPropertiesEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';

export default {
  title: 'ObjectEditor/CustomObjectPropertiesEditor',
  component: CustomObjectPropertiesEditor,
  decorators: [paperDecorator, muiDecorator],
};

export const ButtonObject = () => (
  <SerializedObjectDisplay object={testProject.customObject.getConfiguration()}>
    <CustomObjectPropertiesEditor
      objectConfiguration={testProject.customObject.getConfiguration()}
      project={testProject.project}
      resourceSources={[]}
      onChooseResource={source => action('Choose resource from source', source)}
      resourceExternalEditors={fakeResourceExternalEditors}
      onSizeUpdated={() => {}}
      objectName="FakeObjectName"
    />
  </SerializedObjectDisplay>
);
