// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import { testProject } from '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import ExternalPropertiesDialog from '../../MainFrame/EditorContainers/ExternalPropertiesDialog';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'ExternalPropertiesDialog',
};

export const WithLayoutSelection = (): React.Node => (
  <ExternalPropertiesDialog
    title="Configure the properties"
    open
    onChoose={action('on choose')}
    onClose={action('on close')}
    project={testProject.project}
  />
);
WithLayoutSelection.storyName = 'with layout selection';

export const WithHelpTexts = (): React.Node => (
  <ExternalPropertiesDialog
    title="Configure the properties"
    open
    onChoose={action('on choose')}
    onClose={action('on close')}
    project={testProject.project}
    helpTexts={[
      'This is a help text, remember to read it.',
      "And there's another one!",
    ]}
  />
);
WithHelpTexts.storyName = 'with help texts';
