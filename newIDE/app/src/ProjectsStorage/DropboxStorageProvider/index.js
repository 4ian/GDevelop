// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { type StorageProvider, type FileMetadata } from '../index';
import Dropbox from '../../UI/CustomSvgIcons/Dropbox';

let apisLoaded = false;
let apisLoadingPromise = null;

/**
 * Load Dropbox APIs. Return a fulfilled promise when done.
 */
const initializeApis = (): Promise<void> => {
  if (apisLoaded) {
    return Promise.resolve();
  }

  if (apisLoadingPromise) {
    // Only do a single initialization attempt at a given time.
    return apisLoadingPromise;
  }

  apisLoadingPromise = new Promise((resolve, reject) => {
    reject(new Error('Unimplemented'));
  })
    .then(() => {
      apisLoaded = true;
      apisLoadingPromise = null;
    })
    .catch(error => {
      console.error('Error while loading Dropbox APIs:', error);
      apisLoadingPromise = null;

      throw error;
    });

  return apisLoadingPromise;
};

type DropboxUser = {};

/**
 * Sign in the user to Dropbox, returning the user object after a successful sign up
 * (or if the user is already signed in).
 */
export const authenticate = (): Promise<DropboxUser> => {
  return initializeApis().then(() => {
    throw new Error('Unimplemented');
  });
};

/**
 * A storage that is using Dropbox to open and store files.
 */
export default ({
  internalName: 'Dropbox',
  name: t`Dropbox (coming soon)`,
  disabled: true,
  renderIcon: props => <Dropbox fontSize={props.size} />,
  createOperations: ({ setDialog, closeDialog }) => {
    initializeApis().catch(() => {});

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
