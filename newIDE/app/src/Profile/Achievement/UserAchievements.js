// @flow

import { Trans } from '@lingui/macro';
import React, { useState, useEffect, useCallback } from 'react';

import { Column } from '../../UI/Grid';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import {
  getAchievements,
  type Badge,
  type Achievement,
} from '../../Utils/GDevelopServices/User';

import AchievementList from './AchievementList';
// $FlowFixMe[missing-export] TODO: check that this is the correct way to import SVG in the project. If yes, follow https://github.com/facebook/flow/issues/7121.
import { ReactComponent as Trophy } from './resources/trophy.svg';

type Props = {|
  badges: ?Array<Badge>,
|};

const styles = {
  summary: {
    padding: 20,
    textAlign: 'center',
  },
  leftContainer: {
    flex: 1,
    backgroundColor: '#CCCCCC',
    borderRadius: '20px',
    margin: '20px',
  },
  rightContainer: {
    flex: 2,
  },
};

const UserAchievements = ({ badges }: Props) => {
  const [achievements, setAchievements] = useState<?Array<Achievement>>(null);
  const [displayError, setDisplayError] = useState<boolean>(false);

  const fetchAchievements = useCallback(async () => {
    try {
      setDisplayError(false);
      const achievements = await getAchievements();
      setAchievements(achievements);
    } catch (err) {
      console.log(`Error when fetching achievements: ${err}`);
      setDisplayError(true);
    }
  }, []);

  useEffect(
    () => {
      fetchAchievements();
    },
    [fetchAchievements]
  );

  return (
    <Column>
      <ResponsiveLineStackLayout>
        <div style={styles.leftContainer}>
          <div style={styles.summary}>
            <Trophy height="100px" />
            {displayError ? (
              <Text>
                <Trans>Unexpected error</Trans>
              </Text>
            ) : (
              badges &&
              achievements && (
                <Text size="title">
                  <Trans>
                    {badges.length}/{achievements.length} achievements
                  </Trans>
                </Text>
              )
            )}
          </div>
        </div>
        <div style={styles.rightContainer}>
          {displayError ? (
            <Text>
              <Trans>
                An error happened when loading achievements, please try again
                later.
              </Trans>
            </Text>
          ) : (
            badges &&
            achievements && (
              <AchievementList badges={badges} achievements={achievements} />
            )
          )}
        </div>
      </ResponsiveLineStackLayout>
    </Column>
  );
};

export default UserAchievements;
