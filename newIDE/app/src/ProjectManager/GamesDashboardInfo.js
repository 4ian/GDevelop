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
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { type Game } from '../Utils/GDevelopServices/Game';
import { ListItem } from '../UI/List';
import { getProjectManagerItemId } from '.';

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
  onShareProject: () => void,
  games: ?Array<Game>,
|};

const GamesDashboardInfo = ({ onShareProject, games }: Props) => {
  const { profile, onOpenLoginDialog } = React.useContext(
    AuthenticatedUserContext
  );
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const onClickShare = React.useCallback(
    () => {
      if (!!profile) {
        onShareProject();
      } else {
        onOpenLoginDialog();
      }
    },
    [profile, onShareProject, onOpenLoginDialog]
  );

  if (games && games.length > 0) {
    return (
      <ListItem
        id={getProjectManagerItemId('manage')}
        primaryText={<Trans>Games Dashboard</Trans>}
        leftIcon={<Graphs />}
        onClick={() => {
          console.log('salut');
        }}
        noPadding
      />
    );
  }

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
              <Graphs />
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
