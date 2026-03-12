// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import {
  type ResourceSourceComponentProps,
  type ResourceSourceComponentPrimaryActionProps,
  type ResourceSource,
  type ResourceStoreChooserProps,
  allResourceKindsAndMetadata,
} from './ResourceSource';
import path from 'path-browserify';
import { Line } from '../UI/Grid';
import { ColumnStackLayout, TextFieldWithButtonLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { useDebounce } from '../Utils/UseDebounce';
import axios from 'axios';
import AlertMessage from '../UI/AlertMessage';
import { FileToCloudProjectResourceUploader } from './FileToCloudProjectResourceUploader';
import { DialogPrimaryButton } from '../UI/Dialog';
import ProjectResourcesChooser from './ProjectResources/ProjectResourcesChooser';

export const UrlChooser = ({
  options,
  onChooseResources,
  createNewResource,
}: ResourceStoreChooserProps): React.Node => {
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
          // $FlowFixMe[underconstrained-implicit-instantiation]
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
      // $FlowFixMe[incompatible-type]
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
  ...allResourceKindsAndMetadata.map(({ kind, createNewResource }) => {
    const sourceName = `project-resources-${kind}`;
    // $FlowFixMe[incompatible-type]
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
          // $FlowFixMe[incompatible-type]
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
    // $FlowFixMe[incompatible-type]
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
