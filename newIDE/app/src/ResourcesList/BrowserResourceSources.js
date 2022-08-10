// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import {
  type ChooseResourceOptions,
  type ResourceSourceComponentProps,
  type ResourceSource,
  allResourceKindsAndMetadata,
} from './ResourceSource';
import { ResourceStore } from '../AssetStore/ResourceStore';
import path from 'path';
import { Line } from '../UI/Grid';
import { ColumnStackLayout, TextFieldWithButtonLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { useDebounce } from '../Utils/UseDebounce';
import axios from 'axios';
import AlertMessage from '../UI/AlertMessage';
import { uploadProjectResourceFiles } from '../Utils/GDevelopServices/Project';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { showErrorBox } from '../UI/Messages/MessageBox';
import {
  type StorageProvider,
  type FileMetadata,
} from '../ProjectsStorage';

type ResourceStoreChooserProps = {
  options: ChooseResourceOptions,
  onChooseResources: (resources: Array<gdResource>) => void,
  createNewResource: () => gdResource,
};

const ResourceStoreChooser = ({
  options,
  onChooseResources,
  createNewResource,
}: ResourceStoreChooserProps) => {
  return (
    <ResourceStore
      onChoose={resource => {
        const chosenResourceUrl = resource.url;
        const newResource = createNewResource();
        newResource.setFile(chosenResourceUrl);
        newResource.setName(path.basename(chosenResourceUrl));
        newResource.setOrigin('gdevelop-asset-store', chosenResourceUrl);

        onChooseResources([newResource]);
      }}
      resourceKind={options.resourceKind}
    />
  );
};

export const UrlChooser = ({
  options,
  onChooseResources,
  createNewResource,
}: ResourceStoreChooserProps) => {
  const [inputValue, setInputValue] = React.useState('');
  const [error, setError] = React.useState<?Error>(null);
  const [urlsErroredBooleanArray, setUrlsErroredBooleanArray] = React.useState<
    boolean[]
  >([]);
  const hasErroredUrls = !!urlsErroredBooleanArray.filter(Boolean).length;

  const validateInputValue = useDebounce(async (inputValue: string) => {
    const urls = options.multiSelection
      ? inputValue.split('\n').filter(Boolean)
      : [inputValue];
    setError(null);
    setUrlsErroredBooleanArray([]);

    try {
      const responses = await Promise.all(
        urls.map(async url => {
          return await axios.get(url, {
            timeout: 1000,
            validateStatus: status => true,
          });
        })
      );

      setUrlsErroredBooleanArray(
        responses.map(
          response => !(response.status >= 200 && response.status < 400)
        )
      );
    } catch (error) {
      setError(error);
    }
  }, 500);

  React.useEffect(
    () => {
      validateInputValue(inputValue);
    },
    [inputValue, validateInputValue]
  );

  return (
    <ColumnStackLayout noMargin expand>
      <Line noMargin>
        <TextFieldWithButtonLayout
          renderButton={style => (
            <RaisedButton
              onClick={() => {
                const urls = options.multiSelection
                  ? inputValue.split('\n').filter(Boolean)
                  : [inputValue];

                onChooseResources(
                  urls.map(url => {
                    const newResource = createNewResource();
                    newResource.setFile(url);
                    newResource.setName(path.basename(url));
                    newResource.setOrigin('url', url);

                    return newResource;
                  })
                );
              }}
              primary
              label={<Trans>Choose</Trans>}
              style={style}
              disabled={!!error || hasErroredUrls}
            />
          )}
          renderTextField={() => (
            <SemiControlledTextField
              floatingLabelText={
                options.multiSelection ? (
                  <Trans>Resource(s) URL(s) (one per line)</Trans>
                ) : (
                  <Trans>Resource URL</Trans>
                )
              }
              value={inputValue}
              onChange={setInputValue}
              multiline={options.multiSelection}
              rows={1}
              rowsMax={5}
              fullWidth
              errorText={
                error ? (
                  <Trans>
                    There was an error verifying the URL(s). Please check they
                    are correct.
                  </Trans>
                ) : hasErroredUrls ? (
                  <Trans>
                    Unable to verify URLs{' '}
                    {urlsErroredBooleanArray
                      .map((isErrored, index) => {
                        if (isErrored) return '#' + (index + 1);
                        return null;
                      })
                      .filter(Boolean)
                      .join(', ')}
                    . Please check they are correct.
                  </Trans>
                ) : null
              }
            />
          )}
        />
      </Line>
      <AlertMessage kind="warning">
        <Trans>
          The URLs must be public and stay accessible while you work on this
          project - they won't be stored inside the project file. When exporting
          a game, the resources pointed by these URLs will be downloaded and
          stored inside the game.
        </Trans>
      </AlertMessage>
    </ColumnStackLayout>
  );
};

type LocalFileToCloudProjectResourceUploaderProps = {
  options: ChooseResourceOptions,
  fileMetadata: FileMetadata,
  getStorageProvider: () => StorageProvider,
  onChooseResources: (resources: Array<gdResource>) => void,
  createNewResource: () => gdResource,
};

export const LocalFileToCloudProjectResourceUploader = ({
  options,
  fileMetadata,
  getStorageProvider,
  onChooseResources,
  createNewResource,
}: LocalFileToCloudProjectResourceUploaderProps) => {
  const inputRef = React.useRef<?HTMLInputElement>(null);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const [isUploading, setIsUploading] = React.useState(false);
  const storageProvider = React.useMemo(getStorageProvider, [getStorageProvider]);
  const cloudProjectId = fileMetadata.fileIdentifier;
  const onUpload = React.useCallback(
    async () => {
      const input = inputRef.current;
      if (!input) return;

      const files = [];
      for (let i = 0; i < input.files.length; i++) {
        files.push(input.files[i]);
      }

      try {
        setIsUploading(true);
        const { urls, errors } = await uploadProjectResourceFiles(
          authenticatedUser,
          cloudProjectId,
          files
        );
        if (errors.length) {
          // TODO: handle only some resources were sent.
          showErrorBox({
            message:
              'There was an error while uploading some resources. Verify your internet connection or try again later.',
            rawError: errors[0],
            errorId: 'upload-cloud-project-resource-error',
          });
        }
        if (urls.length) {
          onChooseResources(
            urls.map(url => {
              const newResource = createNewResource();
              newResource.setFile(url);
              newResource.setName(path.basename(url));
              newResource.setOrigin('cloud-project-resource', url);

              return newResource;
            })
          );
        }
      } catch (error) {
      } finally {
        setIsUploading(false);
      }
    },
    [authenticatedUser, onChooseResources, createNewResource, cloudProjectId]
  );

  const canUploadResources = !isUploading && !!authenticatedUser.profile && storageProvider.internalName === 'Cloud';
  // TODO: Show a specific message when not authenticated
  // TODO: Show a specific message storage provider is not cloud.

  return (
    <ColumnStackLayout>
      <input
        accept="image/*"
        style={{}}
        multiple={options.multiSelection}
        type="file"
        ref={inputRef}
        disabled={!canUploadResources}
      />
      <RaisedButton
        onClick={onUpload}
        disabled={!canUploadResources}
        primary
        label={<Trans>Choose</Trans>}
      />
    </ColumnStackLayout>
  );
};

const browserResourceSources: Array<ResourceSource> = [
  ...allResourceKindsAndMetadata.map(({ kind, createNewResource }) => ({
    name: `resource-store-${kind}`,
    displayName: t`Choose from asset store`,
    displayTab: 'standalone',
    kind,
    renderComponent: (props: ResourceSourceComponentProps) => (
      <ResourceStoreChooser
        createNewResource={createNewResource}
        onChooseResources={props.onChooseResources}
        options={props.options}
        key={`resource-store-${kind}`}
      />
    ),
  })),
  ...allResourceKindsAndMetadata.map(({ kind, createNewResource }) => ({
    name: `upload-${kind}`,
    displayName: t`File(s) from your device`,
    displayTab: 'import',
    kind,
    // TODO: check the storage provider
    renderComponent: (props: ResourceSourceComponentProps) => (
      <LocalFileToCloudProjectResourceUploader
        createNewResource={createNewResource}
        onChooseResources={props.onChooseResources}
        options={props.options}
        fileMetadata={props.fileMetadata}
        getStorageProvider={props.getStorageProvider}
        key={`url-chooser-${kind}`}
      />
    ),
  })),
  ...allResourceKindsAndMetadata.map(({ kind, createNewResource }) => ({
    name: `url-chooser-${kind}`,
    displayName: t`Use a public URL`,
    displayTab: 'import',
    kind,
    renderComponent: (props: ResourceSourceComponentProps) => (
      <UrlChooser
        createNewResource={createNewResource}
        onChooseResources={props.onChooseResources}
        options={props.options}
        key={`url-chooser-${kind}`}
      />
    ),
  })),
];

export default browserResourceSources;
