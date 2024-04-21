// @flow

import * as React from 'react';

import { action } from '@storybook/addon-actions';

import CloudSaveAsDialog from '../../../ProjectsStorage/CloudStorageProvider/CloudSaveAsDialog';

export default {
  title: 'Storage Providers/CloudStorageProvider/CloudSaveAsDialog',
  component: CloudSaveAsDialog,
};

export const Default = () => (
  <CloudSaveAsDialog
    nameSuggestion="My project"
    onCancel={() => action('cancel')()}
    onSave={() => action('save')()}
  />
);
