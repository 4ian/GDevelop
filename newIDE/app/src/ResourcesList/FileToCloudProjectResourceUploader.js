// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import Paper from '@material-ui/core/Paper';
import { type ChooseResourceOptions } from './ResourceSource';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import AlertMessage from '../UI/AlertMessage';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import {
  type UploadedProjectResourceFiles,
  uploadProjectResourceFiles,
  PROJECT_RESOURCE_MAX_SIZE_IN_BYTES,
} from '../Utils/GDevelopServices/Project';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import { Line, Column } from '../UI/Grid';
import LinearProgress from '../UI/LinearProgress';

const styles = { fileInput: {} };

type FileToCloudProjectResourceUploaderProps = {
  options: ChooseResourceOptions,
  fileMetadata: ?FileMetadata,
  getStorageProvider: () => StorageProvider,
  onChooseResources: (resources: Array<gdResource>) => void,
  createNewResource: () => gdResource,
};

const resourceKindToInputAcceptedFiles = {
  audio: 'audio/*',
  image: 'image/*',
  font: 'font/*',
  video: 'video/*',
  json: 'application/json',
  bitmapFont: '.fnt,.xml',
};

export const FileToCloudProjectResourceUploader = ({
  options,
  fileMetadata,
  getStorageProvider,
  onChooseResources,
  createNewResource,
}: FileToCloudProjectResourceUploaderProps) => {
  const inputRef = React.useRef<?HTMLInputElement>(null);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const [isUploading, setIsUploading] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const hasSelectedFiles = selectedFiles.length > 0;
  const storageProvider = React.useMemo(getStorageProvider, [
    getStorageProvider,
  ]);
  const cloudProjectId = fileMetadata ? fileMetadata.fileIdentifier : null;
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const onUpload = React.useCallback(
    async () => {
      const input = inputRef.current;
      if (!input) return;
      if (!cloudProjectId) return;

      try {
        setIsUploading(true);
        setUploadProgress(0);
        const results: UploadedProjectResourceFiles = await uploadProjectResourceFiles(
          authenticatedUser,
          cloudProjectId,
          selectedFiles,
          (current: number, total: number) => {
            setUploadProgress((current / total) * 100);
          }
        );
        const erroredResults = results.filter(({ error }) => !!error);
        const okResults = results.filter(({ url }) => !!url);
        if (erroredResults.length) {
          throw erroredResults[0];
        } else if (okResults.length) {
          onChooseResources(
            okResults.map(({ url, resourceFile }) => {
              const newResource = createNewResource();
              newResource.setFile(url || '');
              newResource.setName(resourceFile.name);
              newResource.setOrigin('cloud-project-resource', url || '');

              return newResource;
            })
          );
        }
      } catch (error) {
        showErrorBox({
          message:
            'There was an error while uploading some resources. Verify your internet connection or try again later.',
          rawError: error,
          errorId: 'upload-cloud-project-resource-error',
          doNotReport: true,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [
      selectedFiles,
      authenticatedUser,
      onChooseResources,
      createNewResource,
      cloudProjectId,
    ]
  );

  const invalidFiles = selectedFiles
    .map(file => {
      if (file.size > PROJECT_RESOURCE_MAX_SIZE_IN_BYTES) {
        return {
          filename: file.name,
          error: 'too-large',
        };
      }
      return null;
    })
    .filter(Boolean);

  const canUploadWithThisStorageProvider =
    storageProvider.internalName === 'Cloud' && !!fileMetadata;
  const isConnected = !!authenticatedUser.authenticated;
  const canChooseFiles =
    !isUploading && isConnected && canUploadWithThisStorageProvider;
  const canUploadFiles =
    !isUploading &&
    canChooseFiles &&
    hasSelectedFiles &&
    invalidFiles.length === 0;

  return (
    <ColumnStackLayout noMargin>
      {!isConnected ? (
        <AlertMessage kind="warning">
          <Trans>
            Your need to first create your account, or login, to upload your own
            resources.
          </Trans>
        </AlertMessage>
      ) : !canUploadWithThisStorageProvider ? (
        <AlertMessage kind="warning">
          <Trans>
            Your need to first save your game on GDevelop Cloud to upload your
            own resources.
          </Trans>
        </AlertMessage>
      ) : null}
      <Paper variant="outlined">
        <Line expand>
          <Column expand>
            <input
              accept={resourceKindToInputAcceptedFiles[options.resourceKind]}
              style={styles.fileInput}
              multiple={options.multiSelection}
              type="file"
              ref={inputRef}
              disabled={!canChooseFiles}
              onChange={event => {
                const files = [];
                for (let i = 0; i < event.currentTarget.files.length; i++) {
                  files.push(event.currentTarget.files[i]);
                }
                setSelectedFiles(files);
              }}
            />
          </Column>
        </Line>
      </Paper>
      {invalidFiles.map(erroredFile => {
        if (erroredFile.error === 'too-large')
          return (
            <AlertMessage kind="error">
              <Trans>
                The file {erroredFile.filename} is too large. Use files that are
                smaller for your game: each must be less than{' '}
                {PROJECT_RESOURCE_MAX_SIZE_IN_BYTES / 1000 / 1000} MB.
              </Trans>
            </AlertMessage>
          );

        return (
          <AlertMessage kind="error">
            <Trans>The file {erroredFile.filename} is invalid.</Trans>
          </AlertMessage>
        );
      })}
      <LineStackLayout alignItems="center" justifyContent="flex-end" expand>
        {isUploading ? (
          <LinearProgress expand value={uploadProgress} variant="determinate" />
        ) : null}
        <RaisedButton
          onClick={onUpload}
          disabled={!canUploadFiles}
          primary
          label={
            options.multiSelection ? (
              <Trans>Add selected file(s)</Trans>
            ) : (
              <Trans>Add selected file</Trans>
            )
          }
        />
      </LineStackLayout>
    </ColumnStackLayout>
  );
};
