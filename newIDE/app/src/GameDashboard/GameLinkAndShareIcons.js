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
    minWidth: 0,
  },
  buttonsContainer: {
    flexShrink: 0,
  },
};

const ColumnContainer = ({ children }: {| children: React.Node |}) => (
  // ColumnStackLayout is not used here because the children can't be displayed properly.
  // If children are aligned flex-start, the children overflow on small devices.
  // If children are aligned stretch, the children take all the available space, that we don't want.
  <div>{children}</div>
);
const LineContainer = ({ children }: {| children: React.Node |}) => (
  <LineStackLayout
    noMargin
    justifyContent="space-between"
    alignItems={'center'}
  >
    {children}
  </LineStackLayout>
);

type Props = {|
  url: string,
  display: 'column' | 'line',
|};

const GameLinkAndShareIcons = ({ url, display }: Props) => {
  const Layout = display === 'column' ? ColumnContainer : LineContainer;
  return (
    <Layout>
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
      <div style={styles.buttonsContainer}>
        <SocialShareButtons url={url} />
      </div>
    </Layout>
  );
};

export default GameLinkAndShareIcons;
