// @flow

import { Trans } from '@lingui/macro';
import React, { useState, useEffect, useCallback } from 'react';
import AlertMessage from '../../UI/AlertMessage';

import { Column, Line } from '../../UI/Grid';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import {
  getAchievements,
  type Badge,
  type Achievement,
} from '../../Utils/GDevelopServices/Badge';

import AchievementList from './AchievementList';
import Trophy from '../../UI/CustomSvgIcons/Trophy';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';

type Props = {|
  badges: ?Array<Badge>,
|};

const styles = {
  summary: {
    textAlign: 'center',
  },
  leftContainer: {
    flex: 1,
    margin: '20px',
  },
  rightContainer: {
    flex: 2,
  },
};

const UserAchievements = ({ badges }: Props) => {
  const [achievements, setAchievements] = useState<?Array<Achievement>>(null);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const windowWidth = useResponsiveWindowWidth();

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
        {displayError ? (
          <Line>
            <AlertMessage kind="error">
              <Trans>Unable to display your achievements for now.</Trans>{' '}
              <Trans>
                Please check your internet connection or try again later.
              </Trans>
            </AlertMessage>
          </Line>
        ) : (
          <>
            <div style={styles.leftContainer}>
              <div
                style={{
                  ...styles.summary,
                  padding: windowWidth === 'small' ? '0 20' : '20',
                }}
              >
                <Trophy color="primary" fontSize="large" />
                {badges && achievements && (
                  <Text size="title">
                    <Trans>
                      {badges.length}/{achievements.length} achievements
                    </Trans>
                  </Text>
                )}
              </div>
            </div>
            <div style={styles.rightContainer}>
              {badges && achievements && (
                <AchievementList badges={badges} achievements={achievements} />
              )}
            </div>
          </>
        )}
      </ResponsiveLineStackLayout>
    </Column>
  );
};

export default UserAchievements;
