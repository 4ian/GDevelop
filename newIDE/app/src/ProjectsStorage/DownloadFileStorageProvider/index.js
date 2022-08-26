// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { type StorageProvider, type FileMetadata } from '../index';
import DownloadSaveAsDialog from './DownloadSaveAsDialog';
import SaveAlt from '@material-ui/icons/SaveAlt';

/**
 * "Storage" allowing to download a copy of the game.
 * Used for the web-app.
 */
export default ({
  internalName: 'DownloadFile',
  name: t`Download a copy`,
  renderIcon: props => <SaveAlt fontSize={props.size} />,
  hiddenInOpenDialog: true,
  createOperations: ({ setDialog, closeDialog }) => ({
    onSaveProjectAs: async (
      project: gdProject,
      fileMetadata: ?FileMetadata,
      options
    ) => {
      if (options && options.onStartSaving) options.onStartSaving();
      await options.onMoveResources();

      return new Promise(resolve => {
        setDialog(() => (
          <DownloadSaveAsDialog
            onDone={() => {
              closeDialog();
              resolve({ wasSaved: false });
            }}
            project={project}
          />
        ));
      });
    },
  }),
}: StorageProvider);
