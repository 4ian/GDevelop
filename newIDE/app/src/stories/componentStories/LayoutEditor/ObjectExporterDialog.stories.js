// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import ObjectExporterDialog from '../../../ObjectEditor/ObjectExporterDialog';

export default {
  title: 'LayoutEditor/ObjectExporterDialog',
  component: ObjectExporterDialog,
  decorators: [muiDecorator],
};

export const Default = () => (
  <ObjectExporterDialog
    project={testProject.project}
    layout={testProject.testLayout}
    object={testProject.customObject}
    onClose={() => action('Close the dialog')}
  />
);
