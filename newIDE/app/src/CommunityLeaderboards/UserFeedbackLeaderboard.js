// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import {
  type UserLeaderboard,
  type UserLeaderboardEntry,
} from '../Utils/GDevelopServices/User';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Paper from '../UI/Paper';
import Annotation from '../UI/CustomSvgIcons/Annotation';
import { UserPublicProfileTextWithAvatar } from '../UI/User/UserPublicProfileTextWithAvatar';

type Props = {|
  userLeaderboard: UserLeaderboard | null,
  displayEntriesCount: number,
|};

const styles = {
  avatar: {
    width: 16,
    height: 16,
  },
  paper: {
    flex: 1,
  },
  entryRow: {
    borderBottom: '1px solid black',
  },
  rankColumn: {
    width: 30,
    textAlign: 'center',
  },
  playerColumn: {},
  scoreColumn: {
    width: 30,
    textAlign: 'center',
  },
};

const loadingEntry: UserLeaderboardEntry = {
  userPublicProfile: null,
  count: null,
};

export const UserFeedbackLeaderboard = ({
  userLeaderboard,
  displayEntriesCount,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <I18n>
      {({ i18n }) => (
        <Paper background="medium" style={styles.paper}>
          <ColumnStackLayout noMargin>
            <Text size="sub-title" align="center">
              {userLeaderboard
                ? selectMessageByLocale(
                    i18n,
                    userLeaderboard.displayNameByLocale
                  )
                : '-'}
            </Text>
            <table>
              <thead>
                <tr>
                  <th style={styles.rankColumn}>
                    <Text size="body2" color="secondary">
                      #
                    </Text>
                  </th>
                  <th style={styles.playerColumn}>
                    <Text size="body2" color="secondary" align="left">
                      <Trans>Player</Trans>
                    </Text>
                  </th>
                  <th style={styles.scoreColumn}>
                    <Annotation />
                  </th>
                </tr>
              </thead>
              <tbody>
                {(userLeaderboard
                  ? userLeaderboard.topUserCommentQualityRatings
                  : new Array(displayEntriesCount).fill(loadingEntry)
                )
                  .slice(0, displayEntriesCount)
                  .map((entry, index) => (
                    <tr
                      key={index}
                      style={{
                        ...styles.entryRow,
                        borderColor: gdevelopTheme.toolbar.separatorColor,
                      }}
                    >
                      <td style={styles.rankColumn}>
                        <Text>{index + 1}</Text>
                      </td>
                      <td style={styles.playerColumn}>
                        <UserPublicProfileTextWithAvatar
                          avatarSize={20}
                          user={entry.userPublicProfile}
                          expand
                        />
                      </td>
                      <td style={styles.scoreColumn}>
                        <Text>{entry.count ? entry.count : '-'}</Text>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </ColumnStackLayout>
        </Paper>
      )}
    </I18n>
  );
};
