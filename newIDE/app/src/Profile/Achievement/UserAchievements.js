// @flow

import { Trans } from '@lingui/macro';
import React from 'react';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import {
  type Badge,
  type Achievement,
} from '../../Utils/GDevelopServices/Badge';

import AchievementList from './AchievementList';
import Trophy from '../../UI/CustomSvgIcons/Trophy';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { Column } from '../../UI/Grid';

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

type Props = {|
  achievements: ?Array<Achievement>,
  badges: ?Array<Badge>,
|};

const UserAchievements = ({ achievements, badges }: Props) => {
  const { isMobile } = useResponsiveWindowSize();

  return (
    <Column expand noMargin>
      <Text size="block-title">
        <Trans>Achievements</Trans>
      </Text>
      <ResponsiveLineStackLayout>
        {!!badges && !!achievements ? (
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
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <PlaceholderLoader />
        )}
      </ResponsiveLineStackLayout>
    </Column>
  );
};

export default UserAchievements;
