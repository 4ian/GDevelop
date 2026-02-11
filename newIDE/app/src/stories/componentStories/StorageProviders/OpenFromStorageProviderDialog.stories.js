// @flow

import * as React from 'react';

import { action } from '@storybook/addon-actions';

import OpenFromStorageProviderDialogComponent from '../../../ProjectsStorage/OpenFromStorageProviderDialog';
import LocalFileStorageProvider from '../../../ProjectsStorage/LocalFileStorageProvider';

export default {
  title: 'Storage Providers/Openers',
  component: OpenFromStorageProviderDialogComponent,
};

export const OpenFromStorageProviderDialog = () => (
  <OpenFromStorageProviderDialogComponent
    storageProviders={[LocalFileStorageProvider]}
    onChooseProvider={action('onChooseProvider')}
    onClose={action('onClose')}
  />
);
