// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';
import ProjectPreCreationDialog from '../../ProjectCreation/ProjectPreCreationDialog';

export default {
  title: 'Project Creation/ProjectPreCreationDialog',
  component: ProjectPreCreationDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Open = () => {
  const [projectName, setProjectName] = React.useState('Project Name');
  return (
    <ProjectPreCreationDialog
      open
      onClose={() => action('click on close')()}
      onCreate={() => action('click on create')()}
    />
  );
};

export const Disabled = () => {
  const [projectName, setProjectName] = React.useState('Project Name');
  return (
    <ProjectPreCreationDialog
      open
      isOpening
      onClose={() => action('click on close')()}
      onCreate={() => action('click on create')()}
    />
  );
};
