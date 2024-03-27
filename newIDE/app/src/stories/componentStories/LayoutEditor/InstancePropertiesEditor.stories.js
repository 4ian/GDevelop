// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { I18n } from '@lingui/react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import InstancePropertiesEditor from '../../../InstancesEditor/InstancePropertiesEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';

export default {
  title: 'LayoutEditor/InstancePropertiesEditor',
  component: InstancePropertiesEditor,
  decorators: [paperDecorator],
};

export const Default = () => (
  <I18n>
    {({ i18n }) => (
      <SerializedObjectDisplay object={testProject.testLayout}>
        <InstancePropertiesEditor
          i18n={i18n}
          project={testProject.project}
          layout={testProject.testLayout}
          instances={[testProject.testLayoutInstance1]}
          editInstanceVariables={action('edit instance variables')}
          onGetInstanceSize={() => [100, 101, 102]}
          onEditObjectByName={action('edit object')}
        />
      </SerializedObjectDisplay>
    )}
  </I18n>
);
