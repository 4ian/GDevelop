// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { type StorageProvider, type FileMetadata } from '../index';
import Cloud from '@material-ui/icons/Cloud';

/**
 * A storage that is using OneDrive to open and store files.
 */
const FakeCloudStorageProvider = ({
  internalName: 'FakeCloud',
  name: t`GDevelop cloud storage (coming soon)`,
  disabled: true,
  renderIcon: () => <Cloud />,
  createOperations: () => {
    return {
      doesInitialOpenRequireUserInteraction: true,
      onOpen: (
        fileMetadata: FileMetadata
      ): Promise<{|
        content: Object,
      |}> => {
        return Promise.reject(new Error('Unimplemented'));
      },
      onOpenWithPicker: (): Promise<?FileMetadata> => {
        return Promise.reject(new Error('Unimplemented'));
      },
      onSaveProject: (project: gdProject, fileMetadata: FileMetadata) => {
        return Promise.reject(new Error('Unimplemented'));
      },
      onSaveProjectAs: (project: gdProject, fileMetadata: ?FileMetadata) => {
        return Promise.reject(new Error('Unimplemented'));
      },
    };
  },
}: StorageProvider);

export default FakeCloudStorageProvider;
