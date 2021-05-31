// @flow
import * as React from 'react';
import {
  type ExampleShortHeader,
  isCompatibleWithAsset,
} from '../../Utils/GDevelopServices/Asset';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import RaisedButton from '../../UI/RaisedButton';
import { getIDEVersion } from '../../Version';
import { ExampleIcon } from './ExampleIcon';

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
          <RaisedButton
            primary
            label={<Trans>Open</Trans>}
            disabled={isOpening || !isCompatible}
            onClick={() => onOpen()}
          />
        </Column>
      </Line>
    </div>
  );
};
