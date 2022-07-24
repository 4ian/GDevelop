// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import ProjectPreCreationDialog from '../../../ProjectCreation/ProjectPreCreationDialog';

export default {
  title: 'Project Creation/ProjectPreCreationDialog',
  component: ProjectPreCreationDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Open = () => {
  return (
    <ProjectPreCreationDialog
      open
      onClose={() => action('click on close')()}
      onCreate={() => action('click on create')()}
    />
  );
};

export const Disabled = () => {
  return (
    <ProjectPreCreationDialog
      open
      isOpening
      onClose={() => action('click on close')()}
      onCreate={() => action('click on create')()}
    />
  );
};
