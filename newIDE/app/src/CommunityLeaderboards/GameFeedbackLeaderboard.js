// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import {
  type GameLeaderboard,
  type GameLeaderboardEntry,
  getPublicGameUrl,
} from '../Utils/GDevelopServices/Game';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Paper from '../UI/Paper';
import Annotation from '../UI/CustomSvgIcons/Annotation';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import ButtonBase from '@material-ui/core/ButtonBase';
import Skeleton from '@material-ui/lab/Skeleton';
import Window from '../Utils/Window';

type Props = {|
  gameLeaderboard: GameLeaderboard | null,
  displayEntriesCount: number,
|};

const thumbnailWidth = 100;
const thumbnailHeight = 28;

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
  gameColumn: {},
  scoreColumn: {
    width: 30,
    textAlign: 'center',
  },
  gameThumbnailContainer: {
    width: thumbnailWidth,
    height: thumbnailHeight,
    display: 'inline-block',
    overflow: 'hidden',
    verticalAlign: 'middle',
    marginRight: 5,
  },
  gameThumbnail: {
    width: thumbnailWidth,
    height: thumbnailHeight,
    objectFit: 'cover',
  },
  fullWidthButtonSupportingEllipsisInATable: {
    justifyContent: 'flex-start',
    height: 32,
    // This is required for a text to have ellipsis in a table cell.
    width: 0,
    minWidth: '100%',
  },
};

const loadingEntry: GameLeaderboardEntry = {
  publicGame: null,
  count: null,
};

export const GameFeedbackLeaderboard = ({
  gameLeaderboard,
  displayEntriesCount,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <I18n>
      {({ i18n }) => (
        <Paper background="medium" style={styles.paper}>
          <ColumnStackLayout noMargin>
            <Text size="sub-title" align="center">
              {gameLeaderboard
                ? selectMessageByLocale(
                    i18n,
                    gameLeaderboard.displayNameByLocale
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
                  <th style={styles.gameColumn}>
                    <Text size="body2" color="secondary" align="left">
                      <Trans>Game</Trans>
                    </Text>
                  </th>
                  <th style={styles.scoreColumn}>
                    <Annotation />
                  </th>
                </tr>
              </thead>
              <tbody>
                {(gameLeaderboard
                  ? gameLeaderboard.topGameCommentQualityRatings
                  : new Array(displayEntriesCount).fill(loadingEntry)
                )
                  .slice(0, displayEntriesCount)
                  .map((entry, index) => {
                    const publicGameUrl = getPublicGameUrl(entry.publicGame);
                    const title = entry.publicGame
                      ? entry.publicGame.gameName
                      : '';

                    return (
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
                        <td style={styles.gameColumn}>
                          {entry.publicGame ? (
                            <ButtonBase
                              onClick={
                                publicGameUrl
                                  ? () => Window.openExternalURL(publicGameUrl)
                                  : undefined
                              }
                              style={
                                styles.fullWidthButtonSupportingEllipsisInATable
                              }
                            >
                              <Text
                                style={textEllipsisStyle}
                                noMargin
                                tooltip={title}
                              >
                                {entry.publicGame &&
                                entry.publicGame.thumbnailUrl ? (
                                  <div style={styles.gameThumbnailContainer}>
                                    <img
                                      src={entry.publicGame.thumbnailUrl}
                                      style={styles.gameThumbnail}
                                      alt={title}
                                      title={title}
                                    />
                                  </div>
                                ) : null}
                                {title}
                              </Text>
                            </ButtonBase>
                          ) : (
                            <Skeleton
                              variant="rect"
                              width={thumbnailWidth}
                              height={thumbnailHeight}
                            />
                          )}
                        </td>
                        <td style={styles.scoreColumn}>
                          <Text>{entry.count ? entry.count : '-'}</Text>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </ColumnStackLayout>
        </Paper>
      )}
    </I18n>
  );
};
