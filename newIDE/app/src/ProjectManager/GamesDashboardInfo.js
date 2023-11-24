// @flow

import * as React from 'react';

import Link from '../UI/Link';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Graphs from '../UI/CustomSvgIcons/Graphs';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { getHelpLink } from '../Utils/HelpLink';
import Window from '../Utils/Window';
import { Trans } from '@lingui/macro';
import Publish from '../UI/CustomSvgIcons/Publish';
import Paper from '../UI/Paper';

const publishingWikiArticle = getHelpLink('/publishing/');

const styles = {
  gamesDashboardInfoContainer: {
    border: '1px solid',
    padding: 8,
    margin: 4,
  },
  gamesDashboardInfoTextContainer: {
    opacity: 0.7,
  },
};

type Props = {|
  onClickShare: () => void,
|};

const GamesDashboardInfo = ({ onClickShare }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <Paper
      square={false}
      background="dark"
      style={{
        ...styles.gamesDashboardInfoContainer,
        borderColor: gdevelopTheme.toolbar.separatorColor,
      }}
    >
      <ColumnStackLayout noMargin>
        <div style={styles.gamesDashboardInfoTextContainer}>
          <ColumnStackLayout noMargin>
            <LineStackLayout noMargin alignItems="center">
              <Graphs fontSize="medium" />
              <Text noMargin>
                <Trans>Games Dashboard</Trans>
              </Text>
            </LineStackLayout>
            <Text noMargin>
              <Trans>
                Share your project online to unlock player engagement analytics,
                player feedback and other functionalities.
              </Trans>
            </Text>
          </ColumnStackLayout>
        </div>
        <Text noMargin>
          <Link
            href={publishingWikiArticle}
            onClick={() => Window.openExternalURL(publishingWikiArticle)}
          >
            <Trans>Learn more</Trans>
          </Link>
        </Text>
        <RaisedButton
          primary
          label={<Trans>Share</Trans>}
          icon={<Publish />}
          onClick={onClickShare}
        />
      </ColumnStackLayout>
    </Paper>
  );
};

export default GamesDashboardInfo;
