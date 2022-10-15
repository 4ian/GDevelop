// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import {
  type ExampleShortHeader,
  getExample,
} from '../../Utils/GDevelopServices/Example';
import { isCompatibleWithAsset } from '../../Utils/GDevelopServices/Asset';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import RaisedButtonWithSplitMenu from '../../UI/RaisedButtonWithSplitMenu';
import { getIDEVersion } from '../../Version';
import { ExampleThumbnailOrIcon } from './ExampleThumbnailOrIcon';
import optionalRequire from '../../Utils/OptionalRequire';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { openExampleInWebApp } from './ExampleDialog';
import { UserPublicProfileChip } from '../../UI/User/UserPublicProfileChip';
import HighlightedText from '../../UI/Search/HighlightedText';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import { ResponsiveLineStackLayout } from '../../UI/Layout';

const electron = optionalRequire('electron');

const styles = {
  container: {
    display: 'flex',
    overflow: 'hidden',
    padding: 8,
  },
  button: {
    alignItems: 'flex-start',
    textAlign: 'left',
    flex: 1,
  },
};

type Props = {|
  exampleShortHeader: ExampleShortHeader,
  matches: ?Array<SearchMatch>,
  isOpening: boolean,
  onChoose: () => void,
  onOpen: () => void,
  onHeightComputed: number => void,
|};

export const ExampleListItem = ({
  exampleShortHeader,
  matches,
  isOpening,
  onChoose,
  onOpen,
  onHeightComputed,
}: Props) => {
  // Report the height of the item once it's known.
  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (containerRef.current)
      onHeightComputed(containerRef.current.getBoundingClientRect().height);
  });

  const isCompatible = isCompatibleWithAsset(
    getIDEVersion(),
    exampleShortHeader
  );

  const fetchAndOpenExampleInWebApp = React.useCallback(
    async (i18n: I18nType) => {
      try {
        const example = await getExample(exampleShortHeader);
        openExampleInWebApp(example);
      } catch (error) {
        showErrorBox({
          message:
            i18n._(t`Unable to fetch the example.`) +
            ' ' +
            i18n._(t`Verify your internet connection or try again later.`),
          rawError: error,
          errorId: 'example-load-error',
        });
      }
    },
    [exampleShortHeader]
  );

  const renderExampleField = (field: 'shortDescription' | 'name') => {
    const originalField = exampleShortHeader[field];

    if (!matches) return originalField;
    const nameMatches = matches.filter(match => match.key === field);
    if (nameMatches.length === 0) return originalField;

    return (
      <HighlightedText
        text={originalField}
        matchesCoordinates={nameMatches[0].indices}
      />
    );
  };

  return (
    <div style={styles.container} ref={containerRef}>
      <ResponsiveLineStackLayout noMargin expand>
        <ButtonBase style={styles.button} onClick={onChoose} focusRipple>
          {!!exampleShortHeader.previewImageUrls.length && (
            <ExampleThumbnailOrIcon exampleShortHeader={exampleShortHeader} />
          )}
          <Column expand>
            <Text noMargin>{renderExampleField('name')} </Text>
            {exampleShortHeader.authors && (
              <Line>
                {exampleShortHeader.authors.map(author => (
                  <UserPublicProfileChip user={author} key={author.id} />
                ))}
              </Line>
            )}
            <Text noMargin size="body2">
              {renderExampleField('shortDescription')}
            </Text>
          </Column>
        </ButtonBase>
        <Column noMargin justifyContent="flex-end">
          <Line noMargin justifyContent="flex-end">
            <RaisedButtonWithSplitMenu
              primary
              label={<Trans>Open</Trans>}
              disabled={isOpening || !isCompatible}
              onClick={() => onOpen()}
              buildMenuTemplate={i18n => [
                {
                  label: i18n._(t`Open details`),
                  click: onChoose,
                },
                {
                  label: electron
                    ? i18n._(t`Open in the web-app`)
                    : i18n._(t`Open in a new tab`),
                  click: () => {
                    fetchAndOpenExampleInWebApp(i18n);
                  },
                },
              ]}
            />
          </Line>
        </Column>
      </ResponsiveLineStackLayout>
    </div>
  );
};
