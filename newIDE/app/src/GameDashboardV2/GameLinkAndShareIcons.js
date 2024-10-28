// @flow

import * as React from 'react';
import { LineStackLayout } from '../UI/Layout';
import Paper from '../UI/Paper';
import Text from '../UI/Text';
import Link from '../UI/Link';
import Window from '../Utils/Window';
import Copy from '../UI/CustomSvgIcons/Copy';
import IconButton from '../UI/IconButton';
import { copyTextToClipboard } from '../Utils/Clipboard';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import SocialShareButtons from '../UI/ShareDialog/SocialShareButtons';

const styles = {
  linkContainer: {
    display: 'flex',
    padding: '0px 8px',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 4,
  },
};

type Props = {|
  url: string,
|};

const GameLinkAndShareIcons = ({ url }: Props) => {
  return (
    <LineStackLayout
      noMargin
      justifyContent="space-between"
      alignItems="center"
    >
      <Paper style={styles.linkContainer} background="light">
        <LineStackLayout alignItems="center">
          <Text noMargin style={textEllipsisStyle}>
            <Link href={url} onClick={() => Window.openExternalURL(url)}>
              {url.replace('https://', '')}
            </Link>
          </Text>
          <IconButton size="small" onClick={() => copyTextToClipboard(url)}>
            <Copy fontSize="small" />
          </IconButton>
        </LineStackLayout>
      </Paper>
      <SocialShareButtons url={url} />
    </LineStackLayout>
  );
};

export default GameLinkAndShareIcons;
