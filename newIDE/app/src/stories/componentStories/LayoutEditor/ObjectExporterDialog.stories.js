// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import ObjectExporterDialog from '../../../ObjectEditor/ObjectExporterDialog';

export default {
  title: 'LayoutEditor/ObjectExporterDialog',
  component: ObjectExporterDialog,
};

// $FlowFixMe[signature-verification-failure]
export const Default = () => (
  <ObjectExporterDialog
    project={testProject.project}
    layout={testProject.testLayout}
    onClose={() => action('Close the dialog')}
  />
);
