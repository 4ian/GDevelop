// @flow

import * as React from 'react';

import { action } from '@storybook/addon-actions';

import CloudSaveAsDialog from '../../../ProjectsStorage/CloudStorageProvider/CloudSaveAsDialog';
import muiDecorator from '../../ThemeDecorator';

export default {
  title: 'Storage Providers/CloudStorageProvider/CloudSaveAsDialog',
  component: CloudSaveAsDialog,
  decorators: [muiDecorator],
};

export const Default = () => (
  <CloudSaveAsDialog
    nameSuggestion="My project"
    onCancel={() => action('cancel')()}
    onSave={() => action('save')()}
  />
);
