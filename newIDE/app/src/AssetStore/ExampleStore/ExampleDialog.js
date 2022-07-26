// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import {
  type ExampleShortHeader,
  type Example,
  getExample,
} from '../../Utils/GDevelopServices/Example';
import { isCompatibleWithAsset } from '../../Utils/GDevelopServices/Asset';
import LeftLoader from '../../UI/LeftLoader';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import PlaceholderError from '../../UI/PlaceholderError';
import { MarkdownText } from '../../UI/MarkdownText';
import Text from '../../UI/Text';
import AlertMessage from '../../UI/AlertMessage';
import { getIDEVersion } from '../../Version';
import { Column, Line } from '../../UI/Grid';
import { Divider } from '@material-ui/core';
import { ColumnStackLayout } from '../../UI/Layout';
import { ExampleThumbnailOrIcon } from './ExampleThumbnailOrIcon';
import RaisedButtonWithSplitMenu from '../../UI/RaisedButtonWithSplitMenu';
import Window from '../../Utils/Window';
import optionalRequire from '../../Utils/OptionalRequire';
import { UserPublicProfileChip } from '../../UI/User/UserPublicProfileChip';

const electron = optionalRequire('electron');

type Props = {|
  exampleShortHeader: ExampleShortHeader,
  isOpening: boolean,
  onClose: () => void,
  onOpen: () => void,
|};

export const openExampleInWebApp = (example: Example) => {
  Window.openExternalURL(
    `https://editor.gdevelop-app.com/?project=${example.projectFileUrl}`
  );
};

export function ExampleDialog({
  isOpening,
  exampleShortHeader,
  onClose,
  onOpen,
}: Props) {
  const [error, setError] = React.useState<?Error>(null);
  const [example, setExample] = React.useState<?Example>(null);

  const loadExample = React.useCallback(
    async () => {
      setError(null);
      try {
        const example = await getExample(exampleShortHeader);
        setExample(example);
      } catch (error) {
        setError(error);
      }
    },
    [exampleShortHeader]
  );

  React.useEffect(
    () => {
      loadExample();
    },
    [loadExample]
  );

  const isCompatible = isCompatibleWithAsset(
    getIDEVersion(),
    exampleShortHeader
  );
  const hasIcon = exampleShortHeader.previewImageUrls.length > 0;

  const canOpenExample = !isOpening && isCompatible;
  const onOpenExample = React.useCallback(
    () => {
      if (canOpenExample) onOpen();
    },
    [onOpen, canOpenExample]
  );

  return (
    <Dialog
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Back</Trans>}
          primary={false}
          onClick={onClose}
          disabled={isOpening}
        />,
        <LeftLoader isLoading={isOpening} key="open">
          <RaisedButtonWithSplitMenu
            label={
              !isCompatible ? (
                <Trans>Not compatible</Trans>
              ) : (
                <Trans>Open</Trans>
              )
            }
            primary
            onClick={onOpenExample}
            disabled={!canOpenExample}
            buildMenuTemplate={i18n => [
              {
                label: electron
                  ? i18n._(t`Open in the web-app`)
                  : i18n._(t`Open in a new tab`),
                disabled: !example,
                click: () => {
                  if (example) openExampleInWebApp(example);
                },
              },
            ]}
          />
        </LeftLoader>,
      ]}
      open
      cannotBeDismissed={isOpening}
      onRequestClose={onClose}
      onApply={onOpenExample}
    >
      <ColumnStackLayout expand noMargin>
        {!isCompatible && (
          <AlertMessage kind="error">
            <Trans>
              Unfortunately, this example requires a newer version of GDevelop
              to work. Update GDevelop to be able to open this example.
            </Trans>
          </AlertMessage>
        )}
        <Line alignItems="center" noMargin>
          {hasIcon ? (
            <ExampleThumbnailOrIcon exampleShortHeader={exampleShortHeader} />
          ) : null}
          <Column expand noMargin={!hasIcon}>
            <Text noMargin size="block-title">
              {exampleShortHeader.name}
            </Text>
          </Column>
        </Line>
        {exampleShortHeader.authors && (
          <Line>
            {exampleShortHeader.authors.map(author => (
              <UserPublicProfileChip
                user={author}
                key={author.id}
                isClickable
              />
            ))}
          </Line>
        )}
        <Text noMargin>{exampleShortHeader.shortDescription}</Text>
        <Divider />
        {example && (
          <MarkdownText source={example.description} isStandaloneText />
        )}
        {!example && !error && <PlaceholderLoader />}
        {!example && error && (
          <PlaceholderError onRetry={loadExample}>
            <Trans>
              Can't load the example. Verify your internet connection or try
              again later.
            </Trans>
          </PlaceholderError>
        )}
      </ColumnStackLayout>
    </Dialog>
  );
}
