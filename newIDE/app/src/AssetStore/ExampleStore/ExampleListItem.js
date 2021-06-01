// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import {
  type ExampleShortHeader,
  isCompatibleWithAsset,
  getExample,
} from '../../Utils/GDevelopServices/Asset';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import RaisedButtonWithSplitMenu from '../../UI/RaisedButtonWithSplitMenu';
import { getIDEVersion } from '../../Version';
import { ExampleIcon } from './ExampleIcon';
import optionalRequire from '../../Utils/OptionalRequire';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { openExampleInWebApp } from './ExampleDialog';

const electron = optionalRequire('electron');

const styles = {
  container: {
    display: 'flex',
    overflow: 'hidden',
    padding: 8,
  },
  button: {
    textAlign: 'left',
    flex: 1,
  },
};

type Props = {|
  exampleShortHeader: ExampleShortHeader,
  isOpening: boolean,
  onChoose: () => void,
  onOpen: () => void,
  onHeightComputed: number => void,
|};

export const ExampleListItem = ({
  exampleShortHeader,
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

  return (
    <div style={styles.container} ref={containerRef}>
      <Line noMargin expand>
        <ButtonBase
          style={styles.button}
          onClick={() => {
            onChoose();
          }}
          focusRipple
        >
          {!!exampleShortHeader.previewImageUrls.length && (
            <ExampleIcon exampleShortHeader={exampleShortHeader} size={40} />
          )}
          <Column expand>
            <Text noMargin>{exampleShortHeader.name} </Text>
            <Text noMargin size="body2">
              {exampleShortHeader.shortDescription}
            </Text>
          </Column>
        </ButtonBase>
        <Column justifyContent="center">
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
        </Column>
      </Line>
    </div>
  );
};
