// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import {
  type ResourceSourceComponentProps,
  type ResourceSourceComponentPrimaryActionProps,
  type ResourceSource,
  type ResourceStoreChooserProps,
  allResourceKindsAndMetadata,
  resourcesKindSupportedByResourceStore,
} from './ResourceSource';
import { ResourceStore } from '../AssetStore/ResourceStore';
import path from 'path-browserify';
import { Line } from '../UI/Grid';
import { ColumnStackLayout, TextFieldWithButtonLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { useDebounce } from '../Utils/UseDebounce';
import axios from 'axios';
import AlertMessage from '../UI/AlertMessage';
import { FileToCloudProjectResourceUploader } from './FileToCloudProjectResourceUploader';
import {
  extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl,
  isPublicAssetResourceUrl,
} from '../Utils/GDevelopServices/Asset';
import { DialogPrimaryButton } from '../UI/Dialog';
import ProjectResourcesChooser from './ProjectResources/ProjectResourcesChooser';

const ResourceStoreChooser = ({
  options,
  selectedResourceIndex,
  onSelectResource,
}: ResourceStoreChooserProps) => {
  if (!onSelectResource) return null;
  const { resourceKind } = options;
  if (!resourcesKindSupportedByResourceStore.includes(resourceKind)) {
    return null;
  }

  return (
    <ResourceStore
      selectedResourceIndex={selectedResourceIndex}
      onSelectResource={onSelectResource}
      resourceKind={
        // $FlowIgnore - Flow does not understand the check above restricts the resource kind.
        resourceKind
      }
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
                if (!onChooseResources || !createNewResource) return;
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

const browserResourceSources: Array<ResourceSource> = [
  ...allResourceKindsAndMetadata.map(({ kind, createNewResource }) => {
    const sourceName = `upload-${kind}`;
    return {
      name: sourceName,
      displayName: t`File(s) from your device`,
      displayTab: 'import',
      shouldCreateResource: true,
      shouldGuessAnimationsFromName: true,
      kind,
      renderComponent: (props: ResourceSourceComponentProps) => (
        <FileToCloudProjectResourceUploader
          createNewResource={createNewResource}
          onChooseResources={(resources: Array<gdResource>) =>
            props.onChooseResources({
              selectedResources: resources,
              selectedSourceName: sourceName,
            })
          }
          options={props.options}
          fileMetadata={props.fileMetadata}
          getStorageProvider={props.getStorageProvider}
          key={`url-chooser-${kind}`}
          automaticallyOpenInput={!!props.automaticallyOpenIfPossible}
        />
      ),
    };
  }),
  ...resourcesKindSupportedByResourceStore
    .map(kind => {
      const source = allResourceKindsAndMetadata.find(
        resourceSource => resourceSource.kind === kind
      );
      if (!source) return null;
      const sourceName = `resource-store-${kind}`;
      return {
        name: sourceName,
        displayName: t`Choose from asset store`,
        displayTab: 'standalone',
        shouldCreateResource: true,
        shouldGuessAnimationsFromName: false,
        kind,
        renderComponent: (props: ResourceSourceComponentProps) => (
          <ResourceStoreChooser
            selectedResourceIndex={props.selectedResourceIndex}
            onSelectResource={props.onSelectResource}
            options={props.options}
            key={`resource-store-${kind}`}
          />
        ),
        renderPrimaryAction: ({
          resource,
          onChooseResources,
        }: ResourceSourceComponentPrimaryActionProps) => (
          <DialogPrimaryButton
            primary
            key="add-resource"
            label={
              kind === 'font' ? (
                <Trans>Install font</Trans>
              ) : (
                <Trans>Add to project</Trans>
              )
            }
            disabled={!resource}
            onClick={() => {
              if (!resource) return;
              const chosenResourceUrl = resource.url;
              const newResource = source.createNewResource();
              newResource.setFile(chosenResourceUrl);
              const resourceCleanedName = isPublicAssetResourceUrl(
                chosenResourceUrl
              )
                ? extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl(
                    chosenResourceUrl
                  )
                : path.basename(chosenResourceUrl);
              newResource.setName(resourceCleanedName);
              newResource.setOrigin('gdevelop-asset-store', chosenResourceUrl);

              onChooseResources({
                selectedResources: [newResource],
                selectedSourceName: sourceName,
              });
            }}
          />
        ),
      };
    })
    .filter(Boolean),
  ...allResourceKindsAndMetadata.map(({ kind, createNewResource }) => {
    const sourceName = `project-resources-${kind}`;
    return {
      name: sourceName,
      displayName: t`Project resources`,
      displayTab: 'standalone',
      shouldCreateResource: false,
      shouldGuessAnimationsFromName: false,
      hideInResourceEditor: true,
      kind,
      renderComponent: (props: ResourceSourceComponentProps) => (
        <ProjectResourcesChooser
          project={props.project}
          onResourcesSelected={props.onResourcesSelected}
          resourceKind={kind}
          key={`project-resources-${kind}`}
          multiSelection={props.options.multiSelection}
        />
      ),
      renderPrimaryAction: ({
        selectedResources,
        onChooseResources,
      }: ResourceSourceComponentPrimaryActionProps) => (
        <DialogPrimaryButton
          primary
          key="select-resources"
          label={
            !selectedResources ||
            !selectedResources.length ||
            selectedResources.length === 1 ? (
              <Trans>Select resource</Trans>
            ) : (
              <Trans>Select {selectedResources.length} resources</Trans>
            )
          }
          disabled={!selectedResources || !selectedResources.length}
          onClick={() => {
            if (!selectedResources || !selectedResources.length) return;
            onChooseResources({
              selectedResources,
              selectedSourceName: sourceName,
            });
          }}
        />
      ),
    };
  }),
  ...allResourceKindsAndMetadata.map(({ kind, createNewResource }) => {
    const sourceName = `url-chooser-${kind}`;
    return {
      name: sourceName,
      displayName: t`Use a public URL`,
      displayTab: 'import-advanced',
      shouldCreateResource: true,
      shouldGuessAnimationsFromName: false,
      kind,
      renderComponent: (props: ResourceSourceComponentProps) => (
        <UrlChooser
          createNewResource={createNewResource}
          onChooseResources={(resources: Array<gdResource>) =>
            props.onChooseResources({
              selectedResources: resources,
              selectedSourceName: sourceName,
            })
          }
          options={props.options}
          key={`url-chooser-${kind}`}
        />
      ),
    };
  }),
];

export default browserResourceSources;
