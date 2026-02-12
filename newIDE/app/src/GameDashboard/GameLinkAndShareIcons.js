// @flow

import * as React from 'react';
import { LineStackLayout } from '../UI/Layout';
import SocialShareButtons from '../UI/ShareDialog/SocialShareButtons';
import ShareLink from '../UI/ShareDialog/ShareLink';
import { Spacer } from '../UI/Grid';

const styles = {
  buttonsContainer: {
    flexShrink: 0,
  },
  columnContainer: { display: 'grid' },
};

const ColumnContainer = ({ children }: {| children: React.Node |}) => (
  // ColumnStackLayout is not used here because the children can't be displayed properly.
  // If children are aligned flex-start, the children overflow on small devices.
  // If children are aligned stretch, the children take all the available space, that we don't want.
  <div style={styles.columnContainer}>{children}</div>
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
      <ShareLink url={url} />
      {display === 'column' && <Spacer />}
      <div style={styles.buttonsContainer}>
        <SocialShareButtons url={url} />
      </div>
    </Layout>
  );
};

export default GameLinkAndShareIcons;
