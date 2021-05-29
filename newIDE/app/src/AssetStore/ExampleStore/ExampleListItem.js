// @flow
import * as React from 'react';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Asset';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import FlatButton from '../../UI/FlatButton';

const styles = {
  container: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    padding: 8,
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

  return (
    <div style={styles.container} ref={containerRef}>
      <Line noMargin expand>
        {/* <ExtensionIcon
          exampleShortHeader={exampleShortHeader}
          size={40}
        /> */}
        <Column expand>
          <Text noMargin>{exampleShortHeader.name} </Text>
          <Text noMargin size="body2">
            {exampleShortHeader.shortDescription}
          </Text>
        </Column>
        <Column justifyContent="center">
          {/* TODO: More button, open in web-app button ? */}
          <FlatButton
            label={<Trans>Open</Trans>}
            disabled={isOpening}
            onClick={() => onOpen()}
          />
        </Column>
      </Line>
    </div>
  );
};
