// @flow

import * as React from 'react';

import { action } from '@storybook/addon-actions';

import GoogleDriveSaveAsDialog from '../../../ProjectsStorage/GoogleDriveStorageProvider/GoogleDriveSaveAsDialog';

export default {
  title: 'Storage Providers/GoogleDriveStorageProvider/GoogleDriveSaveAsDialog',
  component: GoogleDriveSaveAsDialog,
};

export const DefaultFakePickedFileSaveWorking = () => (
  <GoogleDriveSaveAsDialog
    onShowFilePicker={() =>
      Promise.resolve({
        type: 'FILE',
        id: 'fake-id',
        name: 'Fake Google Drive file',
        parentId: 'fake-parent-id',
      })
    }
    onCancel={action('cancel')}
    onSave={() => Promise.resolve()}
  />
);
DefaultFakePickedFileSaveWorking.storyName =
  'default, fake picked file, save working';

export const DefaultFakePickedFolderSaveWorking = () => (
  <GoogleDriveSaveAsDialog
    onShowFilePicker={() =>
      Promise.resolve({
        type: 'FOLDER',
        id: 'fake-id',
        name: 'Fake Google Drive file',
      })
    }
    onCancel={action('cancel')}
    onSave={() => Promise.resolve()}
  />
);
DefaultFakePickedFolderSaveWorking.storyName =
  'default, fake picked folder, save working';

export const DefaultErrorWhenPickingFileFolder = () => (
  <GoogleDriveSaveAsDialog
    onShowFilePicker={() => Promise.reject(new Error('fake-error'))}
    onCancel={action('cancel')}
    onSave={() => Promise.resolve()}
  />
);
DefaultErrorWhenPickingFileFolder.storyName =
  'default, error when picking file/folder';

export const DefaultErrorWhileSaving = () => (
  <GoogleDriveSaveAsDialog
    onShowFilePicker={() =>
      Promise.resolve({
        type: 'FILE',
        id: 'fake-id',
        name: 'Fake Google Drive file',
        parentId: 'fake-parent-id',
      })
    }
    onCancel={action('cancel')}
    onSave={() => Promise.reject(new Error('fake-error'))}
  />
);
DefaultErrorWhileSaving.storyName = 'default, error while saving';
