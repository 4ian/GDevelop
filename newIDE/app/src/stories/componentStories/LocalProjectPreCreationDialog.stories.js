// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';
import LocalProjectPreCreationDialog from '../../ProjectCreation/LocalProjectPreCreationDialog';

export default {
  title: 'Project Creation/LocalProjectPreCreationDialog',
  component: LocalProjectPreCreationDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Open = () => (
  <LocalProjectPreCreationDialog
    open
    outputPath="/path/to/project/file.json"
    onChangeOutputPath={action('change output path')}
    onClose={() => action('click on close')()}
    onCreate={() => action('click on create')()}
  />
);

export const Disabled = () => (
  <LocalProjectPreCreationDialog
    open
    isOpening
    outputPath="/path/to/project/file.json"
    onChangeOutputPath={action('change output path')}
    onClose={() => action('click on close')()}
    onCreate={() => action('click on create')()}
  />
);
