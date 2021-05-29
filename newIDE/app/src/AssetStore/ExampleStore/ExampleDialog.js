// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import {
  type ExampleShortHeader,
  type Example,
  isCompatibleWithAsset,
  getExample,
} from '../../Utils/GDevelopServices/Asset';
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

type Props = {|
  exampleShortHeader: ExampleShortHeader,
  isOpening: boolean,
  onClose: () => void,
  onOpen: () => void,
|};

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
          <FlatButton
            label={
              !isCompatible ? (
                <Trans>Not compatible</Trans>
              ) : (
                <Trans>Open</Trans>
              )
            }
            primary
            onClick={onOpen}
            disabled={isOpening || !isCompatible}
          />
        </LeftLoader>,
      ]}
      cannotBeDismissed={false}
      open
      onRequestClose={onClose}
    >
      <ColumnStackLayout expand noMargin>
        {!isCompatible && (
          <AlertMessage kind="error">
            <Trans>
              Unfortunately, this example requires a newer version of GDevelop
              to work. Upgrade GDevelop to be able to use this extension in your
              project.
            </Trans>
          </AlertMessage>
        )}
        <Line alignItems="center" noMargin>
          {/* <ExtensionIcon
              exampleShortHeader={exampleShortHeader}
              size={40}
            /> */}
          <Column expand>
            <Text noMargin size="title">
              {exampleShortHeader.name}
            </Text>
          </Column>
        </Line>
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
