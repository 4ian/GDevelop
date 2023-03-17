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
import PlaceholderError from '../../UI/PlaceholderError';
import { MarkdownText } from '../../UI/MarkdownText';
import Text from '../../UI/Text';
import AlertMessage from '../../UI/AlertMessage';
import { getIDEVersion } from '../../Version';
import { Column, Line } from '../../UI/Grid';
import Divider from '@material-ui/core/Divider';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import { ExampleThumbnailOrIcon } from './ExampleThumbnailOrIcon';
import RaisedButtonWithSplitMenu from '../../UI/RaisedButtonWithSplitMenu';
import Window from '../../Utils/Window';
import optionalRequire from '../../Utils/OptionalRequire';
import { UserPublicProfileChip } from '../../UI/User/UserPublicProfileChip';
import { ExampleDifficultyChip } from '../../UI/ExampleDifficultyChip';
import { ExampleSizeChip } from '../../UI/ExampleSizeChip';
const isDev = Window.isDev();

const electron = optionalRequire('electron');

type Props = {|
  exampleShortHeader: ExampleShortHeader,
  isOpening: boolean,
  onClose: () => void,
  onOpen: () => void,
|};

export const openExampleInWebApp = (example: Example) => {
  Window.openExternalURL(
    `${
      isDev ? 'http://localhost:3000' : 'https://editor.gdevelop.io'
    }/?project=${example.projectFileUrl}`
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
      title={exampleShortHeader.name}
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
        <ResponsiveLineStackLayout alignItems="center" noMargin>
          {hasIcon ? (
            <ExampleThumbnailOrIcon exampleShortHeader={exampleShortHeader} />
          ) : null}
          <Column noMargin>
            {
              <Line>
                <div style={{ flexWrap: 'wrap' }}>
                  {exampleShortHeader.difficultyLevel && (
                    <ExampleDifficultyChip
                      difficultyLevel={exampleShortHeader.difficultyLevel}
                    />
                  )}
                  {exampleShortHeader.codeSizeLevel && (
                    <ExampleSizeChip
                      codeSizeLevel={exampleShortHeader.codeSizeLevel}
                    />
                  )}
                  {exampleShortHeader.authors &&
                    exampleShortHeader.authors.map(author => (
                      <UserPublicProfileChip
                        user={author}
                        key={author.id}
                        isClickable
                      />
                    ))}
                </div>
              </Line>
            }
            <Text noMargin>{exampleShortHeader.shortDescription}</Text>
          </Column>
        </ResponsiveLineStackLayout>

        {example && example.description && (
          <Column noMargin>
            <Divider />
            <Text size="body" displayInlineAsSpan>
              <MarkdownText source={example.description} />
            </Text>
          </Column>
        )}
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
