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
import { Column, Line } from '../UI/Grid';
import { ColumnStackLayout, TextFieldWithButtonLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { useDebounce } from '../Utils/UseDebounce';
import axios from 'axios';
import AlertMessage from '../UI/AlertMessage';
import { Accordion, AccordionBody, AccordionHeader } from '../UI/Accordion';
import { MiniToolbarText } from '../UI/MiniToolbar';
import { MarkdownText } from '../UI/MarkdownText';

type ResourceStoreChooserProps = {
  options: ChooseResourceOptions,
  onChooseResources: (resources: Array<gdResource>) => void,
  createNewResource: () => gdResource,
};

const getUrlsFromInputValue = (value: string, multiSelection: boolean) => {
  const urls = value.split('\n').filter(Boolean);

  return multiSelection ? urls : urls.slice(0, 1);
};

const getDisplayedListOfErroredIndices = dataUrlsErroredBooleanArray => {
  return dataUrlsErroredBooleanArray
    .map((isErrored, index) => {
      if (isErrored) return '#' + (index + 1);
      return null;
    })
    .filter(Boolean)
    .join(', ');
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
  const [dataUrlInputValue, setDataUrlInputValue] = React.useState<string>('');
  const [error, setError] = React.useState<?Error>(null);
  const [dataUrlError, setDataUrlError] = React.useState<?Error>(null);
  const [urlsErroredBooleanArray, setUrlsErroredBooleanArray] = React.useState<
    boolean[]
  >([]);
  const [
    dataUrlsErroredBooleanArray,
    setDataUrlsErroredBooleanArray,
  ] = React.useState<boolean[]>([]);
  const hasErroredUrls = !!urlsErroredBooleanArray.filter(Boolean).length;
  const hasErroredDataUrls = !!dataUrlsErroredBooleanArray.filter(Boolean)
    .length;

  const validateInputValue = useDebounce(
    async ({ value, isDataUrl }: { value: string, isDataUrl: boolean }) => {
      const urls = getUrlsFromInputValue(value, options.multiSelection);
      const setValidationError = isDataUrl ? setDataUrlError : setError;
      const setValidationArrayError = isDataUrl
        ? setDataUrlsErroredBooleanArray
        : setUrlsErroredBooleanArray;

      setValidationError(null);
      setValidationArrayError([]);

      try {
        const responses = await Promise.all(
          urls.map(async url => {
            return await axios.get(url, {
              timeout: 1000,
              validateStatus: status => true,
            });
          })
        );

        setValidationArrayError(
          responses.map(
            response => !(response.status >= 200 && response.status < 400)
          )
        );
      } catch (error) {
        setValidationError(error);
      }
    },
    500
  );

  const onClick = () => {
    const urls = getUrlsFromInputValue(
      `${inputValue}\n${dataUrlInputValue}`,
      options.multiSelection
    );
    onChooseResources(
      urls.map(url => {
        const newResource = createNewResource();
        newResource.setFile(url);
        newResource.setName(path.basename(url));
        newResource.setOrigin('url', url);

        return newResource;
      })
    );
  };

  React.useEffect(
    () => {
      validateInputValue({ value: inputValue, isDataUrl: false });
    },
    [inputValue, validateInputValue]
  );
  React.useEffect(
    () => {
      validateInputValue({ value: dataUrlInputValue, isDataUrl: true });
    },
    [dataUrlInputValue, validateInputValue]
  );

  const canApply =
    !error && !dataUrlError && !hasErroredDataUrls && !hasErroredUrls;

  return (
    <ColumnStackLayout noMargin expand>
      <Line noMargin>
        <TextFieldWithButtonLayout
          renderButton={style => (
            <RaisedButton
              onClick={onClick}
              primary
              label={<Trans>Choose</Trans>}
              style={style}
              disabled={!canApply}
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
                    {getDisplayedListOfErroredIndices(urlsErroredBooleanArray)}.
                    Please check they are correct.
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
      <Accordion>
        <AccordionHeader>
          <MiniToolbarText firstChild>
            <Trans>Advanced options</Trans>{' '}
          </MiniToolbarText>
        </AccordionHeader>
        <AccordionBody>
          <Column noMargin expand>
            <Line>
              <TextFieldWithButtonLayout
                renderButton={style => (
                  <RaisedButton
                    onClick={onClick}
                    primary
                    label={<Trans>Choose</Trans>}
                    style={style}
                    disabled={!canApply}
                  />
                )}
                renderTextField={() => (
                  <SemiControlledTextField
                    floatingLabelText={
                      options.multiSelection ? (
                        <Trans>Data URL(s) (one per line)</Trans>
                      ) : (
                        <Trans>Data URL</Trans>
                      )
                    }
                    value={dataUrlInputValue}
                    onChange={setDataUrlInputValue}
                    multiline={options.multiSelection}
                    rows={1}
                    rowsMax={5}
                    fullWidth
                    errorText={
                      dataUrlError ? (
                        <Trans>
                          There was an error verifying the data URL(s). Please
                          check they are correct.
                        </Trans>
                      ) : hasErroredDataUrls ? (
                        <Trans>
                          Unable to verify data URLs{' '}
                          {getDisplayedListOfErroredIndices(
                            dataUrlsErroredBooleanArray
                          )}
                          . Please check they are correct.
                        </Trans>
                      ) : null
                    }
                  />
                )}
              />
            </Line>
            <AlertMessage kind="info">
              <MarkdownText
                translatableSource={t`You can also specify [Data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs). The resource will be stored in the project file so we recommend you only use this method to add small resources (< 10kB).`}
              />
            </AlertMessage>
          </Column>
        </AccordionBody>
      </Accordion>
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
    name: `url-chooser-${kind}`,
    displayName: t`Use an URL`,
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
