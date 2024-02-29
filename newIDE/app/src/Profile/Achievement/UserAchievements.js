// @flow

import { Trans } from '@lingui/macro';
import React, { useState, useEffect, useCallback } from 'react';
import AlertMessage from '../../UI/AlertMessage';

import { Line } from '../../UI/Grid';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import {
  getAchievements,
  type Badge,
  type Achievement,
} from '../../Utils/GDevelopServices/Badge';

import AchievementList from './AchievementList';
import Trophy from '../../UI/CustomSvgIcons/Trophy';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import PlaceholderLoader from '../../UI/PlaceholderLoader';

type Props = {|
  badges: ?Array<Badge>,
  displayUnclaimedAchievements: boolean,
  displayNotifications: boolean,
|};

const styles = {
  summary: {
    textAlign: 'center',
  },
  leftContainer: {
    flex: 1,
    margin: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    flex: 2,
  },
};

const UserAchievements = ({
  badges,
  displayUnclaimedAchievements,
  displayNotifications,
}: Props) => {
  const [achievements, setAchievements] = useState<?Array<Achievement>>(null);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const { isMobile } = useResponsiveWindowSize();

  const fetchAchievements = useCallback(async () => {
    try {
      setDisplayError(false);
      const achievements = await getAchievements();
      setAchievements(achievements);
    } catch (err) {
      console.error(`Error when fetching achievements: ${err}`);
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
      ) : !!badges && !!achievements ? (
        <>
          <div style={styles.leftContainer}>
            <div
              style={{
                ...styles.summary,
                padding: isMobile ? '0 20' : '20',
              }}
            >
              <Trophy color="secondary" fontSize="large" />
              <Text size="block-title">
                <Trans>
                  {badges.length}/{achievements.length} achievements
                </Trans>
                {badges.length === 0 && (
                  <>
                    {' '}
                    <Trans>(yet!)</Trans>
                  </>
                )}
              </Text>
            </div>
          </div>
          {badges.length > 0 && (
            <div style={styles.rightContainer}>
              {badges && achievements && (
                <AchievementList
                  badges={badges}
                  achievements={achievements}
                  displayUnclaimedAchievements={displayUnclaimedAchievements}
                  displayNotifications={displayNotifications}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <PlaceholderLoader />
      )}
    </ResponsiveLineStackLayout>
  );
};

export default UserAchievements;
