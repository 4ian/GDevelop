// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { type StorageProvider, type FileMetadata } from '../index';
import DownloadSaveAsDialog from './DownloadSaveAsDialog';
import SaveAlt from '@material-ui/icons/SaveAlt';
import UnsavedChangesContext from '../../MainFrame/UnsavedChangesContext';
/**
 * "Storage" allowing to download a copy of the game.
 * Used for the web-app.
 */
export default ({
  internalName: 'DownloadFile',
  name: t`Download a copy`,
  renderIcon: () => <SaveAlt />,
  hiddenInOpenDialog: true,
  createOperations: ({ setDialog, closeDialog }) => ({
    onSaveProjectAs: (project: gdProject, fileMetadata: ?FileMetadata) => {
      return new Promise(resolve => {
        setDialog(() => (
          <UnsavedChangesContext.Consumer>
            {unsavedChangesManagement => (
              <DownloadSaveAsDialog
                onDone={() => {
                  unsavedChangesManagement.sealUnsavedChanges();
                  closeDialog();
                  resolve({ wasSaved: false, fileMetadata });
                }}
                project={project}
              />
            )}
          </UnsavedChangesContext.Consumer>
        ));
      });
    },
  }),
}: StorageProvider);
