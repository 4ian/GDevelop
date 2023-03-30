// @flow

import * as React from 'react';

import { action } from '@storybook/addon-actions';

import CloudProjectSaveChoiceDialog from '../../../ProjectsStorage/CloudStorageProvider/CloudProjectSaveChoiceDialog';
import muiDecorator from '../../ThemeDecorator';

export default {
  title: 'Storage Providers/CloudStorageProvider/CloudProjectSaveChoiceDialog',
  component: CloudProjectSaveChoiceDialog,
  decorators: [muiDecorator],
};

export const Default = () => {
  return (
    <CloudProjectSaveChoiceDialog
      onClose={() => action('onClose')()}
      onSaveAsDuplicate={() => action('onSaveAsDuplicate')()}
      onSaveAsMainVersion={() => action('onSaveAsMainVersion')()}
    />
  );
};
